import { NextRequest, NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import { join } from "path"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Yetkisiz erişim" },
                { status: 401 }
            )
        }

        const data = await request.formData()
        const file: File | null = data.get('file') as unknown as File

        if (!file) {
            return NextResponse.json(
                { error: "Dosya bulunamadı" },
                { status: 400 }
            )
        }

        // Dosya türü kontrolü
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { error: "Sadece resim dosyaları yüklenebilir" },
                { status: 400 }
            )
        }

        // Dosya boyutu kontrolü (5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { error: "Dosya boyutu 5MB'dan küçük olmalıdır" },
                { status: 400 }
            )
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Benzersiz dosya adı oluştur
        const timestamp = Date.now()
        const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        const fileName = `${timestamp}_${originalName}`

        // public/images klasörüne kaydet
        const path = join(process.cwd(), 'public', 'images', fileName)
        await writeFile(path, buffer)

        // URL'i döndür
        const imageUrl = `/images/${fileName}`

        return NextResponse.json({
            success: true,
            url: imageUrl,
            fileName: fileName
        })

    } catch (error) {
        console.error("Error uploading image:", error)
        return NextResponse.json(
            { error: "Resim yüklenirken hata oluştu" },
            { status: 500 }
        )
    }
} 