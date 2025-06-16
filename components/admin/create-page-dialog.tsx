"use client"

import { useState } from "react"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface GlobalPage {
    id: string
    slug: string
    title: string
    parentId?: string | null
}

interface Language {
    id: string
    code: string
    name: string
    flag: string
    isDefault: boolean
    isActive: boolean
}

interface CreatePageDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onPageCreated: () => void
    languages: Language[]
    pages: GlobalPage[]
}

export function CreatePageDialog({
    open,
    onOpenChange,
    onPageCreated,
    languages,
    pages
}: CreatePageDialogProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        slug: "",
        seoTitle: "",
        seoDescription: "",
        parentId: ""
    })

    const generateSlug = (title: string) => {
        // Türkçe karakterleri İngilizce karşılıklarına çevir
        const turkishMap: { [key: string]: string } = {
            'ç': 'c', 'Ç': 'C',
            'ğ': 'g', 'Ğ': 'G',
            'ı': 'i', 'I': 'I',
            'İ': 'I', 'i': 'i',
            'ö': 'o', 'Ö': 'O',
            'ş': 's', 'Ş': 'S',
            'ü': 'u', 'Ü': 'U'
        }

        return title
            .split('')
            .map(char => turkishMap[char] || char)
            .join('')
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Sadece harf, rakam, boşluk ve tire
            .replace(/\s+/g, '-') // Boşlukları tire yap
            .replace(/-+/g, '-') // Çoklu tireleri tek tire yap
            .replace(/^-+|-+$/g, '') // Başındaki ve sonundaki tireleri kaldır
            .trim()
    }

    const handleTitleChange = (title: string) => {
        setFormData(prev => ({
            ...prev,
            title,
            slug: generateSlug(title),
            seoTitle: title // SEO başlığını otomatik doldur
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

        if (languages.length === 0) {
            toast.error("En az bir dil tanımlanmalıdır")
            return
        }

        setLoading(true)

        try {
            // Tüm aktif diller için içerik oluştur
            const contents = languages
                .filter(lang => lang.isActive)
                .map(language => ({
                    languageId: language.id,
                    title: formData.title, // Başlangıçta aynı başlık, sonra her dilde ayrı düzenlenebilir
                    description: formData.description,
                    slug: formData.slug, // Başlangıçta aynı slug, sonra her dilde ayrı düzenlenebilir
                    seoTitle: formData.seoTitle || formData.title,
                    seoDescription: formData.seoDescription || formData.description
                }))

            const submitData = {
                slug: formData.slug,
                parentId: formData.parentId === "none" || !formData.parentId ? null : formData.parentId,
                createForAllLanguages: true, // Tüm diller için oluştur
                contents: contents
            }

            const response = await fetch("/api/admin/pages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(submitData),
            })

            if (response.ok) {
                const result = await response.json()
                toast.success(`Sayfa ${contents.length} dilde başarıyla oluşturuldu`)
                onPageCreated()
                onOpenChange(false)
                // Reset form
                setFormData({
                    title: "",
                    description: "",
                    slug: "",
                    seoTitle: "",
                    seoDescription: "",
                    parentId: ""
                })
            } else {
                const error = await response.json()
                toast.error(error.error || "Sayfa oluşturulurken hata oluştu")
            }
        } catch (error) {
            console.error("Error creating page:", error)
            toast.error("Sayfa oluşturulurken hata oluştu")
        } finally {
            setLoading(false)
        }
    }

    // Ana seviye sayfaları filtrele
    const parentPages = pages.filter(page => !page.parentId)
    const activeLanguages = languages.filter(lang => lang.isActive)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Yeni Sayfa Oluştur</DialogTitle>
                    <DialogDescription>
                        Sayfa tüm aktif dillerde otomatik olarak oluşturulacak
                    </DialogDescription>
                </DialogHeader>

                {/* Bilgi mesajı */}
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                        Bu sayfa <strong>{activeLanguages.length} dilde</strong> oluşturulacak: {activeLanguages.map(lang => lang.name).join(', ')}.
                        Her dil için ayrı içerik düzenleyebilirsiniz.
                    </AlertDescription>
                </Alert>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Sayfa Başlığı */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Sayfa Başlığı *</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            placeholder="Örn: Hakkımızda"
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Bu başlık tüm dillerde başlangıç olarak kullanılacak
                        </p>
                    </div>

                    {/* Slug */}
                    <div className="space-y-2">
                        <Label htmlFor="slug">URL Slug *</Label>
                        <Input
                            id="slug"
                            value={formData.slug}
                            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                            placeholder="Örn: hakkimizda"
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Slug tüm dillerde aynı olacak (örn: /tr/hakkimizda, /en/hakkimizda)
                        </p>
                    </div>

                    {/* Açıklama */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Açıklama</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Sayfa hakkında kısa açıklama"
                            rows={3}
                        />
                    </div>

                    {/* SEO Başlığı */}
                    <div className="space-y-2">
                        <Label htmlFor="seoTitle">SEO Başlığı</Label>
                        <Input
                            id="seoTitle"
                            value={formData.seoTitle}
                            onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                            placeholder="Arama motorları için başlık"
                        />
                        <p className="text-xs text-muted-foreground">
                            Boş bırakılırsa sayfa başlığı kullanılır
                        </p>
                    </div>

                    {/* SEO Açıklaması */}
                    <div className="space-y-2">
                        <Label htmlFor="seoDescription">SEO Açıklaması</Label>
                        <Textarea
                            id="seoDescription"
                            value={formData.seoDescription}
                            onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                            placeholder="Arama motorları için açıklama"
                            rows={2}
                        />
                        <p className="text-xs text-muted-foreground">
                            Boş bırakılırsa sayfa açıklaması kullanılır
                        </p>
                    </div>

                    {/* Üst Sayfa */}
                    <div className="space-y-2">
                        <Label htmlFor="parentId">Üst Sayfa (İsteğe bağlı)</Label>
                        <Select
                            value={formData.parentId}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, parentId: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Ana seviye sayfa" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Ana seviye sayfa</SelectItem>
                                {parentPages.map((page) => (
                                    <SelectItem key={page.id} value={page.id}>
                                        {page.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </form>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        İptal
                    </Button>
                    <Button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {loading ? "Oluşturuluyor..." : `${activeLanguages.length} Dilde Oluştur`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
} 