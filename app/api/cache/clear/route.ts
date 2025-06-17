import { NextResponse } from 'next/server'
import { clearLanguageCache } from '@/middleware'

export async function POST() {
    try {
        // Sadece middleware cache'ini temizle (dynamic rendering'de cache yok)
        clearLanguageCache()

        console.log('Middleware cache cleared successfully')

        return NextResponse.json({
            success: true,
            message: 'Middleware cache cleared - Dynamic rendering aktif',
            timestamp: Date.now()
        })
    } catch (error) {
        console.error('Error clearing cache:', error)
        return NextResponse.json(
            { error: 'Failed to clear cache' },
            { status: 500 }
        )
    }
} 