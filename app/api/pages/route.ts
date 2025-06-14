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
                modules: {
                    orderBy: { order: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(pages)
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
        const { title, description, slug, seoTitle, seoDescription, isActive } = body

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

        const page = await prisma.page.create({
            data: {
                title,
                description,
                slug,
                seoTitle,
                seoDescription,
                isActive: isActive ?? true
            },
            include: {
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