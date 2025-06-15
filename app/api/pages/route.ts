import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Tüm sayfaları listele
export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const pages = await prisma.page.findMany({
            include: {
                parent: {
                    select: {
                        id: true,
                        title: true,
                        slug: true
                    }
                },
                children: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        order: true
                    },
                    orderBy: { order: 'asc' }
                },
                modules: {
                    orderBy: { order: 'asc' }
                }
            },
            orderBy: [
                { order: 'asc' },
                { createdAt: 'desc' }
            ]
        })

        return NextResponse.json({ pages })
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

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { title, description, slug, seoTitle, seoDescription, parentId, isActive } = body

        // Slug kontrolü
        const existingPage = await prisma.page.findUnique({
            where: { slug }
        })

        if (existingPage) {
            return NextResponse.json(
                { error: "Bu slug zaten kullanılıyor" },
                { status: 400 }
            )
        }

        // Parent sayfa kontrolü
        if (parentId) {
            const parentPage = await prisma.page.findUnique({
                where: { id: parentId }
            })

            if (!parentPage) {
                return NextResponse.json(
                    { error: "Üst sayfa bulunamadı" },
                    { status: 400 }
                )
            }
        }

        // Otomatik sıra hesaplama - aynı seviyedeki sayfa sayısı
        const sameLevelPagesCount = await prisma.page.count({
            where: {
                parentId: parentId || null
            }
        })

        const page = await prisma.page.create({
            data: {
                title,
                description,
                slug,
                seoTitle,
                seoDescription,
                parentId: parentId || null,
                order: sameLevelPagesCount, // 0'dan başlayarak otomatik sıra
                isActive: isActive ?? true
            },
            include: {
                parent: {
                    select: {
                        id: true,
                        title: true,
                        slug: true
                    }
                },
                children: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        order: true
                    },
                    orderBy: { order: 'asc' }
                },
                modules: true
            }
        })

        return NextResponse.json(page, { status: 201 })
    } catch (error) {
        console.error("Error creating page:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
} 