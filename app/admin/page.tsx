"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Shield, User, Lock, Eye, EyeOff } from "lucide-react"
import { useState, useEffect } from "react"
import { signIn, getSession, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function AdminLogin() {
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const { data: session, status } = useSession()
    const router = useRouter()

    console.log("AdminLogin - session:", session, "status:", status)

    // Redirect if already logged in as admin
    useEffect(() => {
        if (status === "loading") return

        if (session?.user?.role === "ADMIN") {
            console.log("Already admin, redirecting to dashboard")
            router.push("/admin/dashboard")
        }
    }, [session, status, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email || !password) {
            toast.error("Lütfen tüm alanları doldurun")
            return
        }

        setIsLoading(true)

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                toast.error("Giriş başarısız. E-posta veya şifre hatalı.")
            } else {
                // Check if user is admin
                const session = await getSession()
                if (session?.user?.role === "ADMIN") {
                    toast.success("Giriş başarılı! Yönlendiriliyorsunuz...")
                    router.push("/admin/dashboard")
                } else {
                    toast.error("Bu alana erişim yetkiniz bulunmamaktadır.")
                }
            }
        } catch {
            toast.error("Bir hata oluştu. Lütfen tekrar deneyin.")
        } finally {
            setIsLoading(false)
        }
    }

    // Show loading while checking session
    if (status === "loading") {
        console.log("AdminLogin - Status loading")
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    // Don't show login form if already logged in as admin
    if (session?.user?.role === "ADMIN") {
        console.log("AdminLogin - Already admin, returning null")
        return null
    }

    console.log("AdminLogin - Rendering login form")

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <div className="w-full max-w-md space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="flex justify-center">
                        <div className="p-3 bg-primary rounded-full">
                            <Shield className="h-8 w-8 text-primary-foreground" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
                    <p className="text-muted-foreground">Yönetim paneline giriş yapın</p>
                </div>

                {/* Login Card */}
                <Card>
                    <CardHeader className="space-y-1 pb-6">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-2xl font-semibold">Giriş Yap</CardTitle>
                            <Badge variant="secondary">
                                Admin
                            </Badge>
                        </div>
                        <CardDescription>
                            Yönetici hesabınızla giriş yapın
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Field */}
                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    E-posta Adresi
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 h-12"
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <Label htmlFor="password">
                                    Şifre
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 pr-10 h-12"
                                        disabled={isLoading}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                                        disabled={isLoading}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <Separator className="my-6" />

                            {/* Login Button */}
                            <Button
                                type="submit"
                                className="w-full h-12"
                                size="lg"
                                disabled={isLoading}
                            >
                                <Shield className="mr-2 h-4 w-4" />
                                {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
                            </Button>
                        </form>

                        {/* Additional Info */}
                        <div className="text-center pt-4">
                            <p className="text-xs text-muted-foreground">
                                Bu alan sadece yetkili yöneticiler içindir
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="text-center text-sm text-muted-foreground">
                    <p>© 2024 Admin Panel. Tüm hakları saklıdır.</p>
                </div>
            </div>
        </div>
    )
} 