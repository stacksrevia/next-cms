import { Navbar } from '@/components/navbar'
import { prisma } from '@/lib/prisma'

interface NavbarWrapperProps {
    currentLanguage: string
}

export async function NavbarWrapper({ currentLanguage }: NavbarWrapperProps) {
    try {
        // Sayfaları, dilleri ve anasayfa bilgisini getir
        const [pageContents, languages, homePage] = await Promise.all([
            prisma.pageContent.findMany({
                where: {
                    isActive: true,
                    language: {
                        code: currentLanguage
                    }
                },
                include: {
                    language: true,
                    globalPage: {
                        include: {
                            children: {
                                include: {
                                    contents: {
                                        where: {
                                            isActive: true,
                                            language: {
                                                code: currentLanguage
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    globalPage: {
                        order: 'asc'
                    }
                }
            }),
            prisma.language.findMany({
                where: { isActive: true },
                orderBy: { name: 'asc' }
            }),
            // Anasayfayı bul (isHomePage=true veya order=0)
            prisma.globalPage.findFirst({
                where: {
                    OR: [
                        { isHomePage: true },
                        { order: 0 }
                    ],
                    isActive: true
                },
                include: {
                    contents: {
                        where: {
                            language: {
                                code: currentLanguage
                            }
                        }
                    }
                }
            })
        ])

        // Mevcut dili bul
        const currentLang = languages.find(lang => lang.code === currentLanguage) ||
            languages.find(lang => lang.isDefault) ||
            null

        // Sayfaları navbar formatına dönüştür
        const navPages = pageContents
            .filter((content: any) => !content.globalPage.parentId) // Sadece root sayfalar
            .map((content: any) => ({
                id: content.globalPage.id,
                title: content.title,
                slug: content.slug,
                parentId: content.globalPage.parentId,
                order: content.globalPage.order,
                children: content.globalPage.children
                    ?.filter((child: any) => child.contents.length > 0)
                    .map((child: any) => ({
                        id: child.id,
                        title: child.contents[0]?.title || '',
                        slug: child.contents[0]?.slug || '',
                        parentId: child.parentId,
                        order: child.order
                    })) || []
            }))

        // Anasayfa slug'ını belirle
        const homePageSlug = homePage?.contents[0]?.slug || 'anasayfa'

        return <Navbar
            pages={navPages}
            currentLanguage={currentLang}
            homePageSlug={homePageSlug}
        />
    } catch (error) {
        console.error('Error loading navbar:', error)
        return <Navbar pages={[]} currentLanguage={null} homePageSlug="anasayfa" />
    }
} 