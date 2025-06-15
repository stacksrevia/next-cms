import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET - Belirli bir sayfayı getir
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const { searchParams } = new URL(request.url)
        const languageId = searchParams.get('languageId')

        const globalPage = await prisma.globalPage.findUnique({
            where: { id },
            include: {
                contents: languageId ? {
                    where: { languageId },
                    include: {
                        modules: {
                            orderBy: { order: 'asc' }
                        }
                    }
                } : {
                    include: {
                        language: true,
                        modules: {
                            orderBy: { order: 'asc' }
                        }
                    }
                },
                parent: {
                    select: {
                        id: true,
                        slug: true,
                        contents: {
                            where: languageId ? { languageId } : {},
                            select: { title: true },
                            take: 1
                        }
                    }
                },
                children: {
                    where: { isActive: true },
                    select: {
                        id: true,
                        slug: true,
                        order: true,
                        isActive: true,
                        contents: {
                            where: languageId ? { languageId } : {},
                            select: { title: true },
                            take: 1
                        }
                    },
                    orderBy: { order: 'asc' }
                }
            }
        })

        if (!globalPage) {
            return NextResponse.json(
                { error: 'Sayfa bulunamadı' },
                { status: 404 }
            )
        }

        // İçerik formatla
        const content = globalPage.contents[0]
        const formattedPage = {
            id: globalPage.id,
            slug: content?.slug || globalPage.slug,
            parentId: globalPage.parentId,
            order: globalPage.order,
            isActive: globalPage.isActive,
            createdAt: globalPage.createdAt.toISOString(),
            updatedAt: globalPage.updatedAt.toISOString(),
            title: content?.title || 'Başlık Yok',
            description: content?.description || null,
            seoTitle: content?.seoTitle || null,
            seoDescription: content?.seoDescription || null,
            language: content ? ('language' in content ? content.language : null) : null,
            modules: content?.modules || [],
            parent: globalPage.parent ? {
                id: globalPage.parent.id,
                slug: globalPage.parent.slug,
                title: globalPage.parent.contents[0]?.title || 'Başlık Yok'
            } : null,
            children: globalPage.children.map(child => ({
                id: child.id,
                slug: child.slug,
                order: child.order,
                isActive: child.isActive,
                title: child.contents[0]?.title || 'Başlık Yok'
            }))
        }

        return NextResponse.json(formattedPage)
    } catch (error) {
        console.error('Error fetching page:', error)
        return NextResponse.json(
            { error: 'Sayfa getirilirken hata oluştu' },
            { status: 500 }
        )
    }
}

// PATCH - Sayfayı güncelle
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { isActive, title, description, slug, seoTitle, seoDescription, languageId } = body

        // Global page güncelleme
        if (isActive !== undefined) {
            await prisma.globalPage.update({
                where: { id },
                data: { isActive }
            })
        }

        // İçerik güncelleme
        if (languageId && (title || description || slug || seoTitle || seoDescription)) {
            const pageContent = await prisma.pageContent.findFirst({
                where: {
                    globalPageId: id,
                    languageId
                }
            })

            if (pageContent) {
                await prisma.pageContent.update({
                    where: { id: pageContent.id },
                    data: {
                        ...(title && { title }),
                        ...(description !== undefined && { description }),
                        ...(slug && { slug }),
                        ...(seoTitle !== undefined && { seoTitle }),
                        ...(seoDescription !== undefined && { seoDescription })
                    }
                })
            }
        }

        return NextResponse.json({
            message: 'Sayfa başarıyla güncellendi'
        })
    } catch (error) {
        console.error('Error updating page:', error)
        return NextResponse.json(
            { error: 'Sayfa güncellenirken hata oluştu' },
            { status: 500 }
        )
    }
}

// DELETE - Sayfayı sil
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Alt sayfaları kontrol et
        const childrenCount = await prisma.globalPage.count({
            where: { parentId: id }
        })

        if (childrenCount > 0) {
            return NextResponse.json(
                { error: 'Alt sayfaları olan sayfa silinemez. Önce alt sayfaları silin.' },
                { status: 400 }
            )
        }

        // Sayfayı sil (cascade ile içerikler ve modüller de silinir)
        await prisma.globalPage.delete({
            where: { id }
        })

        return NextResponse.json({
            message: 'Sayfa başarıyla silindi'
        })
    } catch (error) {
        console.error('Error deleting page:', error)
        return NextResponse.json(
            { error: 'Sayfa silinirken hata oluştu' },
            { status: 500 }
        )
    }
}
