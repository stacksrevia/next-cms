import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { PageRenderer } from "@/components/page-renderer"

interface PageProps {
    params: {
        slug: string
    }
}

async function getPage(slug: string) {
    try {
        const page = await prisma.page.findUnique({
            where: {
                slug,
                isActive: true
            },
            include: {
                modules: {
                    where: { isActive: true },
                    orderBy: { order: 'asc' }
                }
            }
        })
        return page
    } catch (error) {
        console.error("Error fetching page:", error)
        return null
    }
}

export async function generateMetadata({ params }: PageProps) {
    const page = await getPage(params.slug)

    if (!page) {
        return {
            title: "Sayfa Bulunamadı",
            description: "Aradığınız sayfa bulunamadı."
        }
    }

    return {
        title: page.seoTitle || page.title,
        description: page.seoDescription || page.description,
    }
}

export default async function DynamicPage({ params }: PageProps) {
    const page = await getPage(params.slug)

    if (!page) {
        notFound()
    }

    return <PageRenderer page={page} />
}

// Generate static params for build time
export async function generateStaticParams() {
    try {
        const pages = await prisma.page.findMany({
            where: { isActive: true },
            select: { slug: true }
        })

        return pages.map((page) => ({
            slug: page.slug,
        }))
    } catch (error) {
        console.error("Error generating static params:", error)
        return []
    }
} 