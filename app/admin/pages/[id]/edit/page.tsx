"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    ArrowLeft,
    Save,
    Eye,
    Settings,
    Grid3X3,
    Plus,
    Trash2,
    Edit,
    GripVertical
} from "lucide-react"
import { toast } from "sonner"
import ReactCountryFlag from 'react-country-flag'

interface Module {
    id: string
    type: string
    content: Record<string, unknown>
    order: number
    isActive: boolean
}

interface Language {
    id: string
    code: string
    name: string
    flag: string
    isDefault: boolean
    isActive: boolean
}

interface Page {
    id: string
    title: string
    description?: string
    slug: string
    seoTitle?: string
    seoDescription?: string
    parentId?: string | null
    languageId: string
    order: number
    isActive: boolean
    createdAt: string
    updatedAt: string
    language: Language
    parent?: {
        id: string
        title: string
        slug: string
    }
    modules: Module[]
}

interface FormData {
    title: string
    description: string
    slug: string
    seoTitle: string
    seoDescription: string
    isActive: boolean
}

export default function PageEditor() {
    const params = useParams()
    const router = useRouter()
    const pageId = params.id as string

    const [page, setPage] = useState<Page | null>(null)
    const [languages, setLanguages] = useState<Language[]>([])
    const [currentLanguage, setCurrentLanguage] = useState<Language | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [formData, setFormData] = useState<FormData>({
        title: "",
        description: "",
        slug: "",
        seoTitle: "",
        seoDescription: "",
        isActive: true,
    })

    useEffect(() => {
        fetchLanguages()
        fetchPage()
    }, [pageId])

    const fetchLanguages = async () => {
        try {
            const response = await fetch("/api/admin/languages")
            if (response.ok) {
                const data = await response.json()
                setLanguages(data)

                // Varsayılan dili seç
                const defaultLang = data.find((lang: Language) => lang.isDefault)
                if (defaultLang) {
                    setCurrentLanguage(defaultLang)
                }
            }
        } catch (error) {
            console.error("Error fetching languages:", error)
        }
    }

    const fetchPage = async () => {
        try {
            const response = await fetch(`/api/admin/pages/${pageId}`)
            if (response.ok) {
                const data = await response.json()
                setPage(data)
                setFormData({
                    title: data.title || "",
                    description: data.description || "",
                    slug: data.slug || "",
                    seoTitle: data.seoTitle || "",
                    seoDescription: data.seoDescription || "",
                    isActive: data.isActive ?? true,
                })

                if (data.language) {
                    setCurrentLanguage(data.language)
                }
            } else {
                toast.error("Sayfa yüklenirken hata oluştu")
            }
        } catch (error) {
            console.error("Error fetching page:", error)
            toast.error("Sayfa yüklenirken hata oluştu")
        } finally {
            setLoading(false)
        }
    }

    const handleLanguageChange = (language: Language) => {
        setCurrentLanguage(language)
        // TODO: Dil değiştirildiğinde sayfayı yeniden yükle
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const response = await fetch(`/api/admin/pages/${pageId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                toast.success("Sayfa başarıyla kaydedildi")
                fetchPage() // Sayfayı yeniden yükle
            } else {
                const error = await response.json()
                toast.error(error.message || "Kaydetme sırasında hata oluştu")
            }
        } catch (error) {
            console.error("Error saving page:", error)
            toast.error("Kaydetme sırasında hata oluştu")
        } finally {
            setSaving(false)
        }
    }

    const addModule = async (moduleType: string) => {
        try {
            const response = await fetch(`/api/admin/pages/${pageId}/modules`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    type: moduleType,
                    content: getDefaultModuleContent(moduleType),
                    order: page?.modules.length || 0,
                }),
            })

            if (response.ok) {
                toast.success("Modül eklendi")
                fetchPage()
            } else {
                toast.error("Modül eklenirken hata oluştu")
            }
        } catch (error) {
            console.error("Error adding module:", error)
            toast.error("Modül eklenirken hata oluştu")
        }
    }

    const getDefaultModuleContent = (type: string) => {
        switch (type) {
            case "HERO":
                return {
                    title: "Ana Başlık",
                    subtitle: "Alt başlık",
                    buttonText: "Buton Metni",
                    backgroundImage: ""
                }
            case "TEXT_IMAGE":
                return {
                    title: "Başlık",
                    text: "Metin içeriği",
                    image: "",
                    imagePosition: "right"
                }
            case "GALLERY":
                return {
                    title: "Galeri",
                    description: "Galeri açıklaması",
                    images: []
                }
            default:
                return {}
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!page) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Sayfa Bulunamadı</h2>
                    <p className="text-muted-foreground mb-4">Aradığınız sayfa bulunamadı.</p>
                    <Button onClick={() => router.push("/admin/pages")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Sayfalara Dön
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="h-screen flex flex-col">
            {/* Header */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-14 items-center justify-between px-6">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push("/admin/pages")}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Geri
                        </Button>
                        <div>
                            <h1 className="text-lg font-semibold">{page.title}</h1>
                            <p className="text-sm text-muted-foreground">
                                Sayfa Düzenleme
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Select
                            value={currentLanguage?.id}
                            onValueChange={(value) => {
                                const language = languages.find(lang => lang.id === value)
                                if (language) handleLanguageChange(language)
                            }}
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {languages.map((language) => (
                                    <SelectItem key={language.id} value={language.id}>
                                        <div className="flex items-center space-x-2">
                                            <ReactCountryFlag
                                                countryCode={language.flag}
                                                svg
                                                style={{
                                                    width: '1em',
                                                    height: '1em',
                                                }}
                                            />
                                            <span>{language.name}</span>
                                            {language.isDefault && (
                                                <span className="text-xs text-muted-foreground">(Varsayılan)</span>
                                            )}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
                            <CardContent>
                                <div className="space-y-4">
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
                                                                <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                                                                <div>
                                                                    <h4 className="font-medium">{module.type}</h4>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        Sıra: {module.order + 1}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <Badge variant={module.isActive ? "default" : "secondary"}>
                                                                    {module.isActive ? "Aktif" : "Pasif"}
                                                                </Badge>
                                                                <Button variant="outline" size="sm">
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button variant="outline" size="sm">
                                                                    <Trash2 className="h-4 w-4" />
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

                        <div className="space-y-2">
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => addModule("HERO")}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Hero Modülü
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => addModule("TEXT_IMAGE")}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Metin + Resim
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => addModule("GALLERY")}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Galeri
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 