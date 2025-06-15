import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const languages = await prisma.language.findMany({
            where: { isActive: true },
            select: {
                id: true,
                code: true,
                name: true,
                flag: true,
                isDefault: true,
                isActive: true
            },
            orderBy: { isDefault: 'desc' }
        })

        return NextResponse.json({ languages })
    } catch (error) {
        console.error('Error fetching languages:', error)
        // Fallback olarak Türkçe döndür
        return NextResponse.json({
            languages: [{
                id: 'fallback-tr',
                code: 'tr',
                name: 'Türkçe',
                flag: 'TR',
                isDefault: true,
                isActive: true
            }]
        })
    }
} 