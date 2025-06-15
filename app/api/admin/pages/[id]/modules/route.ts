import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface RouteParams {
    params: Promise<{ id: string }>
}

// POST - Sayfaya yeni modül ekle
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Yetkisiz erişim" },
                { status: 401 }
            )
        }

        const { id } = await params
        const { type, content, order, languageId } = await request.json()

        // Global page'i kontrol et
        const globalPage = await prisma.globalPage.findUnique({
            where: { id },
            include: {
                contents: {
                    include: {
                        language: true
                    }
                }
            }
        })

        if (!globalPage) {
            return NextResponse.json(
                { error: "Sayfa bulunamadı" },
                { status: 404 }
            )
        }

        // Eğer languageId belirtilmemişse, varsayılan dili kullan
        let targetLanguageId = languageId
        if (!targetLanguageId) {
            const defaultLanguage = await prisma.language.findFirst({
                where: { isDefault: true }
            })
            targetLanguageId = defaultLanguage?.id
        }

        if (!targetLanguageId) {
            return NextResponse.json(
                { error: "Dil bulunamadı" },
                { status: 400 }
            )
        }

        // Page content'i bul veya oluştur
        let pageContent = await prisma.pageContent.findFirst({
            where: {
                globalPageId: id,
                languageId: targetLanguageId
            }
        })

        if (!pageContent) {
            // Eğer page content yoksa oluştur
            pageContent = await prisma.pageContent.create({
                data: {
                    globalPageId: id,
                    languageId: targetLanguageId,
                    title: "Yeni Sayfa",
                    description: ""
                }
            })
        }

        // Modülü oluştur
        const newModule = await prisma.pageModule.create({
            data: {
                pageContentId: pageContent.id,
                languageId: targetLanguageId,
                type,
                content: content as any,
                order: order || 0,
                isActive: true
            }
        })

        return NextResponse.json({
            module: newModule,
            message: "Modül başarıyla eklendi"
        }, { status: 201 })

    } catch (error) {
        console.error("Error creating module:", error)
        return NextResponse.json(
            { error: "Modül oluşturulurken hata oluştu" },
            { status: 500 }
        )
    }
} 