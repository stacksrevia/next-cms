"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ThemeProviderProps } from "next-themes"

export function AdminThemeProvider({ children, ...props }: ThemeProviderProps) {
    return (
        <NextThemesProvider
            {...props}
            storageKey="admin-theme" // Admin için ayrı storage key
            attribute="class"
            defaultTheme="dark" // Admin için varsayılan dark theme
            enableSystem={false} // Admin'de system theme'i devre dışı
        >
            {children}
        </NextThemesProvider>
    )
} 