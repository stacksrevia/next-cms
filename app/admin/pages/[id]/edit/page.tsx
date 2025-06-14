"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
    Save,
    ArrowLeft,
    Eye,
    Plus,
    Settings,
    Type,
    Image,
    Video,
    Mail,
    Star,
    Mountain,
    Grid3X3
} from "lucide-react"
import { toast } from "sonner"

interface Page {
    id: string
    title: string
    description?: string
    slug: string
    seoTitle?: string
    seoDescription?: string
    isActive: boolean
    createdAt: string
    updatedAt: string
    modules: PageModule[]
}

interface PageModule {
    id: string
    type: string
    order: number
    content: any
    isActive: boolean
}

const moduleTypes = [
    {
        type: "TEXT_IMAGE",
        name: "Metin + Resim",
        description: "Metin ve resim kombinasyonu",
        icon: Type,
        color: "bg-blue-500"
    },
    {
        type: "PARALLAX",
        name: "Parallax",
        description: "Parallax efektli bölüm",
        icon: Mountain,
        color: "bg-purple-500"
    },
    {
        type: "HERO",
        name: "Hero Bölümü",
        description: "Ana başlık bölümü",
        icon: Star,
        color: "bg-yellow-500"
    },
    {
        type: "GALLERY",
        name: "Galeri",
        description: "Resim galerisi",
        icon: Grid3X3,
        color: "bg-green-500"
    },
    {
        type: "VIDEO",
        name: "Video",
        description: "Video oynatıcı",
        icon: Video,
        color: "bg-red-500"
    },
    {
        type: "CONTACT_FORM",
        name: "İletişim Formu",
        description: "İletişim formu",
        icon: Mail,
        color: "bg-indigo-500"
    },
    {
        type: "TESTIMONIALS",
        name: "Referanslar",
        description: "Müşteri yorumları",
        icon: Star,
        color: "bg-orange-500"
    }
]

export default function PageEditor() {
    const params = useParams()
    const router = useRouter()
    const [page, setPage] = useState<Page | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        slug: "",
        seoTitle: "",
        seoDescription: "",
        isActive: true
    })

    const fetchPage = async () => {
        try {
            const response = await fetch(`/api/pages/${params.id}`)
            if (response.ok) {
                const data = await response.json()
                setPage(data)
                setFormData({
                    title: data.title,
                    description: data.description || "",
                    slug: data.slug,
                    seoTitle: data.seoTitle || "",
                    seoDescription: data.seoDescription || "",
                    isActive: data.isActive
                })
            } else {
                toast.error("Sayfa yüklenirken hata oluştu")
                router.push("/admin/pages")
            }
        } catch (error) {
            toast.error("Sayfa yüklenirken hata oluştu")
            router.push("/admin/pages")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (params.id) {
            fetchPage()
        }
    }, [params.id])

    const handleSave = async () => {
        setSaving(true)
        try {
            const response = await fetch(`/api/pages/${params.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                toast.success("Sayfa başarıyla güncellendi")
                await fetchPage()
            } else {
                const error = await response.json()
                toast.error(error.error || "Sayfa güncellenirken hata oluştu")
            }
        } catch (error) {
            toast.error("Sayfa güncellenirken hata oluştu")
        } finally {
            setSaving(false)
        }
    }

    const addModule = async (moduleType: string) => {
        try {
            const response = await fetch(`/api/pages/${params.id}/modules`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    type: moduleType,
                    order: page?.modules.length || 0,
                    content: getDefaultModuleContent(moduleType)
                }),
            })

            if (response.ok) {
                toast.success("Modül eklendi")
                await fetchPage()
            } else {
                toast.error("Modül eklenirken hata oluştu")
            }
        } catch (error) {
            toast.error("Modül eklenirken hata oluştu")
        }
    }

    const getDefaultModuleContent = (type: string) => {
        switch (type) {
            case "TEXT_IMAGE":
                return {
                    title: "Yeni Başlık",
                    text: "Buraya metin yazın...",
                    image: "",
                    imagePosition: "right"
                }
            case "HERO":
                return {
                    title: "Ana Başlık",
                    subtitle: "Alt başlık",
                    backgroundImage: "",
                    buttonText: "Daha Fazla",
                    buttonLink: "#"
                }
            case "PARALLAX":
                return {
                    title: "Parallax Başlık",
                    text: "Parallax açıklama",
                    backgroundImage: "",
                    height: "400px"
                }
            default:
                return {}
        }
    }

    if (loading) {
        return (
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        )
    }

    if (!page) {
        return (
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">Sayfa bulunamadı</h2>
                    <Button onClick={() => router.push("/admin/pages")} className="mt-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Geri Dön
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 h-screen overflow-hidden">
            {/* Header */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-14 items-center px-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/admin/pages")}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Geri
                    </Button>

                    <div className="flex-1 px-4">
                        <h1 className="text-lg font-semibold">{page.title} - Düzenle</h1>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Badge variant={page.isActive ? "default" : "secondary"}>
                            {page.isActive ? "Aktif" : "Pasif"}
                        </Badge>
                        <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            Önizle
                        </Button>
                        <Button onClick={handleSave} disabled={saving} size="sm">
                            <Save className="mr-2 h-4 w-4" />
                            {saving ? "Kaydediliyor..." : "Kaydet"}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex h-[calc(100vh-3.5rem)]">
                {/* Main Content - Page Preview */}
                <div className="flex-1 overflow-auto">
                    <div className="p-6">
                        {/* Page Settings */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Settings className="mr-2 h-5 w-5" />
                                    Sayfa Ayarları
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Sayfa Başlığı</Label>
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="slug">URL Slug</Label>
                                        <Input
                                            id="slug"
                                            value={formData.slug}
                                            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Açıklama</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        rows={2}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="seoTitle">SEO Başlığı</Label>
                                        <Input
                                            id="seoTitle"
                                            value={formData.seoTitle}
                                            onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="isActive"
                                            checked={formData.isActive}
                                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                                        />
                                        <Label htmlFor="isActive">Sayfa aktif</Label>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="seoDescription">SEO Açıklaması</Label>
                                    <Textarea
                                        id="seoDescription"
                                        value={formData.seoDescription}
                                        onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                                        rows={2}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Page Modules */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Sayfa Modülleri</CardTitle>
                                <CardDescription>
                                    Sayfanızın içeriğini oluşturan modüller
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {page.modules.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Grid3X3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>Henüz modül eklenmemiş</p>
                                        <p className="text-sm">Sağ panelden modül ekleyebilirsiniz</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {page.modules
                                            .sort((a, b) => a.order - b.order)
                                            .map((module) => (
                                                <Card key={module.id} className="border-l-4 border-l-primary">
                                                    <CardContent className="p-4">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-3">
                                                                <Badge variant="outline">{module.type}</Badge>
                                                                <span className="font-medium">
                                                                    {moduleTypes.find(t => t.type === module.type)?.name || module.type}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <Badge variant={module.isActive ? "default" : "secondary"} className="text-xs">
                                                                    {module.isActive ? "Aktif" : "Pasif"}
                                                                </Badge>
                                                                <Button variant="outline" size="sm">
                                                                    Düzenle
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <div className="mt-2 text-sm text-muted-foreground">
                                                            Sıra: {module.order + 1}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Right Sidebar - Module Panel */}
                <div className="w-80 border-l bg-muted/30 overflow-auto">
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Modüller</h3>
                            <Badge variant="outline">{page.modules.length} modül</Badge>
                        </div>

                        <div className="space-y-3">
                            {moduleTypes.map((moduleType) => (
                                <Card
                                    key={moduleType.type}
                                    className="cursor-pointer hover:shadow-md transition-shadow"
                                    onClick={() => addModule(moduleType.type)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center space-x-3">
                                            <div className={`p-2 rounded-lg ${moduleType.color} text-white`}>
                                                <moduleType.icon className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-sm">{moduleType.name}</h4>
                                                <p className="text-xs text-muted-foreground">
                                                    {moduleType.description}
                                                </p>
                                            </div>
                                            <Plus className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <Separator className="my-6" />

                        <div>
                            <h4 className="font-medium mb-3">Sayfa Bilgileri</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Oluşturulma:</span>
                                    <span>{new Date(page.createdAt).toLocaleDateString('tr-TR')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Güncelleme:</span>
                                    <span>{new Date(page.updatedAt).toLocaleDateString('tr-TR')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Durum:</span>
                                    <Badge variant={page.isActive ? "default" : "secondary"} className="text-xs">
                                        {page.isActive ? "Aktif" : "Pasif"}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 