"use client"

import { useEffect } from 'react'

export function FrontendStyles() {
    useEffect(() => {
        // Frontend CSS'i dinamik olarak yükle
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = '/styles/frontend.css'
        document.head.appendChild(link)

        return () => {
            // Cleanup
            const existingLink = document.querySelector('link[href="/styles/frontend.css"]')
            if (existingLink) {
                document.head.removeChild(existingLink)
            }
        }
    }, [])

    return null
} 