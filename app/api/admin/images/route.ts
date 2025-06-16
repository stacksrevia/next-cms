import { NextRequest, NextResponse } from "next/server"
import { readdir, stat } from "fs/promises"
import { join } from "path"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Yetkisiz erişim" },
                { status: 401 }
            )
        }

        const imagesDir = join(process.cwd(), 'public', 'images')

        try {
            const files = await readdir(imagesDir)

            // Sadece resim dosyalarını filtrele ve detaylarını al
            const imageFiles = []

            for (const file of files) {
                const filePath = join(imagesDir, file)
                const stats = await stat(filePath)

                // Resim dosyası kontrolü
                const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file)

                if (isImage && stats.isFile()) {
                    imageFiles.push({
                        name: file,
                        url: `/images/${file}`,
                        size: stats.size,
                        createdAt: stats.birthtime,
                        modifiedAt: stats.mtime
                    })
                }
            }

            // Tarihe göre sırala (en yeni önce)
            imageFiles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

            return NextResponse.json({
                success: true,
                images: imageFiles,
                total: imageFiles.length
            })

        } catch (error) {
            // Images klasörü yoksa oluştur
            return NextResponse.json({
                success: true,
                images: [],
                total: 0
            })
        }

    } catch (error) {
        console.error("Error fetching images:", error)
        return NextResponse.json(
            { error: "Görseller yüklenirken hata oluştu" },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Yetkisiz erişim" },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const fileName = searchParams.get('file')

        if (!fileName) {
            return NextResponse.json(
                { error: "Dosya adı gerekli" },
                { status: 400 }
            )
        }

        const filePath = join(process.cwd(), 'public', 'images', fileName)

        try {
            const { unlink } = await import('fs/promises')
            await unlink(filePath)

            return NextResponse.json({
                success: true,
                message: "Görsel başarıyla silindi"
            })
        } catch (error) {
            return NextResponse.json(
                { error: "Görsel silinirken hata oluştu" },
                { status: 500 }
            )
        }

    } catch (error) {
        console.error("Error deleting image:", error)
        return NextResponse.json(
            { error: "Görsel silinirken hata oluştu" },
            { status: 500 }
        )
    }
} 