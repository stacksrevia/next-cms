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
    GripVertical,
    Image,
    Type,
    Mail,
    FileText,
    Images,
    Hash,
    Star,
    List,
    Code,
    Package,
    Folder,
    BookOpen,
    File,
    AlignLeft,
    Send,
    Layers,
    Sliders
} from "lucide-react"
import { toast } from "sonner"
import ReactCountryFlag from 'react-country-flag'
import { TextImageModal } from "@/components/admin/text-image-modal"
import { SliderModal } from "@/components/admin/slider-modal"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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
    language?: Language
    parent?: {
        id: string
        title: string
        slug: string
    }
    modules?: Module[]
}

interface FormData {
    title: string
    description: string
    slug: string
    seoTitle: string
    seoDescription: string
    isActive: boolean
}

// Modül tipleri ve görsel bilgileri
const MODULE_TYPES = {
    TEXT_IMAGE: {
        name: "Text + Image",
        icon: Image,
        description: "Metin ve resim kombinasyonu"
    },
    PARALLAX: {
        name: "Parallax",
        icon: Layers,
        description: "Parallax efekti ile görsel"
    },
    SLIDER: {
        name: "Slider",
        icon: Sliders,
        description: "Resim ve içerik slider'ı"
    },
    CONTACT_FORM: {
        name: "İletişim Form",
        icon: Mail,
        description: "İletişim formu"
    },
    DYNAMIC_FORM: {
        name: "Dinamik Form",
        icon: FileText,
        description: "Özelleştirilebilir form"
    },
    GALLERY: {
        name: "Galeri",
        icon: Images,
        description: "Resim galerisi"
    },
    COUNTER: {
        name: "Counter",
        icon: Hash,
        description: "Sayaç ve istatistikler"
    },
    ICONS: {
        name: "Icons",
        icon: Star,
        description: "İkon listesi"
    },
    BLOG_LIST: {
        name: "Blog Listeleme",
        icon: BookOpen,
        description: "Blog yazıları listesi"
    },
    HTML_EDITOR: {
        name: "HTML Editor",
        icon: Code,
        description: "HTML içerik editörü"
    },
    PRODUCT_LIST: {
        name: "Ürün Listeleme",
        icon: Package,
        description: "Ürün listesi"
    },
    CATEGORY_LIST: {
        name: "Kategori Listeleme",
        icon: List,
        description: "Kategori listesi"
    },
    CATALOG_LIST: {
        name: "Katalog Listeleme",
        icon: Folder,
        description: "Katalog listesi"
    },
    FILE_LIST: {
        name: "Dosya Listeleme",
        icon: File,
        description: "Dosya listesi"
    },
    PARAGRAPH: {
        name: "Paragraf",
        icon: AlignLeft,
        description: "Metin paragrafı"
    },
    NEWSLETTER: {
        name: "E-Bülten",
        icon: Send,
        description: "E-bülten kayıt formu"
    }
}

// Sortable Module Item Component
function SortableModuleItem({ module, onEdit, onDelete }: {
    module: Module
    onEdit: (module: Module) => void
    onDelete: (moduleId: string) => void
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: module.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    const moduleInfo = MODULE_TYPES[module.type as keyof typeof MODULE_TYPES]
    const ModuleIcon = moduleInfo?.icon || Grid3X3

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className="border-l-4 border-l-primary"
        >
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div
                            {...attributes}
                            {...listeners}
                            className="cursor-grab active:cursor-grabbing"
                        >
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex items-center space-x-2">
                            <ModuleIcon className="h-4 w-4 text-primary" />
                            <div>
                                <h4 className="font-medium">
                                    {moduleInfo?.name || module.type}
                                    {(() => {
                                        const title = module.content?.title;
                                        return title &&
                                            typeof title === 'string' &&
                                            title.trim() ? (
                                            <span className="text-muted-foreground font-normal">
                                                {" - "}{title}
                                            </span>
                                        ) : null;
                                    })()}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    {moduleInfo?.description || "Modül açıklaması"}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Badge variant={module.isActive ? "default" : "secondary"}>
                            {module.isActive ? "Aktif" : "Pasif"}
                        </Badge>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(module)}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDelete(module.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
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
    const [editingModule, setEditingModule] = useState<Module | null>(null)
    const [isModuleModalOpen, setIsModuleModalOpen] = useState(false)

    // Confirmation dialog states
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        isOpen: boolean
        moduleId: string | null
        moduleName: string
    }>({
        isOpen: false,
        moduleId: null,
        moduleName: ""
    })

    const [formData, setFormData] = useState<FormData>({
        title: "",
        description: "",
        slug: "",
        seoTitle: "",
        seoDescription: "",
        isActive: true,
    })

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    useEffect(() => {
        fetchLanguages()
        fetchPage()
    }, [pageId])

    const fetchLanguages = async () => {
        try {
            const response = await fetch("/api/admin/languages")
            if (response.ok) {
                const result = await response.json()
                // API'den gelen veri { languages: [...] } formatında
                const languagesData = result.languages || []
                setLanguages(languagesData)

                // Varsayılan dili seç
                const defaultLang = languagesData.find((lang: Language) => lang.isDefault)
                if (defaultLang) {
                    setCurrentLanguage(defaultLang)
                }
            }
        } catch (error) {
            console.error("Error fetching languages:", error)
            toast.error("Diller yüklenirken hata oluştu")
        }
    }

    const fetchPage = async () => {
        try {
            const response = await fetch(`/api/admin/pages/${pageId}`)
            if (response.ok) {
                const data = await response.json()

                // Veri yapısını kontrol et
                if (!data || typeof data !== 'object') {
                    throw new Error('Geçersiz sayfa verisi')
                }

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
                const errorData = await response.json().catch(() => ({}))
                toast.error(errorData.error || "Sayfa yüklenirken hata oluştu")
            }
        } catch (error) {
            console.error("Error fetching page:", error)
            toast.error("Sayfa yüklenirken hata oluştu")
        } finally {
            setLoading(false)
        }
    }

    const handleLanguageChange = async (language: Language) => {
        setCurrentLanguage(language)
        setLoading(true)

        try {
            // Seçilen dil için sayfa içeriğini yükle
            const response = await fetch(`/api/admin/pages/${pageId}?languageId=${language.id}`)
            if (response.ok) {
                const data = await response.json()

                // Form verilerini güncelle
                setFormData({
                    title: data.title || "",
                    description: data.description || "",
                    slug: data.slug || "",
                    seoTitle: data.seoTitle || "",
                    seoDescription: data.seoDescription || "",
                    isActive: data.isActive ?? true,
                })

                // Sayfa verilerini güncelle (modüller için)
                setPage(prev => prev ? {
                    ...prev,
                    title: data.title || prev.title,
                    description: data.description || prev.description,
                    slug: data.slug || prev.slug,
                    seoTitle: data.seoTitle || prev.seoTitle,
                    seoDescription: data.seoDescription || prev.seoDescription,
                    modules: data.modules || []
                } : null)

                toast.success(`${language.name} dili yüklendi`)
            } else {
                toast.error("Dil içeriği yüklenirken hata oluştu")
            }
        } catch (error) {
            console.error("Error loading language content:", error)
            toast.error("Dil içeriği yüklenirken hata oluştu")
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const response = await fetch(`/api/admin/pages/${pageId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    languageId: currentLanguage?.id
                }),
            })

            if (response.ok) {
                toast.success("Sayfa başarıyla güncellendi")
            } else {
                const error = await response.json()
                toast.error(error.message || "Sayfa güncellenirken hata oluştu")
            }
        } catch (error) {
            console.error("Error saving page:", error)
            toast.error("Sayfa güncellenirken hata oluştu")
        } finally {
            setSaving(false)
        }
    }

    const addModule = async (moduleType: string) => {
        if (!currentLanguage) {
            toast.error("Lütfen bir dil seçin")
            return
        }

        try {
            const response = await fetch(`/api/admin/pages/${pageId}/modules`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    type: moduleType,
                    content: getDefaultModuleContent(moduleType),
                    order: (Array.isArray(page?.modules) ? page.modules.length : 0),
                    languageId: currentLanguage.id
                }),
            })

            if (response.ok) {
                toast.success(`${currentLanguage.name} dili için modül eklendi`)
                // Mevcut dil için sayfayı yeniden yükle
                await handleLanguageChange(currentLanguage)
            } else {
                const error = await response.json()
                toast.error(error.message || "Modül eklenirken hata oluştu")
            }
        } catch (error) {
            console.error("Error adding module:", error)
            toast.error("Modül eklenirken hata oluştu")
        }
    }

    const getDefaultModuleContent = (type: string) => {
        switch (type) {
            case "TEXT_IMAGE":
                return {
                    title: "Başlık",
                    text: "Metin içeriği",
                    image: "",
                    imagePosition: "right"
                }
            case "PARALLAX":
                return {
                    title: "Parallax Başlığı",
                    text: "Parallax içeriği",
                    backgroundImage: ""
                }
            case "SLIDER":
                return {
                    sliderType: "horizontal",
                    loop: false,
                    autoplay: false,
                    navigation: true,
                    animatedArrows: false,
                    pagination: true,
                    slidesPerView: 1,
                    isActive: true,
                    videoDelay: 3300,
                    autoplayDelay: 2500,
                    speed: 1000,
                    titleSize: "32px",
                    paragraphSize: "14px",
                    margin: "",
                    height: "85vh",
                    effect: "",
                    uniqueId: `vira-slider-${Date.now()}`,
                    slides: [
                        {
                            id: "slide-1",
                            type: "image",
                            imageUrl: "https://via.placeholder.com/1920x1080/4f46e5/ffffff?text=Slide+1",
                            videoUrl: "",
                            title: "Test Slide 1",
                            titleType: "h1",
                            content: "<p>Bu bir test slide'ıdır. Slider'ın çalışıp çalışmadığını kontrol etmek için oluşturulmuştur.</p>",
                            button1Text: "Buton 1",
                            button1Link: "#",
                            button2Text: "Buton 2",
                            button2Link: "#",
                            button3Text: "",
                            button3Link: "",
                            filigranColor: "#000000",
                            textColor: "#ffffff",
                            opacity: 0.5,
                            contentPosition: "left",
                            isActive: true,
                            order: 1
                        },
                        {
                            id: "slide-2",
                            type: "image",
                            imageUrl: "https://via.placeholder.com/1920x1080/dc2626/ffffff?text=Slide+2",
                            videoUrl: "",
                            title: "Test Slide 2",
                            titleType: "h1",
                            content: "<p>İkinci test slide'ı. Slider geçişlerini test etmek için kullanılır.</p>",
                            button1Text: "Test Butonu",
                            button1Link: "#",
                            button2Text: "",
                            button2Link: "",
                            button3Text: "",
                            button3Link: "",
                            filigranColor: "#000000",
                            textColor: "#ffffff",
                            opacity: 0.4,
                            contentPosition: "center",
                            isActive: true,
                            order: 2
                        }
                    ]
                }
            case "CONTACT_FORM":
                return {
                    title: "İletişim Formu",
                    fields: ["name", "email", "message"]
                }
            case "DYNAMIC_FORM":
                return {
                    title: "Dinamik Form",
                    fields: []
                }
            case "GALLERY":
                return {
                    title: "Galeri",
                    images: []
                }
            case "COUNTER":
                return {
                    title: "Sayaçlar",
                    counters: []
                }
            case "ICONS":
                return {
                    title: "İkonlar",
                    icons: []
                }
            case "BLOG_LIST":
                return {
                    title: "Blog Yazıları",
                    limit: 10
                }
            case "HTML_EDITOR":
                return {
                    title: "HTML İçerik",
                    content: ""
                }
            case "PRODUCT_LIST":
                return {
                    title: "Ürünler",
                    limit: 12
                }
            case "CATEGORY_LIST":
                return {
                    title: "Kategoriler",
                    limit: 10
                }
            case "CATALOG_LIST":
                return {
                    title: "Kataloglar",
                    limit: 10
                }
            case "FILE_LIST":
                return {
                    title: "Dosyalar",
                    limit: 10
                }
            case "PARAGRAPH":
                return {
                    title: "Paragraf",
                    content: "Paragraf içeriği"
                }
            case "NEWSLETTER":
                return {
                    title: "E-Bülten",
                    description: "E-bülten kayıt formu"
                }
            default:
                return {}
        }
    }

    const handleEditModule = (module: Module) => {
        // TEXT_IMAGE ve SLIDER modülleri için modal aç
        if (module.type === "TEXT_IMAGE" || module.type === "SLIDER") {
            setEditingModule(module)
            setIsModuleModalOpen(true)
        } else {
            // Diğer modüller için henüz modal yok
            toast.info(`${MODULE_TYPES[module.type as keyof typeof MODULE_TYPES]?.name || module.type} modülü için düzenleme henüz mevcut değil`)
        }
    }

    const handleSaveModule = async (moduleContent: any) => {
        if (!editingModule || !currentLanguage) return

        try {
            const response = await fetch(`/api/admin/pages/${pageId}/modules/${editingModule.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content: moduleContent,
                    languageId: currentLanguage.id
                }),
            })

            if (response.ok) {
                toast.success("Modül başarıyla güncellendi")
                await handleLanguageChange(currentLanguage)
                setIsModuleModalOpen(false)
                setEditingModule(null)
            } else {
                const error = await response.json()
                toast.error(error.message || "Modül güncellenirken hata oluştu")
            }
        } catch (error) {
            console.error("Error updating module:", error)
            toast.error("Modül güncellenirken hata oluştu")
        }
    }

    const handleDeleteModule = (moduleId: string) => {
        const module = page?.modules?.find(m => m.id === moduleId)
        const moduleInfo = MODULE_TYPES[module?.type as keyof typeof MODULE_TYPES]

        setDeleteConfirmation({
            isOpen: true,
            moduleId,
            moduleName: moduleInfo?.name || module?.type || "Modül"
        })
    }

    const confirmDeleteModule = async () => {
        if (!deleteConfirmation.moduleId || !currentLanguage) return

        try {
            const response = await fetch(`/api/admin/pages/${pageId}/modules/${deleteConfirmation.moduleId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    languageId: currentLanguage.id
                }),
            })

            if (response.ok) {
                toast.success("Modül başarıyla silindi")
                await handleLanguageChange(currentLanguage)
            } else {
                const error = await response.json()
                toast.error(error.message || "Modül silinirken hata oluştu")
            }
        } catch (error) {
            console.error("Error deleting module:", error)
            toast.error("Modül silinirken hata oluştu")
        }
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event

        if (!over || active.id === over.id) {
            return
        }

        if (!page?.modules || !currentLanguage) return

        const oldIndex = page.modules.findIndex((module) => module.id === active.id)
        const newIndex = page.modules.findIndex((module) => module.id === over.id)

        if (oldIndex === -1 || newIndex === -1) return

        const newModules = arrayMove(page.modules, oldIndex, newIndex)

        // Update order values
        const updatedModules = newModules.map((module, index) => ({
            ...module,
            order: index
        }))

        // Optimistic update
        setPage(prev => prev ? { ...prev, modules: updatedModules } : null)

        try {
            // Update order on server
            const updatePromises = updatedModules.map((module) =>
                fetch(`/api/admin/pages/${pageId}/modules/${module.id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        content: module.content,
                        order: module.order,
                        languageId: currentLanguage.id
                    }),
                })
            )

            await Promise.all(updatePromises)
            toast.success("Modül sırası güncellendi")
        } catch (error) {
            console.error("Error updating module order:", error)
            toast.error("Modül sırası güncellenirken hata oluştu")
            // Revert optimistic update
            await handleLanguageChange(currentLanguage)
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
            {/* Header - Responsive iyileştirmesi */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-14 items-center px-3 lg:px-6">
                    <div className="flex items-center space-x-2 lg:space-x-4 flex-1 min-w-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push("/admin/pages")}
                            className="shrink-0"
                        >
                            <ArrowLeft className="mr-1 lg:mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Geri</span>
                        </Button>
                        <div className="flex items-center space-x-2 min-w-0">
                            <h1 className="text-base lg:text-lg font-semibold truncate">Sayfa Düzenle</h1>
                            {currentLanguage && (
                                <Badge variant="outline" className="hidden sm:flex items-center space-x-1 shrink-0">
                                    <ReactCountryFlag
                                        countryCode={currentLanguage.flag}
                                        svg
                                        style={{
                                            width: '1em',
                                            height: '1em',
                                        }}
                                    />
                                    <span className="hidden md:inline">{currentLanguage.name}</span>
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-1 lg:space-x-2 shrink-0">
                        {languages.length > 0 && (
                            <Select
                                value={currentLanguage?.id || ""}
                                onValueChange={(value) => {
                                    const language = languages.find(lang => lang.id === value)
                                    if (language) {
                                        handleLanguageChange(language)
                                    }
                                }}
                            >
                                <SelectTrigger className="w-[100px] lg:w-[140px]">
                                    <SelectValue placeholder="Dil" />
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
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        <Button onClick={handleSave} disabled={saving} size="sm">
                            <Save className="mr-1 lg:mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">{saving ? "Kaydediliyor..." : "Kaydet"}</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile/Desktop Layout */}
            <div className="flex flex-1 overflow-hidden">
                {/* Main Content - Page Preview */}
                <div className="flex-1 overflow-auto">
                    <div className="p-3 lg:p-6">
                        {/* Page Settings */}
                        <Card className="mb-4 lg:mb-6">
                            <CardHeader className="pb-3 lg:pb-6">
                                <CardTitle className="flex items-center text-base lg:text-lg">
                                    <Settings className="mr-2 h-4 lg:h-5 w-4 lg:w-5" />
                                    Sayfa Ayarları
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                            <CardHeader className="pb-3 lg:pb-6">
                                <CardTitle className="text-base lg:text-lg">Sayfa Modülleri</CardTitle>
                                <CardDescription>
                                    Sayfanızın içeriğini oluşturan modüller. Sürükleyip bırakarak sıralayabilirsiniz.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {!Array.isArray(page.modules) || page.modules.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Grid3X3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>Henüz modül eklenmemiş</p>
                                        <p className="text-sm">Sağ panelden modül ekleyebilirsiniz</p>
                                    </div>
                                ) : (
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <SortableContext
                                            items={page.modules.map(m => m.id)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            <div className="space-y-4">
                                                {page.modules
                                                    .sort((a, b) => a.order - b.order)
                                                    .map((module) => (
                                                        <SortableModuleItem
                                                            key={module.id}
                                                            module={module}
                                                            onEdit={handleEditModule}
                                                            onDelete={handleDeleteModule}
                                                        />
                                                    ))}
                                            </div>
                                        </SortableContext>
                                    </DndContext>
                                )}
                            </CardContent>
                        </Card>

                        {/* Mobile Module Panel - Sadece mobile'da görünür */}
                        <div className="lg:hidden mt-4">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center justify-between text-base">
                                        <span>Modül Ekle</span>
                                        <Badge variant="outline">{Array.isArray(page.modules) ? page.modules.length : 0} modül</Badge>
                                    </CardTitle>
                                    {currentLanguage && (
                                        <CardDescription className="flex items-center space-x-2">
                                            <ReactCountryFlag
                                                countryCode={currentLanguage.flag}
                                                svg
                                                style={{
                                                    width: '1em',
                                                    height: '1em',
                                                }}
                                            />
                                            <span className="font-medium">{currentLanguage.name}</span>
                                            <span className="text-muted-foreground">dili için modül ekle</span>
                                        </CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {Object.entries(MODULE_TYPES).map(([type, info]) => {
                                            const IconComponent = info.icon
                                            return (
                                                <Button
                                                    key={type}
                                                    variant="outline"
                                                    className="justify-start h-auto p-3"
                                                    onClick={() => addModule(type)}
                                                >
                                                    <div className="flex items-start space-x-3">
                                                        <IconComponent className="h-4 w-4 mt-0.5 text-primary" />
                                                        <div className="text-left">
                                                            <div className="font-medium text-sm">{info.name}</div>
                                                            <div className="text-xs text-muted-foreground">{info.description}</div>
                                                        </div>
                                                    </div>
                                                </Button>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Desktop'ta görünür */}
                <div className="hidden lg:block w-80 border-l bg-muted/30 overflow-auto">
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Modüller</h3>
                            <Badge variant="outline">{Array.isArray(page.modules) ? page.modules.length : 0} modül</Badge>
                        </div>

                        {currentLanguage && (
                            <div className="mb-4 p-3 bg-muted rounded-lg">
                                <div className="flex items-center space-x-2 text-sm">
                                    <ReactCountryFlag
                                        countryCode={currentLanguage.flag}
                                        svg
                                        style={{
                                            width: '1em',
                                            height: '1em',
                                        }}
                                    />
                                    <span className="font-medium">{currentLanguage.name}</span>
                                    <span className="text-muted-foreground">dili için modül ekle</span>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            {Object.entries(MODULE_TYPES).map(([type, info]) => {
                                const IconComponent = info.icon
                                return (
                                    <Button
                                        key={type}
                                        variant="outline"
                                        className="w-full justify-start h-auto p-3"
                                        onClick={() => addModule(type)}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <IconComponent className="h-4 w-4 mt-0.5 text-primary" />
                                            <div className="text-left">
                                                <div className="font-medium">{info.name}</div>
                                                <div className="text-xs text-muted-foreground">{info.description}</div>
                                            </div>
                                        </div>
                                    </Button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Text Image Modal - TEXT_IMAGE için */}
            {editingModule?.type === "TEXT_IMAGE" && (
                <TextImageModal
                    isOpen={isModuleModalOpen}
                    onClose={() => {
                        setIsModuleModalOpen(false)
                        setEditingModule(null)
                    }}
                    onSave={handleSaveModule}
                    initialContent={editingModule?.content}
                />
            )}

            {/* Slider Modal - SLIDER için */}
            {editingModule?.type === "SLIDER" && (
                <SliderModal
                    isOpen={isModuleModalOpen}
                    onClose={() => {
                        setIsModuleModalOpen(false)
                        setEditingModule(null)
                    }}
                    onSave={handleSaveModule}
                    initialContent={editingModule?.content}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                open={deleteConfirmation.isOpen}
                onOpenChange={(open) => setDeleteConfirmation({ isOpen: open, moduleId: null, moduleName: "" })}
                onConfirm={confirmDeleteModule}
                title="Modülü Sil"
                description={`"${deleteConfirmation.moduleName}" modülünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
                confirmText="Sil"
                cancelText="İptal"
                variant="destructive"
            />
        </div>
    )
} 