import { prisma } from '@/lib/prisma'
import { ClientNavbarWrapper } from './client-navbar-wrapper'

interface ServerNavbarProps {
    currentLanguage: string
}

async function getNavbarData(languageCode: string) {
    try {
        // Server-side'da direkt veritabanından al
        const language = await prisma.language.findUnique({
            where: { code: languageCode }
        })

        if (!language) {
            return { pages: [], language: null }
        }

        const globalPages = await prisma.globalPage.findMany({
            where: {
                isActive: true,
                contents: {
                    some: {
                        languageId: language.id
                    }
                }
            },
            include: {
                contents: {
                    where: { languageId: language.id },
                    select: {
                        title: true,
                        slug: true
                    }
                },
                children: {
                    where: { isActive: true },
                    select: {
                        id: true,
                        slug: true,
                        order: true,
                        contents: {
                            where: { languageId: language.id },
                            select: {
                                title: true,
                                slug: true
                            }
                        }
                    },
                    orderBy: { order: 'asc' }
                }
            },
            orderBy: { order: 'asc' }
        })

        const navbarPages = globalPages.map(globalPage => {
            const content = globalPage.contents[0]

            return {
                id: globalPage.id,
                slug: content?.slug || globalPage.slug,
                title: content?.title || 'Başlık Yok',
                parentId: globalPage.parentId,
                order: globalPage.order,
                children: globalPage.children.map(child => ({
                    id: child.id,
                    slug: child.contents[0]?.slug || child.slug,
                    title: child.contents[0]?.title || 'Başlık Yok',
                    parentId: globalPage.id,
                    order: child.order
                }))
            }
        })

        return {
            pages: navbarPages,
            language: {
                id: language.id,
                code: language.code,
                name: language.name,
                flag: language.flag,
                isDefault: language.isDefault,
                isActive: language.isActive
            }
        }
    } catch (error) {
        console.error('Database error:', error)
        return { pages: [], language: null }
    }
}

export async function ServerNavbar({ currentLanguage }: ServerNavbarProps) {
    const navbarData = await getNavbarData(currentLanguage)

    return (
        <ClientNavbarWrapper
            pages={navbarData.pages}
            currentLanguage={navbarData.language}
        />
    )
} 