import { notFound } from "next/navigation";
import { getLanguageByCode, getLanguages } from "@/lib/language-utils";
import { LanguageProvider } from '@/lib/language-context';
import { Metadata } from "next";
import { LanguageHtmlUpdater } from "@/components/language-html-updater";

interface LanguageLayoutProps {
    children: React.ReactNode;
    params: Promise<{ language: string }>;
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ language: string }>;
}): Promise<Metadata> {
    const { language } = await params;
    const languageData = await getLanguageByCode(language);

    if (!languageData) {
        return {
            title: "Page Not Found",
        };
    }

    return {
        title: `${languageData.name} - My App`,
        description: `Content in ${languageData.name}`,
    };
}

export default async function LanguageLayout({
    children,
    params,
}: LanguageLayoutProps) {
    const { language } = await params;
    const [currentLanguage, allLanguages] = await Promise.all([
        getLanguageByCode(language),
        getLanguages()
    ]);

    if (!currentLanguage) {
        notFound();
    }

    return (
        <LanguageProvider
            initialLanguage={currentLanguage}
            initialLanguages={allLanguages}
        >
            <LanguageHtmlUpdater
                language={currentLanguage.code}
                direction={currentLanguage.code === 'ar' ? 'rtl' : 'ltr'}
            />
            <div className="min-h-screen flex flex-col">
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </LanguageProvider>
    );
} 