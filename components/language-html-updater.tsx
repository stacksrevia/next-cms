"use client"

import { useEffect } from "react"

interface LanguageHtmlUpdaterProps {
    language: string
    direction: string
}

export function LanguageHtmlUpdater({ language, direction }: LanguageHtmlUpdaterProps) {
    useEffect(() => {
        // HTML element'ini güncelle
        const htmlElement = document.documentElement
        if (htmlElement) {
            htmlElement.lang = language
            htmlElement.dir = direction
        }
    }, [language, direction])

    // Bu component hiçbir şey render etmez
    return null
} 