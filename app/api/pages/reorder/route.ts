import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Yetkisiz erişim" },
                { status: 401 }
            )
        }

        const { pageOrders } = await request.json()

        if (!Array.isArray(pageOrders)) {
            return NextResponse.json(
                { error: "Geçersiz veri formatı" },
                { status: 400 }
            )
        }

        // Transaction ile tüm sayfa sıralarını güncelle
        await prisma.$transaction(
            pageOrders.map(({ id, order, parentId }) =>
                prisma.page.update({
                    where: { id },
                    data: {
                        order,
                        parentId: parentId || null
                    }
                })
            )
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Sayfa sıralama hatası:", error)
        return NextResponse.json(
            { error: "Sayfa sıralama güncellenirken hata oluştu" },
            { status: 500 }
        )
    }
} 