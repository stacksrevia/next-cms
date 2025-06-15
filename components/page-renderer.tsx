import { ServerNavbar } from "@/components/server-navbar"
import { ModuleRenderer } from "@/components/module-renderer"
import { prisma } from "@/lib/prisma"

interface GlobalPage {
    id: string
    title: string
    description?: string
    slug: string
    seoTitle?: string
    seoDescription?: string
    customCss?: string
    customJs?: string
    isActive: boolean
    createdAt: string
    updatedAt: string
    modules: PageModule[]
    language?: {
        id: string
        code: string
        name: string
        flag: string
    }
}

interface PageModule {
    id: string
    type: string
    order: number
    content: any
    isActive: boolean
}

interface PageRendererProps {
    page: {
        id: string
        title: string
        description?: string | null
        content?: string | null
        // Ana sayfa için direkt modules
        modules?: Array<{
            id: string
            type: string
            content: any
            order: number
            isActive?: boolean
        }>
        // Slug sayfaları için globalPage.modules
        globalPage?: {
            id: string
            slug: string
            modules: Array<{
                id: string
                type: string
                content: any
                order: number
                isActive?: boolean
            }>
        }
    }
    language?: string
    languageCode?: string
}

export async function PageRenderer({ page, language, languageCode }: PageRendererProps) {
    // Global tasarım ayarlarını getir
    const globalDesign = await prisma.globalDesign.findFirst()

    // Language parametresini normalize et
    const currentLanguage = language || languageCode || 'tr'

    // Modules'ı doğru yerden al
    const modules = page.globalPage?.modules || page.modules || []

    return (
        <>
            {/* Global Custom CSS */}
            {globalDesign?.customCss && (
                <style dangerouslySetInnerHTML={{ __html: globalDesign.customCss }} />
            )}

            <div className="min-h-screen">
                <ServerNavbar currentLanguage={currentLanguage} />

                <main>
                    {/* Page Content */}
                    {page.content && (
                        <div
                            className="prose max-w-none"
                            dangerouslySetInnerHTML={{ __html: page.content }}
                        />
                    )}

                    {/* Page Modules */}
                    {modules
                        .sort((a, b) => a.order - b.order)
                        .map((module) => (
                            <ModuleRenderer
                                key={module.id}
                                module={{
                                    ...module,
                                    isActive: module.isActive ?? true
                                }}
                            />
                        ))}
                </main>
            </div>

            {/* Global Custom JavaScript */}
            {globalDesign?.customJs && (
                <script dangerouslySetInnerHTML={{ __html: globalDesign.customJs }} />
            )}
        </>
    )
} 