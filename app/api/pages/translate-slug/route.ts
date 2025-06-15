import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const currentSlug = searchParams.get('slug')
        const fromLanguage = searchParams.get('from')
        const toLanguage = searchParams.get('to')

        if (!currentSlug || !fromLanguage || !toLanguage) {
            return NextResponse.json(
                { error: 'Missing required parameters: slug, from, to' },
                { status: 400 }
            )
        }

        // Kaynak dili bul
        const sourceLanguage = await prisma.language.findUnique({
            where: { code: fromLanguage, isActive: true }
        })

        // Hedef dili bul
        const targetLanguage = await prisma.language.findUnique({
            where: { code: toLanguage, isActive: true }
        })

        if (!sourceLanguage || !targetLanguage) {
            return NextResponse.json(
                { error: 'Language not found' },
                { status: 404 }
            )
        }

        // Mevcut slug ile GlobalPage'i bul
        const currentPageContent = await prisma.pageContent.findFirst({
            where: {
                slug: currentSlug,
                languageId: sourceLanguage.id
            },
            include: {
                globalPage: {
                    include: {
                        contents: {
                            where: { languageId: targetLanguage.id }
                        }
                    }
                }
            }
        })

        if (!currentPageContent) {
            return NextResponse.json(
                { error: 'Page not found' },
                { status: 404 }
            )
        }

        // Hedef dildeki içeriği bul
        const targetContent = currentPageContent.globalPage.contents[0]

        if (!targetContent) {
            // Hedef dilde sayfa yoksa ana sayfaya yönlendir
            return NextResponse.json({
                slug: null,
                redirectToHome: true,
                message: 'Page not available in target language'
            })
        }

        return NextResponse.json({
            slug: targetContent.slug,
            redirectToHome: false
        })

    } catch (error) {
        console.error('Error translating slug:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 