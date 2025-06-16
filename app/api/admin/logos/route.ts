import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        let logos = await prisma.globalLogos.findFirst()

        if (!logos) {
            // İlk kez erişiliyorsa boş kayıt oluştur
            logos = await prisma.globalLogos.create({
                data: {}
            })
        }

        return NextResponse.json(logos)
    } catch (error) {
        console.error("Error fetching logos:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { logo, footerLogo, favicon, placeholder } = body

        let logos = await prisma.globalLogos.findFirst()

        if (!logos) {
            // İlk kez oluşturuluyorsa
            logos = await prisma.globalLogos.create({
                data: {
                    logo,
                    footerLogo,
                    favicon,
                    placeholder
                }
            })
        } else {
            // Güncelleme
            logos = await prisma.globalLogos.update({
                where: { id: logos.id },
                data: {
                    logo,
                    footerLogo,
                    favicon,
                    placeholder,
                    updatedAt: new Date()
                }
            })
        }

        return NextResponse.json(logos)
    } catch (error) {
        console.error("Error updating logos:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
} 