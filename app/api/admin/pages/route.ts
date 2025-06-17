import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Admin için tüm sayfaları getir
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Yetkisiz erişim" },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const languageId = searchParams.get('languageId')

        // Sayfaları getir
        const globalPages = await prisma.globalPage.findMany({
            include: {
                contents: {
                    ...(languageId && { where: { languageId } }),
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
                            ...(languageId && { where: { languageId } }),
                            select: {
                                title: true,
                                languageId: true
                            }
                        }
                    }
                },
                children: {
                    select: {
                        id: true,
                        slug: true,
                        order: true,
                        isActive: true,
                        contents: {
                            ...(languageId && { where: { languageId } }),
                            select: {
                                title: true,
                                languageId: true
                            }
                        }
                    },
                    orderBy: { order: 'asc' }
                }
            },
            orderBy: { order: 'asc' }
        })

        // Varsayılan dili bul
        const defaultLanguage = await prisma.language.findFirst({
            where: { isDefault: true }
        })

        // Admin formatı
        const adminPages = globalPages.map(globalPage => {
            // Eğer belirli bir dil seçildiyse o dilin içeriğini al
            // Yoksa varsayılan dilin içeriğini al
            const content = languageId
                ? globalPage.contents.find(c => c.languageId === languageId)
                : globalPage.contents.find(c => c.languageId === defaultLanguage?.id) || globalPage.contents[0]

            return {
                id: globalPage.id,
                slug: globalPage.slug,
                parentId: globalPage.parentId,
                order: globalPage.order,
                isActive: globalPage.isActive,
                createdAt: globalPage.createdAt,
                updatedAt: globalPage.updatedAt,
                // İçerik bilgileri
                title: content?.title || 'İçerik Yok',
                description: content?.description,
                seoTitle: content?.seoTitle,
                seoDescription: content?.seoDescription,
                language: content?.language,
                modules: content?.modules || [],
                // Tüm dillerdeki içerikler
                allContents: globalPage.contents,
                // İlişkiler
                parent: globalPage.parent ? {
                    id: globalPage.parent.id,
                    slug: globalPage.parent.slug,
                    title: languageId
                        ? globalPage.parent.contents.find(c => c.languageId === languageId)?.title || 'İçerik Yok'
                        : globalPage.parent.contents.find(c => c.languageId === defaultLanguage?.id)?.title || globalPage.parent.contents[0]?.title || 'İçerik Yok'
                } : null,
                children: globalPage.children.map(child => ({
                    id: child.id,
                    slug: child.slug,
                    order: child.order,
                    isActive: child.isActive,
                    title: languageId
                        ? child.contents.find(c => c.languageId === languageId)?.title || 'İçerik Yok'
                        : child.contents.find(c => c.languageId === defaultLanguage?.id)?.title || child.contents[0]?.title || 'İçerik Yok'
                }))
            }
        })

        return NextResponse.json({
            pages: adminPages,
            total: adminPages.length
        })
    } catch (error) {
        console.error("Error fetching admin pages:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// POST - Yeni sayfa oluştur (Admin)
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
            createForAllLanguages = false,
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

        // Eğer tüm diller için oluşturulacaksa
        let finalContents = contents
        if (createForAllLanguages) {
            const allLanguages = await prisma.language.findMany({
                where: { isActive: true }
            })

            const baseContent = contents[0]
            finalContents = allLanguages.map(lang => ({
                languageId: lang.id,
                title: baseContent.title,
                description: baseContent.description,
                seoTitle: baseContent.seoTitle,
                seoDescription: baseContent.seoDescription
            }))
        }

        // Transaction ile sayfa ve içerikleri oluştur
        const result = await prisma.$transaction(async (tx) => {
            // Sayfa oluştur
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
            for (const contentData of finalContents) {
                const { languageId, title, description, slug, seoTitle, seoDescription } = contentData

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
                        slug: slug || globalPage.slug, // Eğer slug verilmemişse global slug'ı kullan
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
            message: `Sayfa ${result.contents.length} dilde oluşturuldu - Dynamic rendering aktif`
        }, { status: 201 })

    } catch (error) {
        console.error("Error creating admin page:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
} 