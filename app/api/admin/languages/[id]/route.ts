import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { clearLanguageCache } from "@/middleware"

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET - Tek dil getir
export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = await params

        const language = await prisma.language.findUnique({
            where: { id }
        })

        if (!language) {
            return NextResponse.json(
                { error: 'Dil bulunamadı' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            language: {
                id: language.id,
                code: language.code,
                name: language.name,
                flag: language.flag,
                isDefault: language.isDefault,
                isActive: language.isActive
            }
        })
    } catch (error) {
        console.error('Error fetching language:', error)
        return NextResponse.json(
            { error: 'Dil getirilirken hata oluştu' },
            { status: 500 }
        )
    }
}

// PATCH - Dil güncelle
export async function PATCH(
    request: NextRequest,
    { params }: RouteParams
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
        const { code, name, flag, isDefault, isActive } = await request.json()

        // Mevcut dili kontrol et
        const existingLanguage = await prisma.language.findUnique({
            where: { id }
        })

        if (!existingLanguage) {
            return NextResponse.json(
                { error: 'Dil bulunamadı' },
                { status: 404 }
            )
        }

        // Varsayılan dil kontrolü - en az bir varsayılan dil olmalı
        if (existingLanguage.isDefault && isDefault === false) {
            const otherDefaultLanguages = await prisma.language.count({
                where: {
                    id: { not: id },
                    isDefault: true
                }
            })

            if (otherDefaultLanguages === 0) {
                return NextResponse.json(
                    { error: 'En az bir varsayılan dil olmalıdır' },
                    { status: 400 }
                )
            }
        }

        // Transaction ile güncelle
        const result = await prisma.$transaction(async (tx) => {
            // Eğer bu varsayılan dil olacaksa, diğerlerini varsayılan olmaktan çıkar
            if (isDefault && !existingLanguage.isDefault) {
                await tx.language.updateMany({
                    where: {
                        id: { not: id },
                        isDefault: true
                    },
                    data: { isDefault: false }
                })
            }

            // Dili güncelle
            const updatedLanguage = await tx.language.update({
                where: { id },
                data: {
                    ...(code && { code: code.toLowerCase() }),
                    ...(name && { name }),
                    ...(flag && { flag: flag.toUpperCase() }),
                    ...(isDefault !== undefined && { isDefault }),
                    ...(isActive !== undefined && { isActive })
                }
            })

            return updatedLanguage
        })

        console.log(`🔄 Dil güncellendi: ${result.name} (${result.code})`)

        return NextResponse.json({
            message: 'Dil başarıyla güncellendi',
            language: {
                id: result.id,
                code: result.code,
                name: result.name,
                flag: result.flag,
                isDefault: result.isDefault,
                isActive: result.isActive
            }
        })
    } catch (error: any) {
        console.error('Error updating language:', error)

        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'Bu dil kodu zaten mevcut' },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'Dil güncellenirken hata oluştu: ' + error.message },
            { status: 500 }
        )
    } finally {
        // Cache'i temizle ki değişiklik hemen görünsün
        clearLanguageCache()
    }
}

// DELETE - Dil sil
export async function DELETE(
    request: NextRequest,
    { params }: RouteParams
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

        // Mevcut dili kontrol et
        const existingLanguage = await prisma.language.findUnique({
            where: { id }
        })

        if (!existingLanguage) {
            return NextResponse.json(
                { error: 'Dil bulunamadı' },
                { status: 404 }
            )
        }

        // Varsayılan dil silinmeye çalışılıyorsa kontrol et
        if (existingLanguage.isDefault) {
            const totalLanguages = await prisma.language.count()

            if (totalLanguages <= 1) {
                return NextResponse.json(
                    { error: 'Son dil silinemez' },
                    { status: 400 }
                )
            }

            // Başka bir dili varsayılan yap
            const nextLanguage = await prisma.language.findFirst({
                where: {
                    id: { not: id },
                    isActive: true
                }
            })

            if (nextLanguage) {
                await prisma.language.update({
                    where: { id: nextLanguage.id },
                    data: { isDefault: true }
                })
                console.log(`🔄 Yeni varsayılan dil: ${nextLanguage.name}`)
            }
        }

        // Transaction ile sil
        await prisma.$transaction(async (tx) => {
            // Bu dile ait tüm sayfa modüllerini sil
            await tx.pageModule.deleteMany({
                where: { languageId: id }
            })

            // Bu dile ait tüm sayfa içeriklerini sil
            await tx.pageContent.deleteMany({
                where: { languageId: id }
            })

            // Dili sil
            await tx.language.delete({
                where: { id }
            })
        })

        console.log(`🗑️  Dil silindi: ${existingLanguage.name} (${existingLanguage.code})`)

        return NextResponse.json({
            message: 'Dil ve tüm ilgili içerikler başarıyla silindi'
        })
    } catch (error: any) {
        console.error('Error deleting language:', error)

        return NextResponse.json(
            { error: 'Dil silinirken hata oluştu: ' + error.message },
            { status: 500 }
        )
    } finally {
        // Cache'i temizle ki değişiklik hemen görünsün
        clearLanguageCache()
    }
} 