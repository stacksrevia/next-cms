import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST - Sayfaya yeni modül ekle
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { type, order, content } = body

        // Sayfa var mı kontrol et
        const page = await prisma.page.findUnique({
            where: { id: params.id }
        })

        if (!page) {
            return NextResponse.json({ error: "Sayfa bulunamadı" }, { status: 404 })
        }

        // Modül oluştur
        const module = await prisma.pageModule.create({
            data: {
                pageId: params.id,
                type,
                order: order || 0,
                content: content || {},
                isActive: true
            }
        })

        return NextResponse.json(module, { status: 201 })
    } catch (error) {
        console.error("Error creating module:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// GET - Sayfa modüllerini listele
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const modules = await prisma.pageModule.findMany({
            where: { pageId: params.id },
            orderBy: { order: 'asc' }
        })

        return NextResponse.json(modules)
    } catch (error) {
        console.error("Error fetching modules:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
} 