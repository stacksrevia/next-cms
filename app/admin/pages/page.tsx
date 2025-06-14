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
    Calendar
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
    modules: any[]
}

export default function PagesManagement() {
    const [pages, setPages] = useState<Page[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

    const fetchPages = async () => {
        try {
            const response = await fetch("/api/pages")
            if (response.ok) {
                const data = await response.json()
                setPages(data)
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

    const filteredPages = pages.filter(page =>
        page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.slug.toLowerCase().includes(searchTerm.toLowerCase())
    )

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
                        Web sitesi sayfalarını oluşturun ve yönetin
                    </p>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Yeni Sayfa
                </Button>
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

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Pasif Sayfalar
                        </CardTitle>
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {pages.filter(p => !p.isActive).length}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Bu Ay Oluşturulan
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {pages.filter(p => {
                                const pageDate = new Date(p.createdAt)
                                const now = new Date()
                                return pageDate.getMonth() === now.getMonth() &&
                                    pageDate.getFullYear() === now.getFullYear()
                            }).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Sayfalar</CardTitle>
                    <CardDescription>
                        Tüm sayfalarınızı görüntüleyin ve yönetin
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
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Başlık</TableHead>
                                    <TableHead>Slug</TableHead>
                                    <TableHead>Durum</TableHead>
                                    <TableHead>Modüller</TableHead>
                                    <TableHead>Oluşturulma</TableHead>
                                    <TableHead className="text-right">İşlemler</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPages.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            <div className="text-muted-foreground">
                                                {searchTerm ? "Arama kriterine uygun sayfa bulunamadı" : "Henüz sayfa oluşturulmamış"}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPages.map((page) => (
                                        <TableRow key={page.id}>
                                            <TableCell className="font-medium">
                                                {page.title}
                                            </TableCell>
                                            <TableCell>
                                                <code className="text-sm bg-muted px-1 py-0.5 rounded">
                                                    /{page.slug}
                                                </code>
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
                                            <TableCell>
                                                {new Date(page.createdAt).toLocaleDateString('tr-TR')}
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