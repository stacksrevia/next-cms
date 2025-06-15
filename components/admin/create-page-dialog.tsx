"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface Page {
    id: string
    title: string
    slug: string
}

interface CreatePageDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onPageCreated: () => void
}

export function CreatePageDialog({ open, onOpenChange, onPageCreated }: CreatePageDialogProps) {
    const [loading, setLoading] = useState(false)
    const [pages, setPages] = useState<Page[]>([])
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        slug: "",
        seoTitle: "",
        seoDescription: "",
        parentId: "",
        isActive: true
    })

    // Mevcut sayfaları yükle
    useEffect(() => {
        if (open) {
            fetchPages()
        }
    }, [open])

    const fetchPages = async () => {
        try {
            const response = await fetch("/api/pages")
            if (response.ok) {
                const data = await response.json()
                setPages(data.pages || [])
            }
        } catch (error) {
            console.error("Error fetching pages:", error)
        }
    }

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single
            .trim()
    }

    const handleTitleChange = (title: string) => {
        setFormData(prev => ({
            ...prev,
            title,
            slug: generateSlug(title),
            seoTitle: title // Auto-fill SEO title
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.title.trim()) {
            toast.error("Sayfa başlığı gereklidir")
            return
        }

        if (!formData.slug.trim()) {
            toast.error("Sayfa slug'ı gereklidir")
            return
        }

        setLoading(true)

        try {
            const submitData = {
                ...formData,
                parentId: formData.parentId || null
                // order otomatik olarak API'de hesaplanacak
            }

            const response = await fetch("/api/pages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(submitData),
            })

            if (response.ok) {
                toast.success("Sayfa başarıyla oluşturuldu")
                onPageCreated()
                onOpenChange(false)
                // Reset form
                setFormData({
                    title: "",
                    description: "",
                    slug: "",
                    seoTitle: "",
                    seoDescription: "",
                    parentId: "",
                    isActive: true
                })
            } else {
                const error = await response.json()
                toast.error(error.error || "Sayfa oluşturulurken hata oluştu")
            }
        } catch (error) {
            toast.error("Sayfa oluşturulurken hata oluştu")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Yeni Sayfa Oluştur</DialogTitle>
                    <DialogDescription>
                        Yeni bir sayfa oluşturun. Daha sonra modüller ekleyebilirsiniz.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4">
                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Sayfa Başlığı *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                placeholder="Örn: Hakkımızda"
                                disabled={loading}
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Sayfa Açıklaması</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Sayfa hakkında kısa açıklama..."
                                disabled={loading}
                                rows={3}
                            />
                        </div>

                        {/* Parent Page */}
                        <div className="space-y-2">
                            <Label htmlFor="parentId">Üst Sayfa</Label>
                            <Select
                                value={formData.parentId || "none"}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, parentId: value === "none" ? "" : value }))}
                                disabled={loading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Üst sayfa seçin (isteğe bağlı)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Ana Sayfa (Üst seviye)</SelectItem>
                                    {pages.map((page) => (
                                        <SelectItem key={page.id} value={page.id}>
                                            {page.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Bu sayfa başka bir sayfanın alt sayfası olacaksa üst sayfayı seçin
                            </p>
                        </div>

                        {/* Slug */}
                        <div className="space-y-2">
                            <Label htmlFor="slug">URL Slug *</Label>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-muted-foreground">/</span>
                                <Input
                                    id="slug"
                                    value={formData.slug}
                                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                    placeholder="hakkimizda"
                                    disabled={loading}
                                    required
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                URL'de görünecek isim. Sadece küçük harf, rakam ve tire kullanın.
                            </p>
                        </div>

                        {/* SEO Title */}
                        <div className="space-y-2">
                            <Label htmlFor="seoTitle">SEO Başlığı</Label>
                            <Input
                                id="seoTitle"
                                value={formData.seoTitle}
                                onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                                placeholder="Arama motorları için başlık"
                                disabled={loading}
                            />
                            <p className="text-xs text-muted-foreground">
                                Arama motorlarında görünecek başlık (60 karakter önerilir)
                            </p>
                        </div>

                        {/* SEO Description */}
                        <div className="space-y-2">
                            <Label htmlFor="seoDescription">SEO Açıklaması</Label>
                            <Textarea
                                id="seoDescription"
                                value={formData.seoDescription}
                                onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                                placeholder="Arama motorları için açıklama"
                                disabled={loading}
                                rows={2}
                            />
                            <p className="text-xs text-muted-foreground">
                                Arama motorlarında görünecek açıklama (160 karakter önerilir)
                            </p>
                        </div>

                        {/* Active Status */}
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                                disabled={loading}
                            />
                            <Label htmlFor="isActive">Sayfa aktif</Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            İptal
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Oluşturuluyor...
                                </>
                            ) : (
                                "Sayfa Oluştur"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
} 