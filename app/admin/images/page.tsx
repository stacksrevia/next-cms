"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Upload, Trash2, Eye, Copy, Search, Image as ImageIcon, Calendar, HardDrive } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

interface ImageFile {
    name: string
    url: string
    size: number
    createdAt: string
    modifiedAt: string
}

export default function ImagesPage() {
    const [images, setImages] = useState<ImageFile[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null)

    useEffect(() => {
        fetchImages()
    }, [])

    const fetchImages = async () => {
        try {
            const response = await fetch("/api/admin/images")
            if (response.ok) {
                const data = await response.json()
                setImages(data.images || [])
            } else {
                toast.error("Görseller yüklenirken hata oluştu")
            }
        } catch (error) {
            console.error("Error fetching images:", error)
            toast.error("Görseller yüklenirken hata oluştu")
        } finally {
            setLoading(false)
        }
    }

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const response = await fetch("/api/upload/image", {
                method: "POST",
                body: formData
            })

            if (response.ok) {
                const data = await response.json()
                toast.success("Görsel başarıyla yüklendi")
                fetchImages() // Listeyi yenile
            } else {
                const error = await response.json()
                toast.error(error.error || "Görsel yüklenirken hata oluştu")
            }
        } catch (error) {
            console.error("Error uploading image:", error)
            toast.error("Görsel yüklenirken hata oluştu")
        } finally {
            setUploading(false)
            // Input'u temizle
            event.target.value = ""
        }
    }

    const handleDelete = async (fileName: string) => {
        try {
            const response = await fetch(`/api/admin/images?file=${encodeURIComponent(fileName)}`, {
                method: "DELETE"
            })

            if (response.ok) {
                toast.success("Görsel başarıyla silindi")
                fetchImages() // Listeyi yenile
            } else {
                const error = await response.json()
                toast.error(error.error || "Görsel silinirken hata oluştu")
            }
        } catch (error) {
            console.error("Error deleting image:", error)
            toast.error("Görsel silinirken hata oluştu")
        }
    }

    const copyToClipboard = (url: string) => {
        navigator.clipboard.writeText(url)
        toast.success("URL kopyalandı")
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const filteredImages = images.filter(image =>
        image.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Görseller</h1>
                    <p className="text-muted-foreground">
                        Yüklenen görselleri yönetin ve düzenleyin
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <Badge variant="secondary">
                        {images.length} görsel
                    </Badge>
                    <div className="relative">
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={handleUpload}
                            disabled={uploading}
                            className="hidden"
                            id="image-upload"
                        />
                        <Button
                            asChild
                            disabled={uploading}
                            className="cursor-pointer"
                        >
                            <label htmlFor="image-upload">
                                <Upload className="h-4 w-4 mr-2" />
                                {uploading ? "Yükleniyor..." : "Görsel Yükle"}
                            </label>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Görsel ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {filteredImages.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                            {searchTerm ? "Görsel bulunamadı" : "Henüz görsel yok"}
                        </h3>
                        <p className="text-muted-foreground text-center mb-4">
                            {searchTerm
                                ? "Arama kriterlerinize uygun görsel bulunamadı"
                                : "İlk görselinizi yükleyerek başlayın"
                            }
                        </p>
                        {!searchTerm && (
                            <div className="relative">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleUpload}
                                    disabled={uploading}
                                    className="hidden"
                                    id="empty-upload"
                                />
                                <Button asChild disabled={uploading}>
                                    <label htmlFor="empty-upload" className="cursor-pointer">
                                        <Upload className="h-4 w-4 mr-2" />
                                        Görsel Yükle
                                    </label>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredImages.map((image) => (
                        <Card key={image.name} className="overflow-hidden">
                            <div className="aspect-square relative bg-muted">
                                <Image
                                    src={image.url}
                                    alt={image.name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                            </div>
                            <CardContent className="p-4">
                                <div className="space-y-2">
                                    <h3 className="font-medium truncate" title={image.name}>
                                        {image.name}
                                    </h3>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <HardDrive className="h-3 w-3 mr-1" />
                                        {formatFileSize(image.size)}
                                    </div>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        {formatDate(image.createdAt)}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 mt-4">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="flex-1">
                                                <Eye className="h-3 w-3 mr-1" />
                                                Görüntüle
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-4xl">
                                            <DialogHeader>
                                                <DialogTitle>{image.name}</DialogTitle>
                                                <DialogDescription>
                                                    {formatFileSize(image.size)} • {formatDate(image.createdAt)}
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                                                <Image
                                                    src={image.url}
                                                    alt={image.name}
                                                    fill
                                                    className="object-contain"
                                                    sizes="(max-width: 768px) 100vw, 80vw"
                                                />
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => copyToClipboard(image.url)}
                                                    className="flex-1"
                                                >
                                                    <Copy className="h-4 w-4 mr-2" />
                                                    URL Kopyala
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Görseli Sil</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Bu görseli silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>İptal</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDelete(image.name)}
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                    Sil
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
} 