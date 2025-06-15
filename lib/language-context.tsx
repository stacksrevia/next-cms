'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface Language {
    id: string
    code: string
    name: string
    flag: string
    isDefault: boolean
    isActive: boolean
}

interface LanguageContextType {
    currentLanguage: Language | null
    languages: Language[]
    setCurrentLanguage: (language: Language) => void
    setLanguages: (languages: Language[]) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}

interface LanguageProviderProps {
    children: React.ReactNode
    initialLanguage?: Language
    initialLanguages?: Language[]
}

export function LanguageProvider({
    children,
    initialLanguage,
    initialLanguages = []
}: LanguageProviderProps) {
    const [currentLanguage, setCurrentLanguage] = useState<Language | null>(initialLanguage || null)
    const [languages, setLanguages] = useState<Language[]>(initialLanguages)

    useEffect(() => {
        if (initialLanguage) {
            setCurrentLanguage(initialLanguage)
        }
    }, [initialLanguage])

    useEffect(() => {
        if (initialLanguages.length > 0) {
            setLanguages(initialLanguages)
        }
    }, [initialLanguages])

    return (
        <LanguageContext.Provider
            value={{
                currentLanguage,
                languages,
                setCurrentLanguage,
                setLanguages,
            }}
        >
            {children}
        </LanguageContext.Provider>
    )
} 