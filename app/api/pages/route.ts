import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Tüm sayfaları getir
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const languageCode = searchParams.get('language') || 'tr'

        // Dil bilgisini al
        const language = await prisma.language.findUnique({
            where: { code: languageCode }
        })

        if (!language) {
            return NextResponse.json(
                { error: "Dil bulunamadı" },
                { status: 404 }
            )
        }

        // Global sayfaları ve içeriklerini getir
        const globalPages = await prisma.globalPage.findMany({
            where: { isActive: true },
            include: {
                contents: {
                    where: { languageId: language.id },
                    include: {
                        language: {
                            select: {
                                id: true,
                                code: true,
                                name: true,
                                flag: true
                            }
                        },
                        modules: {
                            where: { isActive: true },
                            orderBy: { order: 'asc' }
                        }
                    }
                },
                parent: {
                    select: {
                        id: true,
                        slug: true,
                        contents: {
                            where: { languageId: language.id },
                            select: {
                                title: true
                            }
                        }
                    }
                },
                children: {
                    where: { isActive: true },
                    select: {
                        id: true,
                        slug: true,
                        order: true,
                        contents: {
                            where: { languageId: language.id },
                            select: {
                                title: true
                            }
                        }
                    },
                    orderBy: { order: 'asc' }
                }
            },
            orderBy: { order: 'asc' }
        })

        // Response formatını düzenle
        const formattedPages = globalPages.map(globalPage => {
            const content = globalPage.contents[0] // Her dil için bir içerik olmalı

            return {
                id: globalPage.id,
                slug: globalPage.slug,
                parentId: globalPage.parentId,
                order: globalPage.order,
                isActive: globalPage.isActive,
                createdAt: globalPage.createdAt,
                updatedAt: globalPage.updatedAt,
                // İçerik bilgileri
                title: content?.title || 'Başlık Yok',
                description: content?.description,
                seoTitle: content?.seoTitle,
                seoDescription: content?.seoDescription,
                language: content?.language,
                modules: content?.modules || [],
                // İlişkiler
                parent: globalPage.parent ? {
                    id: globalPage.parent.id,
                    slug: globalPage.parent.slug,
                    title: globalPage.parent.contents[0]?.title || 'Başlık Yok'
                } : null,
                children: globalPage.children.map(child => ({
                    id: child.id,
                    slug: child.slug,
                    order: child.order,
                    title: child.contents[0]?.title || 'Başlık Yok'
                }))
            }
        })

        return NextResponse.json({
            pages: formattedPages,
            language: language,
            total: formattedPages.length
        })
    } catch (error) {
        console.error("Error fetching pages:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// POST - Yeni sayfa oluştur
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Yetkisiz erişim" },
                { status: 401 }
            )
        }

        const {
            slug,
            parentId,
            contents // { languageId, title, description, seoTitle, seoDescription }[]
        } = await request.json()

        if (!slug || !contents || !Array.isArray(contents) || contents.length === 0) {
            return NextResponse.json(
                { error: "Slug ve en az bir dil içeriği gereklidir" },
                { status: 400 }
            )
        }

        // Slug kontrolü
        const existingGlobalPage = await prisma.globalPage.findUnique({
            where: { slug }
        })

        if (existingGlobalPage) {
            return NextResponse.json(
                { error: "Bu slug zaten kullanılıyor" },
                { status: 400 }
            )
        }

        // Parent kontrolü
        if (parentId) {
            const parentPage = await prisma.globalPage.findUnique({
                where: { id: parentId }
            })

            if (!parentPage) {
                return NextResponse.json(
                    { error: "Üst sayfa bulunamadı" },
                    { status: 400 }
                )
            }
        }

        // Sıra hesapla
        const sameLevelPagesCount = await prisma.globalPage.count({
            where: {
                parentId: parentId || null
            }
        })

        // Transaction ile global sayfa ve içerikleri oluştur
        const result = await prisma.$transaction(async (tx) => {
            // Global sayfa oluştur
            const globalPage = await tx.globalPage.create({
                data: {
                    slug,
                    parentId: parentId || null,
                    order: sameLevelPagesCount,
                    isActive: true
                }
            })

            // Her dil için içerik oluştur
            const createdContents = []
            for (const contentData of contents) {
                const { languageId, title, description, seoTitle, seoDescription } = contentData

                // Dil kontrolü
                const language = await tx.language.findUnique({
                    where: { id: languageId }
                })

                if (!language) {
                    throw new Error(`Dil bulunamadı: ${languageId}`)
                }

                const pageContent = await tx.pageContent.create({
                    data: {
                        globalPageId: globalPage.id,
                        languageId,
                        title,
                        description,
                        seoTitle,
                        seoDescription
                    },
                    include: {
                        language: {
                            select: {
                                id: true,
                                code: true,
                                name: true,
                                flag: true
                            }
                        }
                    }
                })

                createdContents.push(pageContent)
            }

            return { globalPage, contents: createdContents }
        })

        return NextResponse.json({
            page: result.globalPage,
            contents: result.contents,
            message: `Sayfa ${result.contents.length} dilde oluşturuldu`
        }, { status: 201 })

    } catch (error) {
        console.error("Error creating page:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
} 