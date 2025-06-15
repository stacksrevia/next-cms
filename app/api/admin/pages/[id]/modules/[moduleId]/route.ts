import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface RouteParams {
    params: Promise<{ id: string; moduleId: string }>
}

// PATCH - Modülü güncelle
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Yetkisiz erişim" },
                { status: 401 }
            )
        }

        const { id, moduleId } = await params
        const { content, languageId } = await request.json()

        // Modülü güncelle
        const updatedModule = await prisma.pageModule.update({
            where: {
                id: moduleId,
                pageContent: {
                    globalPageId: id,
                    languageId: languageId
                }
            },
            data: {
                content: content as any
            }
        })

        return NextResponse.json({
            module: updatedModule,
            message: "Modül başarıyla güncellendi"
        })

    } catch (error) {
        console.error("Error updating module:", error)
        return NextResponse.json(
            { error: "Modül güncellenirken hata oluştu" },
            { status: 500 }
        )
    }
}

// DELETE - Modülü sil
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Yetkisiz erişim" },
                { status: 401 }
            )
        }

        const { id, moduleId } = await params
        const { languageId } = await request.json()

        // Modülü sil
        await prisma.pageModule.delete({
            where: {
                id: moduleId,
                pageContent: {
                    globalPageId: id,
                    languageId: languageId
                }
            }
        })

        return NextResponse.json({
            message: "Modül başarıyla silindi"
        })

    } catch (error) {
        console.error("Error deleting module:", error)
        return NextResponse.json(
            { error: "Modül silinirken hata oluştu" },
            { status: 500 }
        )
    }
} 