"use client"

import { useEffect, useState } from "react"
import { Shield, AlertCircle, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface InitializationResult {
    initialized: boolean
    message: string
    user?: {
        id: string
        email: string
        name: string
        role: string
    } | null
    error?: string
    needsSetup?: boolean
}

export function AppInitializer({ children }: { children: React.ReactNode }) {
    const [isInitializing, setIsInitializing] = useState(true)
    const [initResult, setInitResult] = useState<InitializationResult | null>(null)
    const [error, setError] = useState<string | null>(null)

    const initializeApp = async () => {
        try {
            setIsInitializing(true)
            setError(null)

            const response = await fetch("/api/init")
            const result: InitializationResult = await response.json()

            setInitResult(result)

            if (!result.initialized) {
                setError(result.error || "Initialization failed")
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
            setError(errorMessage)
            setInitResult({
                initialized: false,
                message: "Failed to initialize application",
                error: errorMessage
            })
        } finally {
            setIsInitializing(false)
        }
    }

    useEffect(() => {
        initializeApp()
    }, [])

    if (isInitializing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <Shield className="h-12 w-12 animate-spin text-primary" />
                        </div>
                        <CardTitle>Uygulama Başlatılıyor</CardTitle>
                        <CardDescription>
                            Sistem kontrol ediliyor ve gerekli ayarlar yapılıyor...
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    if (error && !initResult?.initialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="w-full max-w-lg">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <AlertCircle className="h-12 w-12 text-destructive" />
                        </div>
                        <CardTitle className="text-destructive">Veritabanı Kurulumu Gerekli</CardTitle>
                        <CardDescription>
                            Uygulama çalışmadan önce veritabanı ayarlarının yapılması gerekiyor
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-destructive/10 rounded-lg">
                            <p className="text-sm text-destructive font-medium">Sorun:</p>
                            <p className="text-sm text-muted-foreground mt-1">{initResult?.message || error}</p>
                        </div>

                        {initResult?.needsSetup && (
                            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg space-y-3">
                                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Kurulum Adımları:</p>
                                <ol className="text-sm text-blue-600 dark:text-blue-400 space-y-1 list-decimal list-inside">
                                    <li>PostgreSQL sunucusunun çalıştığından emin olun</li>
                                    <li><code className="bg-background px-1 rounded">cms</code> adında bir veritabanı oluşturun</li>
                                    <li>Terminal'de <code className="bg-background px-1 rounded">npx prisma db push</code> komutunu çalıştırın</li>
                                    <li>Bu sayfayı yenileyin</li>
                                </ol>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button onClick={initializeApp} className="flex-1">
                                Tekrar Dene
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => window.location.href = "/admin"}
                                className="flex-1"
                            >
                                Admin Paneline Git
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (initResult?.initialized && initResult.user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <CheckCircle className="h-12 w-12 text-green-500" />
                        </div>
                        <CardTitle className="text-green-600">Sistem Hazır!</CardTitle>
                        <CardDescription>
                            Admin kullanıcısı oluşturuldu
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="font-medium">E-posta:</span>
                                <span className="text-sm">{initResult.user.email}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Şifre:</span>
                                <code className="text-sm bg-background px-2 py-1 rounded">admin123</code>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Rol:</span>
                                <Badge variant="secondary">{initResult.user.role}</Badge>
                            </div>
                        </div>
                        <div className="text-center">
                            <Button onClick={() => window.location.href = "/admin"} className="w-full">
                                Admin Paneline Git
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // If everything is initialized, show the main app
    return <>{children}</>
} 