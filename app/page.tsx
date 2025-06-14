import { prisma } from "@/lib/prisma"
import { PageRenderer } from "@/components/page-renderer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Home as HomeIcon } from "lucide-react"
import Link from "next/link"

async function getHomePage() {
  try {
    const homePage = await prisma.page.findFirst({
      where: {
        slug: "anasayfa",
        isActive: true
      },
      include: {
        modules: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        }
      }
    })
    return homePage
  } catch (error) {
    console.error("Error fetching home page:", error)
    return null
  }
}

export async function generateMetadata() {
  const homePage = await getHomePage()

  if (!homePage) {
    return {
      title: "Anasayfa Bulunamadı",
      description: "Anasayfa henüz oluşturulmamış."
    }
  }

  return {
    title: homePage.seoTitle || homePage.title,
    description: homePage.seoDescription || homePage.description,
  }
}

export default async function Home() {
  const homePage = await getHomePage()

  if (!homePage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full w-fit">
                <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <CardTitle className="text-2xl">Anasayfa Bulunamadı</CardTitle>
              <CardDescription className="text-lg">
                Henüz bir anasayfa oluşturulmamış. Lütfen admin panelinden "anasayfa" slug'ı ile bir sayfa oluşturun.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  return <PageRenderer page={homePage} />
}
