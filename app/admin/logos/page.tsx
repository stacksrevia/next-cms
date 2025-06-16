"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageSelector } from "@/components/ui/image-selector"
import { AdminLoading } from "@/components/admin/admin-loading"
import { toast } from "sonner"
import { Image, FileImage, Globe, ImageIcon } from "lucide-react"

interface LogosData {
    id: string
    logo: string | null
    footerLogo: string | null
    favicon: string | null
    placeholder: string | null
}

export default function LogosPage() {
    const [logos, setLogos] = useState<LogosData | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [logo, setLogo] = useState("")
    const [footerLogo, setFooterLogo] = useState("")
    const [favicon, setFavicon] = useState("")
    const [placeholder, setPlaceholder] = useState("")

    useEffect(() => {
        fetchLogos()
    }, [])

    const fetchLogos = async () => {
        try {
            const response = await fetch('/api/admin/logos')
            if (response.ok) {
                const data = await response.json()
                setLogos(data)
                setLogo(data.logo || "")
                setFooterLogo(data.footerLogo || "")
                setFavicon(data.favicon || "")
                setPlaceholder(data.placeholder || "")
            }
        } catch (error) {
            console.error('Error fetching logos:', error)
            toast.error('Logo verileri yüklenirken hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const response = await fetch('/api/admin/logos', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    logo,
                    footerLogo,
                    favicon,
                    placeholder
                }),
            })

            if (response.ok) {
                const data = await response.json()
                setLogos(data)
                toast.success('Logo ayarları başarıyla kaydedildi')
            } else {
                toast.error('Logo ayarları kaydedilirken hata oluştu')
            }
        } catch (error) {
            console.error('Error saving logos:', error)
            toast.error('Logo ayarları kaydedilirken hata oluştu')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <AdminLoading text="Logo ayarları yükleniyor..." />
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Logo Yönetimi</h1>
                <p className="text-muted-foreground">
                    Sitenizin logolarını ve görsel öğelerini yönetin.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ana Logo */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Image className="h-5 w-5" />
                            Ana Logo
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Logo URL</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={logo}
                                    onChange={(e) => setLogo(e.target.value)}
                                    placeholder="Logo URL'sini girin"
                                    className="flex-1"
                                />
                                <ImageSelector
                                    onSelect={(url) => setLogo(url)}
                                    trigger={
                                        <Button variant="outline" size="sm">
                                            <ImageIcon className="h-4 w-4" />
                                        </Button>
                                    }
                                />
                            </div>
                        </div>
                        {logo && (
                            <div className="border rounded-lg p-4 bg-gray-50">
                                <img
                                    src={logo}
                                    alt="Ana Logo"
                                    className="h-16 w-auto mx-auto"
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Footer Logo */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileImage className="h-5 w-5" />
                            Footer Logo
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Footer Logo URL</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={footerLogo}
                                    onChange={(e) => setFooterLogo(e.target.value)}
                                    placeholder="Footer logo URL'sini girin"
                                    className="flex-1"
                                />
                                <ImageSelector
                                    onSelect={(url) => setFooterLogo(url)}
                                    trigger={
                                        <Button variant="outline" size="sm">
                                            <ImageIcon className="h-4 w-4" />
                                        </Button>
                                    }
                                />
                            </div>
                        </div>
                        {footerLogo && (
                            <div className="border rounded-lg p-4 bg-gray-50">
                                <img
                                    src={footerLogo}
                                    alt="Footer Logo"
                                    className="h-12 w-auto mx-auto"
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Favicon */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5" />
                            Favicon
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Favicon URL</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={favicon}
                                    onChange={(e) => setFavicon(e.target.value)}
                                    placeholder="Favicon URL'sini girin"
                                    className="flex-1"
                                />
                                <ImageSelector
                                    onSelect={(url) => setFavicon(url)}
                                    trigger={
                                        <Button variant="outline" size="sm">
                                            <ImageIcon className="h-4 w-4" />
                                        </Button>
                                    }
                                />
                            </div>
                        </div>
                        {favicon && (
                            <div className="border rounded-lg p-4 bg-gray-50">
                                <img
                                    src={favicon}
                                    alt="Favicon"
                                    className="h-8 w-8 mx-auto"
                                />
                            </div>
                        )}
                        <p className="text-sm text-muted-foreground">
                            Tarayıcı sekmesinde görünecek küçük ikon (16x16 veya 32x32 px önerilir)
                        </p>
                    </CardContent>
                </Card>

                {/* Placeholder */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ImageIcon className="h-5 w-5" />
                            Placeholder
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Placeholder URL</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={placeholder}
                                    onChange={(e) => setPlaceholder(e.target.value)}
                                    placeholder="Placeholder URL'sini girin"
                                    className="flex-1"
                                />
                                <ImageSelector
                                    onSelect={(url) => setPlaceholder(url)}
                                    trigger={
                                        <Button variant="outline" size="sm">
                                            <ImageIcon className="h-4 w-4" />
                                        </Button>
                                    }
                                />
                            </div>
                        </div>
                        {placeholder && (
                            <div className="border rounded-lg p-4 bg-gray-50">
                                <img
                                    src={placeholder}
                                    alt="Placeholder"
                                    className="h-24 w-24 mx-auto object-cover rounded"
                                />
                            </div>
                        )}
                        <p className="text-sm text-muted-foreground">
                            Görseller yüklenemediğinde gösterilecek varsayılan görsel
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    size="lg"
                >
                    {saving ? "Kaydediliyor..." : "Kaydet"}
                </Button>
            </div>
        </div>
    )
} 