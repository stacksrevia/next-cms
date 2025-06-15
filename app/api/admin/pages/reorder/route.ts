import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST - Sayfa sıralamasını güncelle (Admin)
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
                { error: 'pageOrders array gereklidir' },
                { status: 400 }
            )
        }

        // Transaction ile tüm güncellemeleri yap
        await prisma.$transaction(async (tx) => {
            for (const pageOrder of pageOrders) {
                await tx.globalPage.update({
                    where: { id: pageOrder.id },
                    data: { order: pageOrder.order }
                })
            }
        })

        return NextResponse.json({
            message: 'Sayfa sıralaması başarıyla güncellendi'
        })
    } catch (error) {
        console.error('Error reordering pages:', error)
        return NextResponse.json(
            { error: 'Sayfa sıralaması güncellenirken hata oluştu' },
            { status: 500 }
        )
    }
} 