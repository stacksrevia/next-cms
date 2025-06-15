import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - Public sayfaları getir (navbar için)
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

        // Aktif sayfaları getir
        const globalPages = await prisma.globalPage.findMany({
            where: {
                isActive: true,
                contents: {
                    some: {
                        languageId: language.id
                    }
                }
            },
            include: {
                contents: {
                    where: { languageId: language.id },
                    select: {
                        title: true,
                        description: true
                    }
                },
                parent: {
                    select: {
                        id: true,
                        slug: true
                    }
                },
                children: {
                    where: {
                        isActive: true,
                        contents: {
                            some: {
                                languageId: language.id
                            }
                        }
                    },
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

        // Navbar için format
        const navbarPages = globalPages.map(globalPage => {
            const content = globalPage.contents[0]

            return {
                id: globalPage.id,
                slug: globalPage.slug,
                title: content?.title || 'Başlık Yok',
                description: content?.description,
                parentId: globalPage.parentId,
                order: globalPage.order,
                children: globalPage.children.map(child => ({
                    id: child.id,
                    slug: child.slug,
                    title: child.contents[0]?.title || 'Başlık Yok',
                    order: child.order
                }))
            }
        })

        return NextResponse.json({
            pages: navbarPages,
            language: {
                id: language.id,
                code: language.code,
                name: language.name,
                flag: language.flag
            }
        })
    } catch (error) {
        console.error("Error fetching public pages:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
} 