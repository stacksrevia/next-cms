import { notFound } from "next/navigation";
import { getLanguageByCode, getLanguages } from "@/lib/language-utils";
import { getDesignData, getLogoData } from "@/lib/design-utils";
import { LanguageProvider } from '@/lib/language-context';
import { DesignStylesInjector } from "@/components/design-styles-injector";
import { Metadata } from "next";
import { LanguageHtmlUpdater } from "@/components/language-html-updater";
import { AOSProvider } from "../../components/aos-provider";
import { FrontendStyles } from "@/components/frontend-styles";
import { MinimalLoading } from "@/components/minimal-loading";
import 'bootstrap/dist/css/bootstrap.min.css';

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
    const [currentLanguage, allLanguages, designData, logoData] = await Promise.all([
        getLanguageByCode(language),
        getLanguages(),
        getDesignData(),
        getLogoData()
    ]);

    if (!currentLanguage) {
        notFound();
    }

    return (
        <LanguageProvider
            initialLanguage={currentLanguage}
            initialLanguages={allLanguages}
        >
            <DesignStylesInjector designData={designData} logoData={logoData} />
            <FrontendStyles />
            <LanguageHtmlUpdater
                language={currentLanguage.code}
                direction={currentLanguage.code === 'ar' ? 'rtl' : 'ltr'}
            />
            <MinimalLoading logo={logoData} />
            <AOSProvider>
                <div className="min-h-screen flex flex-col">
                    <main className="flex-1">
                        {children}
                    </main>
                </div>
            </AOSProvider>
        </LanguageProvider>
    );
} 