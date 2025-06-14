import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Tek sayfa getir
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const page = await prisma.page.findUnique({
            where: { id: params.id },
            include: {
                modules: {
                    orderBy: { order: 'asc' }
                }
            }
        })

        if (!page) {
            return NextResponse.json({ error: "Sayfa bulunamadı" }, { status: 404 })
        }

        return NextResponse.json(page)
    } catch (error) {
        console.error("Error fetching page:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// PATCH - Sayfa güncelle
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { title, description, slug, seoTitle, seoDescription, isActive } = body

        // Eğer slug değiştiriliyorsa, başka sayfa tarafından kullanılıp kullanılmadığını kontrol et
        if (slug) {
            const existingPage = await prisma.page.findFirst({
                where: {
                    slug,
                    id: { not: params.id }
                }
            })

            if (existingPage) {
                return NextResponse.json(
                    { error: "Bu slug başka bir sayfa tarafından kullanılıyor" },
                    { status: 400 }
                )
            }
        }

        const page = await prisma.page.update({
            where: { id: params.id },
            data: {
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description }),
                ...(slug !== undefined && { slug }),
                ...(seoTitle !== undefined && { seoTitle }),
                ...(seoDescription !== undefined && { seoDescription }),
                ...(isActive !== undefined && { isActive }),
            },
            include: {
                modules: {
                    orderBy: { order: 'asc' }
                }
            }
        })

        return NextResponse.json(page)
    } catch (error) {
        console.error("Error updating page:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// DELETE - Sayfa sil
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Sayfa var mı kontrol et
        const existingPage = await prisma.page.findUnique({
            where: { id: params.id }
        })

        if (!existingPage) {
            return NextResponse.json({ error: "Sayfa bulunamadı" }, { status: 404 })
        }

        // Sayfayı sil (modüller cascade ile silinecek)
        await prisma.page.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ message: "Sayfa başarıyla silindi" })
    } catch (error) {
        console.error("Error deleting page:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
} 