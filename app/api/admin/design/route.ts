import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Global tasarım ayarlarını getir
export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // İlk global tasarım kaydını getir veya oluştur
        let design = await prisma.globalDesign.findFirst()

        if (!design) {
            design = await prisma.globalDesign.create({
                data: {
                    customCss: "",
                    customJs: "",
                },
            })
        }

        return NextResponse.json(design)
    } catch (error) {
        console.error("Error fetching global design:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// POST - Global tasarım ayarlarını güncelle
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { customCss, customJs } = await request.json()

        // İlk kaydı bul veya oluştur
        let design = await prisma.globalDesign.findFirst()

        if (!design) {
            design = await prisma.globalDesign.create({
                data: {
                    customCss: customCss || "",
                    customJs: customJs || "",
                },
            })
        } else {
            design = await prisma.globalDesign.update({
                where: { id: design.id },
                data: {
                    customCss: customCss || "",
                    customJs: customJs || "",
                },
            })
        }

        return NextResponse.json(design)
    } catch (error) {
        console.error("Error updating global design:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
} 