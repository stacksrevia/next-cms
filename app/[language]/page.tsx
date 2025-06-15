import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { PageRenderer } from '@/components/page-renderer'
import { prisma } from '@/lib/prisma'

interface HomePageProps {
    params: Promise<{
        language: string
    }>
}

// Ana sayfayı getir (anasayfa slug'ı ile)
async function getHomePage(language: string) {
    try {
        // Server-side'da direkt veritabanından al
        const languageRecord = await prisma.language.findUnique({
            where: { code: language }
        })

        if (!languageRecord) {
            return null
        }

        // Ana sayfayı bul - parentId null olan ve order 0 olan sayfa (genellikle ana sayfa)
        const globalPage = await prisma.globalPage.findFirst({
            where: {
                isActive: true,
                parentId: null,
                order: 0,
                contents: {
                    some: {
                        languageId: languageRecord.id
                    }
                }
            },
            include: {
                contents: {
                    where: { languageId: languageRecord.id },
                    include: {
                        language: {
                            select: {
                                id: true,
                                code: true,
                                name: true,
                                flag: true
                            }
                        },
                        modules: {
                            where: { isActive: true },
                            orderBy: { order: 'asc' }
                        }
                    }
                },
                parent: {
                    select: {
                        id: true,
                        slug: true,
                        contents: {
                            where: { languageId: languageRecord.id },
                            select: {
                                title: true,
                                slug: true
                            }
                        }
                    }
                },
                children: {
                    where: { isActive: true },
                    select: {
                        id: true,
                        slug: true,
                        order: true,
                        contents: {
                            where: { languageId: languageRecord.id },
                            select: {
                                title: true,
                                slug: true
                            }
                        }
                    },
                    orderBy: { order: 'asc' }
                }
            }
        })

        if (!globalPage) {
            return null
        }

        const content = globalPage.contents[0]

        // İçerik bu dilde yoksa null döndür
        if (!content) {
            return null
        }

        const formattedPage = {
            id: globalPage.id,
            slug: content.slug,
            parentId: globalPage.parentId || undefined,
            order: globalPage.order,
            isActive: globalPage.isActive,
            createdAt: globalPage.createdAt.toISOString(),
            updatedAt: globalPage.updatedAt.toISOString(),
            // İçerik bilgileri
            title: content.title,
            description: content.description || undefined,
            seoTitle: content.seoTitle || undefined,
            seoDescription: content.seoDescription || undefined,
            language: content.language,
            modules: content.modules,
            // İlişkiler
            parent: globalPage.parent ? {
                id: globalPage.parent.id,
                slug: globalPage.parent.contents[0]?.slug || globalPage.parent.slug,
                title: globalPage.parent.contents[0]?.title || 'Başlık Yok'
            } : null,
            children: globalPage.children.map(child => ({
                id: child.id,
                slug: child.contents[0]?.slug || child.slug,
                order: child.order,
                title: child.contents[0]?.title || 'Başlık Yok'
            }))
        }

        return formattedPage
    } catch (error) {
        console.error('Error fetching home page:', error)
        return null
    }
}

// Metadata oluştur
export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
    const { language } = await params
    const page = await getHomePage(language)

    if (!page) {
        return {
            title: 'Anasayfa',
            description: 'Web sitesinin anasayfası'
        }
    }

    return {
        title: page.seoTitle || page.title,
        description: page.seoDescription || page.description,
        openGraph: {
            title: page.seoTitle || page.title,
            description: page.seoDescription || page.description,
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: page.seoTitle || page.title,
            description: page.seoDescription || page.description,
        }
    }
}

// Ana sayfa komponenti
export default async function LanguageHomePage({ params }: HomePageProps) {
    const { language } = await params
    const page = await getHomePage(language)

    if (!page) {
        notFound()
    }

    return <PageRenderer page={page} languageCode={language} />
}

// Generate static params for build time
export async function generateStaticParams() {
    try {
        const languages = await prisma.language.findMany({
            where: { isActive: true },
            select: { code: true }
        })

        return languages.map((language) => ({
            language: language.code,
        }))
    } catch (error) {
        console.error("Error generating static params:", error)
        return []
    }
} 