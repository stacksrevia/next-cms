import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { clearLanguageCache } from "@/middleware"

// GET - Tüm dilleri getir
export async function GET() {
    try {
        const languages = await prisma.language.findMany({
            orderBy: [
                { isDefault: 'desc' },
                { name: 'asc' }
            ]
        })

        return NextResponse.json({
            languages: languages.map(lang => ({
                id: lang.id,
                code: lang.code,
                name: lang.name,
                flag: lang.flag,
                isDefault: lang.isDefault,
                isActive: lang.isActive
            }))
        })
    } catch (error) {
        console.error('Error fetching languages:', error)
        return NextResponse.json(
            { error: 'Diller getirilirken hata oluştu' },
            { status: 500 }
        )
    }
}

// POST - Yeni dil ekle
export async function POST(request: NextRequest) {
    try {
        const { code, name, flag, isDefault = false } = await request.json()

        if (!code || !name || !flag) {
            return NextResponse.json(
                { error: 'Dil kodu, adı ve bayrağı gereklidir' },
                { status: 400 }
            )
        }

        // Transaction ile tüm işlemleri güvenli şekilde yap
        const result = await prisma.$transaction(async (tx) => {
            // Eğer bu varsayılan dil olacaksa, diğerlerini varsayılan olmaktan çıkar
            if (isDefault) {
                await tx.language.updateMany({
                    where: { isDefault: true },
                    data: { isDefault: false }
                })
            }

            // Yeni dili oluştur
            const newLanguage = await tx.language.create({
                data: {
                    code: code.toLowerCase(),
                    name,
                    flag: flag.toUpperCase(),
                    isDefault,
                    isActive: true
                }
            })

            // Eğer bu ilk dil değilse, mevcut global sayfaların içeriklerini kopyala
            const existingLanguages = await tx.language.findMany({
                where: { id: { not: newLanguage.id } }
            })

            if (existingLanguages.length > 0) {
                // Varsayılan dili bul (içerik kopyalamak için)
                const defaultLanguage = existingLanguages.find(lang => lang.isDefault) || existingLanguages[0]

                // Tüm global sayfaları getir
                const globalPages = await tx.globalPage.findMany({
                    include: {
                        contents: {
                            where: { languageId: defaultLanguage.id },
                            include: {
                                modules: {
                                    orderBy: { order: 'asc' }
                                }
                            }
                        }
                    }
                })

                console.log(`📄 ${globalPages.length} global sayfa bulundu, ${newLanguage.name} dili için kopyalanıyor...`)

                // Her global sayfa için yeni dilde içerik oluştur
                for (const globalPage of globalPages) {
                    const defaultContent = globalPage.contents[0]

                    if (defaultContent) {
                        console.log(`➕ ${globalPage.slug} için ${newLanguage.name} içeriği oluşturuluyor...`)

                        // Sayfa içeriğini kopyala
                        const newPageContent = await tx.pageContent.create({
                            data: {
                                globalPageId: globalPage.id,
                                languageId: newLanguage.id,
                                title: defaultContent.title,
                                description: defaultContent.description,
                                slug: defaultContent.slug,
                                seoTitle: defaultContent.seoTitle,
                                seoDescription: defaultContent.seoDescription
                            }
                        })

                        // Modülleri kopyala
                        for (const module of defaultContent.modules) {
                            await tx.pageModule.create({
                                data: {
                                    pageContentId: newPageContent.id,
                                    languageId: newLanguage.id,
                                    type: module.type,
                                    content: module.content as any,
                                    order: module.order,
                                    isActive: module.isActive
                                }
                            })
                        }

                        console.log(`  ✅ ${defaultContent.modules.length} modül kopyalandı`)
                    }
                }

                console.log(`🎉 ${newLanguage.name} dili için tüm içerikler kopyalandı!`)
            }

            return newLanguage
        })

        return NextResponse.json({
            message: 'Dil başarıyla eklendi ve tüm sayfa içerikleri kopyalandı',
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
        console.error('Error creating language:', error)

        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'Bu dil kodu zaten mevcut' },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'Dil oluşturulurken hata oluştu: ' + error.message },
            { status: 500 }
        )
    } finally {
        // Cache'i temizle ki yeni dil hemen görünsün
        clearLanguageCache()
    }
} 