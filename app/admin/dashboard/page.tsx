import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import {
    Users,
    FileText,
    BarChart3,
    Settings,
    TrendingUp,
    Activity,
    Calendar,
    Clock,
    AlertTriangle,
    Plus
} from "lucide-react"

async function checkHomePage() {
    try {
        const homePage = await prisma.page.findFirst({
            where: {
                slug: "anasayfa",
                isActive: true
            }
        })
        return !!homePage
    } catch (error) {
        console.error("Error checking home page:", error)
        return false
    }
}

export default async function AdminDashboard() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/admin")
    }

    if (session.user.role !== "ADMIN") {
        redirect("/")
    }

    const hasHomePage = await checkHomePage()

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground">
                        Hoş geldiniz, {session.user.name || session.user.email}
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                        {new Date().toLocaleDateString('tr-TR')}
                    </Badge>
                </div>
            </div>

            {/* Homepage Warning */}
            {!hasHomePage && (
                <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    <AlertTitle className="text-yellow-800 dark:text-yellow-200">
                        Anasayfa Bulunamadı
                    </AlertTitle>
                    <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                        Web sitenizin anasayfası henüz oluşturulmamış. Ziyaretçiler anasayfaya gittiğinde uyarı mesajı görecekler.
                        <div className="mt-3">
                            <Button asChild size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white">
                                <Link href="/admin/pages">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Anasayfa Oluştur
                                </Link>
                            </Button>
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Toplam Kullanıcı
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,234</div>
                        <p className="text-xs text-muted-foreground">
                            +20.1% geçen aydan
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Aktif İçerik
                        </CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">567</div>
                        <p className="text-xs text-muted-foreground">
                            +12.5% geçen aydan
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Aylık Görüntüleme
                        </CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12,234</div>
                        <p className="text-xs text-muted-foreground">
                            +19% geçen aydan
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Sistem Durumu
                        </CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">99.9%</div>
                        <p className="text-xs text-muted-foreground">
                            Çalışma süresi
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Recent Activity */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Son Aktiviteler</CardTitle>
                        <CardDescription>
                            Sistemdeki son aktivitelerin özeti
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <Users className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium">Yeni kullanıcı kaydı</p>
                                <p className="text-xs text-muted-foreground">
                                    john.doe@example.com sisteme katıldı
                                </p>
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 mr-1" />
                                2 saat önce
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                                <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium">İçerik güncellendi</p>
                                <p className="text-xs text-muted-foreground">
                                    "Yeni Özellikler" sayfası düzenlendi
                                </p>
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 mr-1" />
                                4 saat önce
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                                <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium">Sistem ayarları değişti</p>
                                <p className="text-xs text-muted-foreground">
                                    Güvenlik ayarları güncellendi
                                </p>
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 mr-1" />
                                1 gün önce
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Hızlı İstatistikler</CardTitle>
                        <CardDescription>
                            Bu ayın performans özeti
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                <span className="text-sm">Büyüme Oranı</span>
                            </div>
                            <span className="text-sm font-medium text-green-600">+15.3%</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4 text-blue-600" />
                                <span className="text-sm">Aktif Kullanıcı</span>
                            </div>
                            <span className="text-sm font-medium">892</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-purple-600" />
                                <span className="text-sm">Bu Ay</span>
                            </div>
                            <span className="text-sm font-medium">28 gün</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Activity className="h-4 w-4 text-orange-600" />
                                <span className="text-sm">Ortalama Yanıt</span>
                            </div>
                            <span className="text-sm font-medium">120ms</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* User Session Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Oturum Bilgileri</CardTitle>
                    <CardDescription>
                        Mevcut admin oturum detayları
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">E-posta</p>
                            <p className="text-sm">{session.user.email}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">İsim</p>
                            <p className="text-sm">{session.user.name || "Belirtilmemiş"}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Rol</p>
                            <Badge variant="secondary">{session.user.role}</Badge>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Kullanıcı ID</p>
                            <p className="text-xs font-mono bg-muted px-2 py-1 rounded">
                                {session.user.id}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 