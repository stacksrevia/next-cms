import { prisma } from '@/lib/prisma'
import { Language } from '@/lib/language-context'

export async function getLanguages(): Promise<Language[]> {
    try {
        const languages = await prisma.language.findMany({
            where: { isActive: true },
            orderBy: [
                { isDefault: 'desc' },
                { name: 'asc' }
            ]
        })

        return languages.map(lang => ({
            id: lang.id,
            code: lang.code,
            name: lang.name,
            flag: lang.flag,
            isDefault: lang.isDefault,
            isActive: lang.isActive
        }))
    } catch (error) {
        console.error('Error fetching languages:', error)
        return []
    }
}

export async function getDefaultLanguage(): Promise<Language | null> {
    try {
        const defaultLang = await prisma.language.findFirst({
            where: {
                isDefault: true,
                isActive: true
            }
        })

        if (!defaultLang) return null

        return {
            id: defaultLang.id,
            code: defaultLang.code,
            name: defaultLang.name,
            flag: defaultLang.flag,
            isDefault: defaultLang.isDefault,
            isActive: defaultLang.isActive
        }
    } catch (error) {
        console.error('Error fetching default language:', error)
        return null
    }
}

export async function getLanguageByCode(code: string): Promise<Language | null> {
    try {
        const language = await prisma.language.findUnique({
            where: {
                code,
                isActive: true
            }
        })

        if (!language) return null

        return {
            id: language.id,
            code: language.code,
            name: language.name,
            flag: language.flag,
            isDefault: language.isDefault,
            isActive: language.isActive
        }
    } catch (error) {
        console.error('Error fetching language by code:', error)
        return null
    }
}

export function isValidLanguageCode(code: string, languages: Language[]): boolean {
    return languages.some(lang => lang.code === code && lang.isActive)
}

export function getLanguageFromPath(pathname: string, languages: Language[]): Language | null {
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length === 0) return null

    const potentialLangCode = segments[0]
    return languages.find(lang => lang.code === potentialLangCode && lang.isActive) || null
}

export function removeLanguageFromPath(pathname: string, languages: Language[]): string {
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length === 0) return '/'

    const potentialLangCode = segments[0]
    if (languages.some(lang => lang.code === potentialLangCode)) {
        segments.shift() // Remove language code
    }

    return '/' + segments.join('/')
}

export function addLanguageToPath(pathname: string, languageCode: string): string {
    const segments = pathname.split('/').filter(Boolean)
    segments.unshift(languageCode)
    return '/' + segments.join('/')
} 