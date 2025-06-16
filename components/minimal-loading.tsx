"use client"

import { useState, useEffect } from 'react'
import { LogoData } from '@/lib/design-utils'

interface MinimalLoadingProps {
    logo?: LogoData
}

export function MinimalLoading({ logo }: MinimalLoadingProps) {
    const [isVisible, setIsVisible] = useState(true)
    const [isFadingOut, setIsFadingOut] = useState(false)

    useEffect(() => {
        const startTime = Date.now()
        const minDisplayTime = 300 // Minimum 300ms göster
        let isHydrated = false
        let isLoaded = false

        const checkAndHide = () => {
            if (isHydrated && isLoaded) {
                const elapsedTime = Date.now() - startTime

                const hideLoading = () => {
                    setIsFadingOut(true)
                    setTimeout(() => {
                        setIsVisible(false)
                    }, 400) // 400ms fade out
                }

                if (elapsedTime >= minDisplayTime) {
                    hideLoading()
                } else {
                    setTimeout(hideLoading, minDisplayTime - elapsedTime)
                }
            }
        }

        // Hydration tamamlandığında
        const hydrationTimer = setTimeout(() => {
            isHydrated = true
            checkAndHide()
        }, 100) // React hydration için kısa delay

        // Sayfa yüklenme kontrolü
        const handleLoad = () => {
            isLoaded = true
            checkAndHide()
        }

        if (document.readyState === 'complete') {
            isLoaded = true
            checkAndHide()
        } else {
            window.addEventListener('load', handleLoad)
        }

        // Fallback: Maximum 3 saniye bekle
        const maxTimer = setTimeout(() => {
            isHydrated = true
            isLoaded = true
            checkAndHide()
        }, 3000)

        return () => {
            clearTimeout(hydrationTimer)
            clearTimeout(maxTimer)
            window.removeEventListener('load', handleLoad)
        }
    }, [])

    if (!isVisible) return null

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
                opacity: isFadingOut ? 0 : 1,
                transition: 'opacity 500ms ease-out',
                pointerEvents: 'none'
            }}
        >
            {logo?.logo ? (
                <img
                    src={logo.logo}
                    alt="Loading..."
                    style={{
                        height: '80px',
                        width: 'auto',
                        maxWidth: '300px',
                        objectFit: 'contain',
                        animation: isFadingOut ? 'none' : 'pulse 1.5s ease-in-out infinite'
                    }}
                />
            ) : (
                <div
                    style={{
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: '#000',
                        animation: isFadingOut ? 'none' : 'pulse 1.5s ease-in-out infinite'
                    }}
                >
                    VIRA
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes pulse {
                        0%, 100% { opacity: 0.7; transform: scale(0.95); }
                        50% { opacity: 1; transform: scale(1); }
                    }
                `
            }} />
        </div>
    )
} 