"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    FileText,
    ArrowRight,
    Folder,
    FolderOpen,
    GripVertical
} from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { CreatePageDialog } from "@/components/admin/create-page-dialog"
import { toast } from "sonner"
import ReactCountryFlag from 'react-country-flag'
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
import Link from "next/link"

interface Language {
    id: string
    code: string
    name: string
    flag: string
    isDefault: boolean
    isActive: boolean
}

interface Module {
    id: string
    type: string
    content: Record<string, unknown>
    order: number
    isActive: boolean
}

interface GlobalPage {
    id: string
    slug: string
    parentId?: string | null
    order: number
    isActive: boolean
    createdAt: string
    updatedAt: string
    // İçerik bilgileri (seçilen dil için)
    title: string
    description?: string
    seoTitle?: string
    seoDescription?: string
    language?: Language
    modules: Module[]
    // Tüm dillerdeki içerikler
    allContents?: {
        id: string
        languageId: string
        title: string
        description?: string
        language: Language
    }[]
    // İlişkiler
    parent?: {
        id: string
        slug: string
        title: string
    } | null
    children?: {
        id: string
        slug: string
        order: number
        isActive: boolean
        title: string
    }[]
    level?: number
}

// Sortable Row Component
function SortableTableRow({ page, onToggleStatus, onEdit, onDelete, renderPageTitle, isDragDisabled }: {
    page: GlobalPage;
    onToggleStatus: (id: string, status: boolean) => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    renderPageTitle: (page: GlobalPage) => React.ReactNode;
    isDragDisabled?: boolean;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: page.id,
        disabled: isDragDisabled
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.8 : 1,
        zIndex: isDragging ? 1000 : 1,
    }

    return (
        <TableRow
            ref={setNodeRef}
            style={style}
            className={`${isDragging ? "bg-blue-50 shadow-lg border-2 border-blue-200" : ""} transition-all duration-200`}
        >
            <TableCell>
                <div className="flex items-center">
                    {!isDragDisabled ? (
                        <div
                            {...attributes}
                            {...listeners}
                            className="cursor-grab active:cursor-grabbing p-2 mr-3 hover:bg-muted rounded-md transition-colors"
                            title="Sürükleyerek sıralayın"
                        >
                            <GripVertical className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </div>
                    ) : (
                        <div className="p-2 mr-3" title="Belirli bir dil seçin">
                            <GripVertical className="h-4 w-4 text-muted-foreground/30" />
                        </div>
                    )}
                    <div className="flex-1">
                        {renderPageTitle(page)}
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <code className="text-sm bg-muted px-1 py-0.5 rounded">
                    /{page.slug}
                </code>
            </TableCell>
            <TableCell>
                {page.language ? (
                    <div className="flex items-center gap-2">
                        <ReactCountryFlag
                            countryCode={page.language.flag}
                            svg
                            style={{
                                width: '1em',
                                height: '1em',
                            }}
                        />
                        <span className="text-sm">{page.language.name}</span>
                    </div>
                ) : (
                    <span className="text-muted-foreground text-sm">Tüm Diller</span>
                )}
            </TableCell>
            <TableCell>
                {page.parent ? (
                    <Badge variant="outline">
                        {page.parent.title}
                    </Badge>
                ) : (
                    <span className="text-muted-foreground text-sm">Ana seviye</span>
                )}
            </TableCell>
            <TableCell>
                <Badge variant="secondary">
                    {page.order}
                </Badge>
            </TableCell>
            <TableCell>
                <Badge variant={page.isActive ? "default" : "secondary"}>
                    {page.isActive ? "Aktif" : "Pasif"}
                </Badge>
            </TableCell>
            <TableCell>
                <div className="flex flex-col gap-1">
                    <Badge variant="outline">
                        {page.modules.length} modül
                    </Badge>
                    {page.allContents && (
                        <Badge variant="secondary" className="text-xs">
                            {page.allContents.length} dil
                        </Badge>
                    )}
                </div>
            </TableCell>
            <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onToggleStatus(page.id, page.isActive)}
                        title={page.isActive ? "Pasif yap" : "Aktif yap"}
                    >
                        {page.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(page.id)}
                        title="Düzenle"
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(page.id)}
                        title="Sil"
                        className="text-red-600 hover:text-red-700"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    )
}

export default function PagesManagement() {
    const [pages, setPages] = useState<GlobalPage[]>([])
    const [languages, setLanguages] = useState<Language[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set())
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

    // Drag and drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    // Sayfaları getir
    const fetchPages = async () => {
        try {
            setLoading(true)
            // Dil filtresi kaldırıldı, tüm sayfaları getir
            const response = await fetch(`/api/admin/pages`)
            if (response.ok) {
                const data = await response.json()
                setPages(data.pages || [])
            } else {
                toast.error('Sayfalar yüklenirken hata oluştu')
            }
        } catch (error) {
            console.error('Error fetching pages:', error)
            toast.error('Sayfalar yüklenirken hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    // Dilleri getir
    const fetchLanguages = async () => {
        try {
            const response = await fetch("/api/admin/languages")
            if (response.ok) {
                const data = await response.json()
                setLanguages(data.languages || [])
            }
        } catch (error) {
            console.error('Error fetching languages:', error)
        }
    }

    useEffect(() => {
        fetchPages()
        fetchLanguages()
    }, []) // selectedLanguage dependency kaldırıldı

    const toggleExpanded = (pageId: string) => {
        const newExpanded = new Set(expandedPages)
        if (newExpanded.has(pageId)) {
            newExpanded.delete(pageId)
        } else {
            newExpanded.add(pageId)
        }
        setExpandedPages(newExpanded)
    }

    // Drag end handler
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event

        if (!over || active.id === over.id) {
            return
        }

        const activeIndex = hierarchicalPages.findIndex(page => page.id === active.id)
        const overIndex = hierarchicalPages.findIndex(page => page.id === over.id)

        if (activeIndex === -1 || overIndex === -1) return

        const activePage = hierarchicalPages[activeIndex]
        const overPage = hierarchicalPages[overIndex]

        // Aynı parent seviyesinde mi kontrol et
        if (activePage.parentId !== overPage.parentId) {
            toast.error("Sayfalar sadece aynı seviyede sıralanabilir")
            return
        }

        const newHierarchicalPages = arrayMove(hierarchicalPages, activeIndex, overIndex)

        // Yeni sıralamayı hesapla - sadece etkilenen seviyeyi güncelle
        const pageOrders: { id: string; order: number; parentId?: string | null }[] = []

        // Etkilenen seviyedeki sayfaları bul ve yeniden sırala
        const affectedParentId = activePage.parentId
        const sameLevelPages = newHierarchicalPages.filter(p => p.parentId === affectedParentId)

        sameLevelPages.forEach((page, index) => {
            pageOrders.push({
                id: page.id,
                order: index, // 0'dan başla
                parentId: page.parentId
            })
        })

        try {
            const response = await fetch("/api/admin/pages/reorder", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ pageOrders }),
            })

            if (response.ok) {
                await fetchPages()
                toast.success("Sayfa sıralaması güncellendi")
            } else {
                toast.error("Sayfa sıralama güncellenirken hata oluştu")
            }
        } catch {
            toast.error("Sayfa sıralama güncellenirken hata oluştu")
        }
    }

    // Hiyerarşik sayfa listesi oluştur
    const buildHierarchicalList = (pages: GlobalPage[]): GlobalPage[] => {
        const result: GlobalPage[] = []
        const rootPages = pages.filter(page => !page.parentId)

        const addPageWithChildren = (page: GlobalPage, level: number = 0) => {
            const pageWithLevel = { ...page, level }
            result.push(pageWithLevel)

            if (expandedPages.has(page.id) && page.children && page.children.length > 0) {
                const childPages = pages.filter(p => p.parentId === page.id)
                    .sort((a, b) => a.order - b.order)

                childPages.forEach(child => {
                    addPageWithChildren(child, level + 1)
                })
            }
        }

        rootPages
            .sort((a, b) => a.order - b.order)
            .forEach(page => addPageWithChildren(page))

        return result
    }

    const filteredPages = pages.filter(page => {
        const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            page.slug.toLowerCase().includes(searchTerm.toLowerCase())

        return matchesSearch
    })

    const hierarchicalPages = searchTerm ? filteredPages : buildHierarchicalList(filteredPages)

    const togglePageStatus = async (pageId: string, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/admin/pages/${pageId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ isActive: !currentStatus }),
            })

            if (response.ok) {
                await fetchPages()
                toast.success(`Sayfa ${!currentStatus ? 'aktif' : 'pasif'} edildi`)
            } else {
                toast.error("Sayfa durumu güncellenirken hata oluştu")
            }
        } catch {
            toast.error("Sayfa durumu güncellenirken hata oluştu")
        }
    }

    const deletePage = async (pageId: string) => {
        const page = pages.find(p => p.id === pageId)
        const hasChildren = page?.children && page.children.length > 0

        if (hasChildren) {
            toast.error("Alt sayfaları olan sayfa silinemez. Önce alt sayfaları silin.")
            return
        }

        if (!confirm("Bu sayfayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
            return
        }

        try {
            const response = await fetch(`/api/admin/pages/${pageId}`, {
                method: "DELETE",
            })

            if (response.ok) {
                await fetchPages()
                toast.success("Sayfa silindi")
            } else {
                toast.error("Sayfa silinirken hata oluştu")
            }
        } catch {
            toast.error("Sayfa silinirken hata oluştu")
        }
    }

    const renderPageTitle = (page: GlobalPage) => {
        const level = page.level || 0
        const hasChildren = page.children && page.children.length > 0
        const isExpanded = expandedPages.has(page.id)

        return (
            <div className="flex items-center" style={{ paddingLeft: `${level * 20}px` }}>
                {hasChildren && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-6 w-6 mr-2"
                        onClick={() => toggleExpanded(page.id)}
                    >
                        {isExpanded ? (
                            <FolderOpen className="h-4 w-4" />
                        ) : (
                            <Folder className="h-4 w-4" />
                        )}
                    </Button>
                )}
                {!hasChildren && level > 0 && (
                    <div className="w-6 mr-2 flex justify-center">
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    </div>
                )}
                <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-medium">{page.title}</span>
                {page.description && (
                    <span className="text-sm text-muted-foreground ml-2">
                        - {page.description}
                    </span>
                )}
            </div>
        )
    }

    const handleEdit = (pageId: string) => {
        window.location.href = `/admin/pages/${pageId}/edit`
    }

    const handlePageCreated = () => {
        setIsCreateDialogOpen(false)
        fetchPages()
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Sayfalar yükleniyor...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Sayfa Yönetimi</h1>
                    <p className="text-muted-foreground">
                        Global sayfa yapısını yönetin ve içerikleri düzenleyin
                    </p>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Yeni Sayfa
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filtreler</CardTitle>
                    <CardDescription>
                        Sayfaları filtreleyerek istediğiniz içeriği bulun
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    placeholder="Sayfa adı veya slug ara..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Pages Table */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        Sayfalar ({pages.length})
                    </CardTitle>
                    <CardDescription>
                        Tüm sayfalar gösteriliyor. Düzenlemek için bir sayfaya tıklayın.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {hierarchicalPages.length === 0 ? (
                        <div className="text-center py-8">
                            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">Henüz sayfa yok</h3>
                            <p className="text-muted-foreground mb-4">
                                İlk sayfanızı oluşturmak için "Yeni Sayfa" butonuna tıklayın.
                            </p>
                            <Button onClick={() => setIsCreateDialogOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                İlk Sayfayı Oluştur
                            </Button>
                        </div>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={hierarchicalPages.map(p => p.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Sayfa</TableHead>
                                            <TableHead>Slug</TableHead>
                                            <TableHead>Dil</TableHead>
                                            <TableHead>Üst Sayfa</TableHead>
                                            <TableHead>Sıra</TableHead>
                                            <TableHead>Durum</TableHead>
                                            <TableHead>İçerik</TableHead>
                                            <TableHead className="text-right">İşlemler</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {hierarchicalPages.map((page) => (
                                            <SortableTableRow
                                                key={page.id}
                                                page={page}
                                                onToggleStatus={togglePageStatus}
                                                onEdit={handleEdit}
                                                onDelete={deletePage}
                                                renderPageTitle={renderPageTitle}
                                            />
                                        ))}
                                    </TableBody>
                                </Table>
                            </SortableContext>
                        </DndContext>
                    )}
                </CardContent>
            </Card>

            {/* Create Page Dialog */}
            <CreatePageDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onPageCreated={handlePageCreated}
                languages={languages}
                pages={pages}
            />
        </div>
    )
} 