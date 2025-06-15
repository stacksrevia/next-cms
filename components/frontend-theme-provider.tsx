"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ThemeProviderProps } from "next-themes"

export function FrontendThemeProvider({ children, ...props }: ThemeProviderProps) {
    return (
        <NextThemesProvider
            {...props}
            storageKey="frontend-theme" // Frontend için ayrı storage key
            attribute="class"
            defaultTheme="system" // Frontend için system theme
            enableSystem={true} // Frontend'de system theme'i aktif
            disableTransitionOnChange
        >
            {children}
        </NextThemesProvider>
    )
} 