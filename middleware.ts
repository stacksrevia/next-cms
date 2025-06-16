import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Desteklenen dilleri cache'lemek için
let cachedLanguages: { code: string; isDefault: boolean }[] | null = null
let cacheTime = 0
const CACHE_DURATION = 30 * 1000 // 30 saniye

// Cache'i temizlemek için - export edildi
export function clearLanguageCache() {
    cachedLanguages = null
    cacheTime = 0
    console.log('Language cache cleared')
}

async function getLanguages(request: NextRequest) {
    const now = Date.now()

    // Cache kontrolü
    if (cachedLanguages && (now - cacheTime) < CACHE_DURATION) {
        return cachedLanguages
    }

    try {
        // Production ortamında absolute URL kullan
        const protocol = request.headers.get('x-forwarded-proto') ||
            (request.url.startsWith('https') ? 'https' : 'http')
        const host = request.headers.get('host') ||
            request.headers.get('x-forwarded-host') ||
            new URL(request.url).host

        const baseUrl = `${protocol}://${host}`
        const apiUrl = `${baseUrl}/api/languages`

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache',
                'Accept': 'application/json',
                'User-Agent': 'NextJS-Middleware/1.0'
            },
            // Timeout ekle
            signal: AbortSignal.timeout(5000) // 5 saniye timeout
        })

        if (!response.ok) {
            throw new Error(`API response not ok: ${response.status} - ${response.statusText}`)
        }

        const data = await response.json()
        const languages = data.languages || data

        // Response'un array olduğunu ve geçerli data içerdiğini kontrol et
        if (!Array.isArray(languages) || languages.length === 0) {
            console.warn('No languages found, using fallback')
            const fallbackLanguages = [{ code: 'tr', isDefault: true }]
            cachedLanguages = fallbackLanguages
            cacheTime = now
            return fallbackLanguages
        }

        // Her language objesinin gerekli property'lere sahip olduğunu kontrol et
        const validLanguages = languages.filter(lang =>
            lang && typeof lang.code === 'string' && typeof lang.isDefault === 'boolean'
        )

        if (validLanguages.length === 0) {
            console.warn('No valid languages found, using fallback')
            const fallbackLanguages = [{ code: 'tr', isDefault: true }]
            cachedLanguages = fallbackLanguages
            cacheTime = now
            return fallbackLanguages
        }

        cachedLanguages = validLanguages
        cacheTime = now
        console.log('Languages refreshed in middleware:', validLanguages.map(l => l.code))
        return validLanguages
    } catch (error) {
        console.error('Error fetching languages in middleware:', error)
        // Fallback olarak Türkçe döndür
        const fallbackLanguages = [{ code: 'tr', isDefault: true }]
        cachedLanguages = fallbackLanguages
        cacheTime = now
        return fallbackLanguages
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
        pathname.startsWith('/images/') ||  // Bu satırı ekleyin
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
        // Hata durumunda güvenli fallback - Türkçe'ye yönlendir
        const segments = pathname.split('/').filter(Boolean)
        if (segments.length === 0 || !['tr', 'en'].includes(segments[0])) {
            return NextResponse.redirect(new URL(`/tr${pathname}`, request.url))
        }
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
         * - images (static images)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
    ],
}