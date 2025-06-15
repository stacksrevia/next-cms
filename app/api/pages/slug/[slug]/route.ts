import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

interface RouteParams {
    params: Promise<{ slug: string }>
}

// GET - Slug ile sayfayı getir
export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { slug } = await params
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

        // Global sayfayı slug ile bul (dile özel slug)
        const globalPage = await prisma.globalPage.findFirst({
            where: {
                isActive: true,
                contents: {
                    some: {
                        slug: slug,
                        languageId: language.id
                    }
                }
            },
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
                                title: true,
                                slug: true
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
                                title: true,
                                slug: true
                            }
                        }
                    },
                    orderBy: { order: 'asc' }
                }
            }
        })

        if (!globalPage) {
            return NextResponse.json(
                { error: "Sayfa bulunamadı" },
                { status: 404 }
            )
        }

        const content = globalPage.contents[0]

        // İçerik bu dilde yoksa 404
        if (!content) {
            return NextResponse.json(
                { error: "Bu sayfa seçilen dilde mevcut değil" },
                { status: 404 }
            )
        }

        const formattedPage = {
            id: globalPage.id,
            slug: content.slug,
            parentId: globalPage.parentId,
            order: globalPage.order,
            isActive: globalPage.isActive,
            createdAt: globalPage.createdAt,
            updatedAt: globalPage.updatedAt,
            // İçerik bilgileri
            title: content.title,
            description: content.description,
            seoTitle: content.seoTitle,
            seoDescription: content.seoDescription,
            language: content.language,
            modules: content.modules,
            // İlişkiler
            parent: globalPage.parent ? {
                id: globalPage.parent.id,
                slug: globalPage.parent.contents[0]?.slug || globalPage.parent.slug,
                title: globalPage.parent.contents[0]?.title || 'Başlık Yok'
            } : null,
            children: globalPage.children.map(child => ({
                id: child.id,
                slug: child.contents[0]?.slug || child.slug,
                order: child.order,
                title: child.contents[0]?.title || 'Başlık Yok'
            }))
        }

        return NextResponse.json(formattedPage)
    } catch (error) {
        console.error("Error fetching page by slug:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
} 