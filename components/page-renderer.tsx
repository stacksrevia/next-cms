import { ViraModuleRenderer } from "./vira-module-renderer"
import { ViraNavbar } from "./vira-navbar"
import { ViraFooter } from "./vira-footer"
import { prisma } from "@/lib/prisma"
import styles from "@/styles/page-renderer.module.css"

interface Page {
    id: string
    title: string
    description?: string
    slug: string
    seoTitle?: string
    seoDescription?: string
    isActive: boolean
    createdAt: string
    updatedAt: string
    modules: PageModule[]
}

interface PageModule {
    id: string
    type: string
    order: number
    content: any
    isActive: boolean
}

interface PageRendererProps {
    page: Page
}

async function getNavPages() {
    try {
        const pages = await prisma.page.findMany({
            where: { isActive: true },
            select: {
                id: true,
                title: true,
                slug: true,
                parentId: true,
                order: true
            },
            orderBy: { order: 'asc' }
        })
        return pages
    } catch (error) {
        console.error("Error fetching nav pages:", error)
        return []
    }
}

export async function PageRenderer({ page }: PageRendererProps) {
    const navPages = await getNavPages()

    return (
        <div className={styles.viraPage}>
            {/* Navigation */}
            <ViraNavbar pages={navPages} />

            {/* Page Header - Optional, can be hidden if first module is HERO */}
            {page.modules.length === 0 || page.modules[0]?.type !== "HERO" ? (
                <div className={styles.viraPageHeader}>
                    <div className={styles.viraPageHeaderContainer}>
                        <h1 className={styles.viraPageTitle}>{page.title}</h1>
                        {page.description && (
                            <p className={styles.viraPageDescription}>{page.description}</p>
                        )}
                    </div>
                </div>
            ) : null}

            {/* Page Modules */}
            <div className={styles.viraPageContent}>
                {page.modules.length === 0 ? (
                    <div className={styles.viraPageEmpty}>
                        <div className={styles.viraPageEmptyContainer}>
                            <h2 className={styles.viraPageEmptyTitle}>İçerik Hazırlanıyor</h2>
                            <p className={styles.viraPageEmptyText}>
                                Bu sayfa henüz içerik modülleri ile doldurulmamış.
                            </p>
                        </div>
                    </div>
                ) : (
                    page.modules.map((module) => (
                        <ViraModuleRenderer key={module.id} module={module} />
                    ))
                )}
            </div>

            {/* Footer */}
            <ViraFooter />
        </div>
    )
} 