import { LanguageProvider } from '@/lib/language-context'
import { getLanguageByCode, getLanguages } from '@/lib/language-utils'
import { notFound } from 'next/navigation'
import { FrontendThemeProvider } from '@/components/frontend-theme-provider'

interface LanguageLayoutProps {
    children: React.ReactNode
    params: Promise<{
        language: string
    }>
}

export default async function LanguageLayout({
    children,
    params,
}: LanguageLayoutProps) {
    const { language } = await params
    const [currentLanguage, allLanguages] = await Promise.all([
        getLanguageByCode(language),
        getLanguages()
    ])

    if (!currentLanguage) {
        notFound()
    }

    return (
        <FrontendThemeProvider>
            <LanguageProvider
                initialLanguage={currentLanguage}
                initialLanguages={allLanguages}
            >
                <div className="min-h-screen flex flex-col">
                    <main className="flex-1">
                        {children}
                    </main>
                </div>
            </LanguageProvider>
        </FrontendThemeProvider>
    )
} 