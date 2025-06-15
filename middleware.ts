import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Desteklenen dilleri cache'lemek için
let cachedLanguages: { code: string; isDefault: boolean }[] | null = null
let cacheTime = 0
const CACHE_DURATION = 10 * 1000 // 10 saniye - çok kısa cache süresi

// Cache'i temizlemek için - export edildi
export function clearLanguageCache() {
    cachedLanguages = null
    cacheTime = 0
    console.log('Language cache cleared')
}

async function getLanguages(request: NextRequest) {
    const now = Date.now()

    // Cache kontrolü - çok kısa süre
    if (cachedLanguages && (now - cacheTime) < CACHE_DURATION) {
        return cachedLanguages
    }

    try {
        // API route'dan dilleri al
        const url = new URL('/api/languages', request.url)
        const response = await fetch(url.toString(), {
            // Cache'i bypass et
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        })

        if (!response.ok) {
            throw new Error(`API response not ok: ${response.status}`)
        }

        const data = await response.json()
        const languages = data.languages || data // API response format'ını handle et

        // Response'un array olduğunu ve geçerli data içerdiğini kontrol et
        if (!Array.isArray(languages) || languages.length === 0) {
            console.warn('Invalid languages response, using fallback')
            return [{ code: 'tr', isDefault: true }]
        }

        // Her language objesinin gerekli property'lere sahip olduğunu kontrol et
        const validLanguages = languages.filter(lang =>
            lang && typeof lang.code === 'string' && typeof lang.isDefault === 'boolean'
        )

        if (validLanguages.length === 0) {
            console.warn('No valid languages found, using fallback')
            return [{ code: 'tr', isDefault: true }]
        }

        cachedLanguages = validLanguages
        cacheTime = now
        console.log('Languages refreshed in middleware:', validLanguages.map(l => l.code))
        return validLanguages
    } catch (error) {
        console.error('Error fetching languages in middleware:', error)
        // Fallback olarak Türkçe döndür
        return [{ code: 'tr', isDefault: true }]
    }
}

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    // API routes, admin routes, static files ve Next.js internal routes'ları atla
    if (
        pathname.startsWith('/api/') ||
        pathname.startsWith('/admin') ||
        pathname.startsWith('/_next/') ||
        pathname.startsWith('/favicon.ico') ||
        pathname.includes('.')
    ) {
        return NextResponse.next()
    }

    try {
        const languages = await getLanguages(request)
        const languageCodes = languages.map((lang: { code: string; isDefault: boolean }) => lang.code)

        // Dinamik olarak varsayılan dili bul
        const defaultLanguage = languages.find((lang: { code: string; isDefault: boolean }) => lang.isDefault)?.code

        // Eğer varsayılan dil bulunamazsa, ilk aktif dili kullan
        const fallbackLanguage = defaultLanguage || languages[0]?.code || 'tr'

        // Path'i analiz et
        const segments = pathname.split('/').filter(Boolean)

        // Eğer path boşsa (ana sayfa), varsayılan dile yönlendir
        if (segments.length === 0) {
            return NextResponse.redirect(new URL(`/${fallbackLanguage}`, request.url))
        }

        // İlk segment dil kodu mu kontrol et
        const firstSegment = segments[0]

        // KRITIK: Eğer zaten geçerli bir dil kodu ile başlıyorsa, redirect yapma!
        if (languageCodes.includes(firstSegment)) {
            return NextResponse.next()
        }

        // Sadece geçersiz dil kodu varsa redirect yap
        return NextResponse.redirect(new URL(`/${fallbackLanguage}${pathname}`, request.url))

    } catch (error) {
        console.error('Middleware error:', error)
        // Hata durumunda güvenli fallback
        return NextResponse.next()
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
} 