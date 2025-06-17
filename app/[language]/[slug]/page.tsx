import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { PageRenderer } from '@/components/page-renderer'
import { prisma } from '@/lib/prisma'

interface PageProps {
    params: Promise<{
        language: string
        slug: string
    }>
}

// Sayfayı getir
async function getPage(slug: string, language: string) {
    try {
        // Server-side'da direkt veritabanından al
        const languageRecord = await prisma.language.findUnique({
            where: { code: language }
        })

        if (!languageRecord) {
            return null
        }

        // Global sayfayı slug ile bul (dile özel slug)
        const globalPage = await prisma.globalPage.findFirst({
            where: {
                isActive: true,
                contents: {
                    some: {
                        slug: slug,
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
        console.error('Error fetching page:', error)
        return null
    }
}

// Metadata oluştur
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { language, slug } = await params
    const page = await getPage(slug, language)

    if (!page) {
        return {
            title: 'Sayfa Bulunamadı',
            description: 'Aradığınız sayfa bulunamadı.'
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

// Sayfa komponenti
export default async function PageSlug({ params }: PageProps) {
    const { language, slug } = await params
    const page = await getPage(slug, language)

    if (!page) {
        notFound()
    }

    return <PageRenderer page={page} languageCode={language} />
}

// DYNAMIC RENDERING - Her request'te fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0 