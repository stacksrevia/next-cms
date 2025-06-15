import { NextResponse } from 'next/server'
import { clearLanguageCache } from '@/middleware'

export async function POST() {
    try {
        // Middleware cache'ini temizle
        clearLanguageCache()
        
        console.log('Cache cleared successfully')
        
        return NextResponse.json({ 
            success: true, 
            message: 'Cache cleared successfully - will refresh in 10 seconds',
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