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

interface Page {
    id: string
    title: string
    description?: string
    slug: string
    seoTitle?: string
    seoDescription?: string
    parentId?: string | null
    order: number
    isActive: boolean
    createdAt: string
    updatedAt: string
    parent?: {
        id: string
        title: string
        slug: string
    }
    children?: {
        id: string
        title: string
        slug: string
        order: number
    }[]
    modules: any[]
    level?: number
}

// Sortable Row Component
function SortableTableRow({ page, onToggleStatus, onEdit, onDelete, onToggleExpanded, expandedPages, renderPageTitle }: {
    page: Page;
    onToggleStatus: (id: string, status: boolean) => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onToggleExpanded: (id: string) => void;
    expandedPages: Set<string>;
    renderPageTitle: (page: Page) => React.ReactNode;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: page.id })

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
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing p-2 mr-3 hover:bg-muted rounded-md transition-colors"
                        title="Sürükleyerek sıralayın"
                    >
                        <GripVertical className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </div>
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
                <Badge variant="outline">
                    {page.modules.length} modül
                </Badge>
            </TableCell>
            <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onToggleStatus(page.id, page.isActive)}
                    >
                        {page.isActive ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(page.id)}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(page.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    )
}

export default function PagesManagement() {
    const [pages, setPages] = useState<Page[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set())

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

    const fetchPages = async () => {
        try {
            const response = await fetch("/api/pages")
            if (response.ok) {
                const data = await response.json()
                setPages(data.pages || [])
            } else {
                toast.error("Sayfalar yüklenirken hata oluştu")
            }
        } catch (error) {
            toast.error("Sayfalar yüklenirken hata oluştu")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPages()
    }, [])

    const toggleExpanded = (pageId: string) => {
        const newExpanded = new Set(expandedPages)
        if (newExpanded.has(pageId)) {
            newExpanded.delete(pageId)
        } else {
            newExpanded.add(pageId)
        }
        setExpandedPages(newExpanded)
    }

    // Otomatik sıralama fonksiyonu
    const autoReorderPages = async () => {
        try {
            const rootPages = pages.filter(page => !page.parentId)
            const pageOrders: { id: string; order: number; parentId?: string | null }[] = []

            // Ana sayfaları alfabetik sırala
            rootPages.sort((a, b) => a.title.localeCompare(b.title, 'tr'))
            rootPages.forEach((page, index) => {
                pageOrders.push({
                    id: page.id,
                    order: index, // 0'dan başla
                    parentId: page.parentId
                })

                // Alt sayfaları da alfabetik sırala
                const childPages = pages.filter(p => p.parentId === page.id)
                childPages.sort((a, b) => a.title.localeCompare(b.title, 'tr'))
                childPages.forEach((child, childIndex) => {
                    pageOrders.push({
                        id: child.id,
                        order: childIndex, // 0'dan başla
                        parentId: child.parentId
                    })
                })
            })

            const response = await fetch("/api/pages/reorder", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ pageOrders }),
            })

            if (response.ok) {
                await fetchPages()
                toast.success("Sayfalar otomatik olarak sıralandı")
            } else {
                toast.error("Sayfa sıralama güncellenirken hata oluştu")
            }
        } catch (error) {
            toast.error("Sayfa sıralama güncellenirken hata oluştu")
        }
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
            const response = await fetch("/api/pages/reorder", {
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
        } catch (error) {
            toast.error("Sayfa sıralama güncellenirken hata oluştu")
        }
    }

    // Hiyerarşik sayfa listesi oluştur
    const buildHierarchicalList = (pages: Page[]): Page[] => {
        const result: Page[] = []
        const rootPages = pages.filter(page => !page.parentId)

        const addPageWithChildren = (page: Page, level: number = 0) => {
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

    const filteredPages = pages.filter(page =>
        page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.slug.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const hierarchicalPages = searchTerm ? filteredPages : buildHierarchicalList(pages)

    const togglePageStatus = async (pageId: string, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/pages/${pageId}`, {
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
        } catch (error) {
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

        if (!confirm("Bu sayfayı silmek istediğinizden emin misiniz?")) {
            return
        }

        try {
            const response = await fetch(`/api/pages/${pageId}`, {
                method: "DELETE",
            })

            if (response.ok) {
                await fetchPages()
                toast.success("Sayfa silindi")
            } else {
                toast.error("Sayfa silinirken hata oluştu")
            }
        } catch (error) {
            toast.error("Sayfa silinirken hata oluştu")
        }
    }

    const renderPageTitle = (page: any) => {
        const level = page.level || 0
        const hasChildren = page.children && page.children.length > 0
        const isExpanded = expandedPages.has(page.id)

        return (
            <div className="flex items-center" style={{ paddingLeft: `${level * 20}px` }}>
                {hasChildren && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 mr-2"
                        onClick={() => toggleExpanded(page.id)}
                    >
                        {isExpanded ? (
                            <FolderOpen className="h-4 w-4" />
                        ) : (
                            <Folder className="h-4 w-4" />
                        )}
                    </Button>
                )}
                {level > 0 && !hasChildren && (
                    <ArrowRight className="h-4 w-4 mr-2 text-muted-foreground" />
                )}
                <span className={level > 0 ? "text-muted-foreground" : "font-medium"}>
                    {page.title}
                </span>
                {hasChildren && (
                    <Badge variant="outline" className="ml-2 text-xs">
                        {page.children.length} alt sayfa
                    </Badge>
                )}
            </div>
        )
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

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Sayfa Yönetimi</h2>
                    <p className="text-muted-foreground">
                        Web sitesi sayfalarını oluşturun ve yönetin - Sürükleyerek sıralayın (0'dan başlar)
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        onClick={autoReorderPages}
                        disabled={pages.length === 0}
                    >
                        Otomatik Sırala (A-Z)
                    </Button>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Yeni Sayfa
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Toplam Sayfa
                        </CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pages.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Ana Sayfalar
                        </CardTitle>
                        <Folder className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {pages.filter(p => !p.parentId).length}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Alt Sayfalar
                        </CardTitle>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {pages.filter(p => p.parentId).length}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Aktif Sayfalar
                        </CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {pages.filter(p => p.isActive).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                        Sayfalar
                    </CardTitle>
                    <CardDescription>
                        Tüm sayfalarınızı hiyerarşik olarak görüntüleyin ve yönetin
                        <span className="block mt-1 text-blue-600 font-medium">
                            💡 İpucu: Sayfaları sürükleyerek sıralayabilirsiniz
                        </span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Sayfa ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                        {!searchTerm && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    const allPageIds = new Set(pages.filter(p => p.children && p.children.length > 0).map(p => p.id))
                                    setExpandedPages(expandedPages.size === allPageIds.size ? new Set() : allPageIds)
                                }}
                            >
                                {expandedPages.size > 0 ? "Tümünü Kapat" : "Tümünü Aç"}
                            </Button>
                        )}
                    </div>

                    <div className="rounded-md border">
                        {!searchTerm ? (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Başlık</TableHead>
                                            <TableHead>Slug</TableHead>
                                            <TableHead>Üst Sayfa</TableHead>
                                            <TableHead>Sıra</TableHead>
                                            <TableHead>Durum</TableHead>
                                            <TableHead>Modüller</TableHead>
                                            <TableHead className="text-right">İşlemler</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <SortableContext
                                            items={hierarchicalPages.map(p => p.id)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            {hierarchicalPages.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center py-8">
                                                        <div className="text-muted-foreground">
                                                            Henüz sayfa oluşturulmamış
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                hierarchicalPages.map((page) => (
                                                    <SortableTableRow
                                                        key={page.id}
                                                        page={page}
                                                        onToggleStatus={togglePageStatus}
                                                        onEdit={(id) => window.location.href = `/admin/pages/${id}/edit`}
                                                        onDelete={deletePage}
                                                        onToggleExpanded={toggleExpanded}
                                                        expandedPages={expandedPages}
                                                        renderPageTitle={renderPageTitle}
                                                    />
                                                ))
                                            )}
                                        </SortableContext>
                                    </TableBody>
                                </Table>
                            </DndContext>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Başlık</TableHead>
                                        <TableHead>Slug</TableHead>
                                        <TableHead>Üst Sayfa</TableHead>
                                        <TableHead>Sıra</TableHead>
                                        <TableHead>Durum</TableHead>
                                        <TableHead>Modüller</TableHead>
                                        <TableHead className="text-right">İşlemler</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPages.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8">
                                                <div className="text-muted-foreground">
                                                    Arama kriterine uygun sayfa bulunamadı
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredPages.map((page) => (
                                            <TableRow key={page.id}>
                                                <TableCell>
                                                    {renderPageTitle(page)}
                                                </TableCell>
                                                <TableCell>
                                                    <code className="text-sm bg-muted px-1 py-0.5 rounded">
                                                        /{page.slug}
                                                    </code>
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
                                                    <Badge variant="outline">
                                                        {page.modules.length} modül
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => togglePageStatus(page.id, page.isActive)}
                                                        >
                                                            {page.isActive ? (
                                                                <EyeOff className="h-4 w-4" />
                                                            ) : (
                                                                <Eye className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                window.location.href = `/admin/pages/${page.id}/edit`
                                                            }}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => deletePage(page.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Create Page Dialog */}
            <CreatePageDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onPageCreated={fetchPages}
            />
        </div>
    )
} 