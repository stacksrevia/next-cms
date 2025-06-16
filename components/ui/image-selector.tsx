"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Search, Image as ImageIcon, Check, X } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

interface ImageFile {
    name: string
    url: string
    size: number
    createdAt: string
    modifiedAt: string
}

interface ImageSelectorProps {
    value?: string
    onSelect: (url: string) => void
    trigger?: React.ReactNode
    title?: string
    description?: string
}

export function ImageSelector({
    value,
    onSelect,
    trigger,
    title = "Görsel Seç",
    description = "Mevcut görsellerden birini seçin veya yeni bir görsel yükleyin"
}: ImageSelectorProps) {
    const [open, setOpen] = useState(false)
    const [images, setImages] = useState<ImageFile[]>([])
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedUrl, setSelectedUrl] = useState(value || "")

    useEffect(() => {
        if (open) {
            fetchImages()
        }
    }, [open])

    useEffect(() => {
        setSelectedUrl(value || "")
    }, [value])

    const fetchImages = async () => {
        setLoading(true)
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
                setSelectedUrl(data.url)
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

    const handleSelect = () => {
        onSelect(selectedUrl)
        setOpen(false)
    }

    const handleClear = () => {
        setSelectedUrl("")
        onSelect("")
        setOpen(false)
    }

    const filteredImages = images.filter(image =>
        image.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const defaultTrigger = (
        <Button variant="outline" className="w-full">
            <ImageIcon className="h-4 w-4 mr-2" />
            {value ? "Görseli Değiştir" : "Görsel Seç"}
        </Button>
    )

    if (!open) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    {trigger || defaultTrigger}
                </DialogTrigger>
            </Dialog>
        )
    }

    const modalContent = (
        <div className="fixed inset-0 z-[1000001] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setOpen(false)}
            />

            {/* Modal */}
            <div className="relative bg-background border rounded-lg shadow-2xl w-[90vw] h-[80vh] flex flex-col max-w-4xl z-[1000002]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b shrink-0">
                    <div>
                        <h2 className="text-lg font-semibold">{title}</h2>
                        <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpen(false)}
                        className="h-8 w-8 p-0"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col p-4 overflow-hidden">
                    <Tabs defaultValue="gallery" className="flex-1 flex flex-col">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="gallery">Galeri</TabsTrigger>
                            <TabsTrigger value="upload">Yükle</TabsTrigger>
                        </TabsList>

                        <TabsContent value="gallery" className="flex-1 flex flex-col space-y-4">
                            <div className="flex items-center space-x-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Görsel ara..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Badge variant="secondary">
                                    {filteredImages.length} görsel
                                </Badge>
                            </div>

                            <div className="flex-1 overflow-auto">
                                {loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    </div>
                                ) : filteredImages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground">
                                            {searchTerm ? "Görsel bulunamadı" : "Henüz görsel yok"}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {filteredImages.map((image) => (
                                            <div
                                                key={image.name}
                                                className={`relative aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer border-2 transition-colors ${selectedUrl === image.url
                                                        ? "border-primary"
                                                        : "border-transparent hover:border-muted-foreground"
                                                    }`}
                                                onClick={() => setSelectedUrl(image.url)}
                                            >
                                                <Image
                                                    src={image.url}
                                                    alt={image.name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                                />
                                                {selectedUrl === image.url && (
                                                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                                        <div className="bg-primary text-primary-foreground rounded-full p-1">
                                                            <Check className="h-4 w-4" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="upload" className="flex-1 flex flex-col">
                            <div className="flex-1 flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
                                <ImageIcon className="h-12 w-12 text-muted-foreground" />
                                <div className="text-center">
                                    <h3 className="text-lg font-semibold mb-2">Görsel Yükle</h3>
                                    <p className="text-muted-foreground mb-4">
                                        JPG, PNG, GIF veya WebP formatında görsel yükleyebilirsiniz
                                    </p>
                                </div>
                                <div className="relative">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleUpload}
                                        disabled={uploading}
                                        className="hidden"
                                        id="image-upload-selector"
                                    />
                                    <Button
                                        asChild
                                        disabled={uploading}
                                        size="lg"
                                    >
                                        <label htmlFor="image-upload-selector" className="cursor-pointer">
                                            <Upload className="h-4 w-4 mr-2" />
                                            {uploading ? "Yükleniyor..." : "Dosya Seç"}
                                        </label>
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-4 border-t">
                    <div className="flex items-center space-x-2">
                        {selectedUrl && (
                            <Button variant="outline" onClick={handleClear}>
                                <X className="h-4 w-4 mr-2" />
                                Temizle
                            </Button>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            İptal
                        </Button>
                        <Button onClick={handleSelect} disabled={!selectedUrl}>
                            <Check className="h-4 w-4 mr-2" />
                            Seç
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <>
            <Dialog open={false}>
                <DialogTrigger asChild>
                    {trigger || defaultTrigger}
                </DialogTrigger>
            </Dialog>
            {typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null}
        </>
    )
} 