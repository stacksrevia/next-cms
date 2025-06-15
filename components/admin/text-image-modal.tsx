"use client"

import { useState, useEffect } from "react"
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import UnderlineExtension from '@tiptap/extension-underline'
import { CustomModal } from "@/components/admin/custom-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import {
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Link as LinkIcon,
    Image as ImageIcon,
    Code,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    Type,
    Upload,
    X,
    Plus
} from "lucide-react"

interface ImageItem {
    url: string
    alt: string
}

interface TextImageModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (content: any) => void
    initialContent?: any
}

export function TextImageModal({ isOpen, onClose, onSave, initialContent }: TextImageModalProps) {
    const [title, setTitle] = useState("")
    const [titleType, setTitleType] = useState("h1")
    const [content, setContent] = useState("")
    const [contentLength, setContentLength] = useState([6])
    const [isFullScreen, setIsFullScreen] = useState(false)
    const [hasMultipleImages, setHasMultipleImages] = useState(false)
    const [textPosition, setTextPosition] = useState("left")
    const [isActive, setIsActive] = useState(true)
    const [centerContent, setCenterContent] = useState(false)
    const [margin, setMargin] = useState("")
    const [padding, setPadding] = useState("")
    const [backgroundColor, setBackgroundColor] = useState("")
    const [mainImage, setMainImage] = useState("")
    const [multipleImages, setMultipleImages] = useState<ImageItem[]>([])
    const [showSourceEditor, setShowSourceEditor] = useState(false)
    const [textAnimation, setTextAnimation] = useState("fade-left")
    const [imageAnimation, setImageAnimation] = useState("fade-right")

    // initialContent değiştiğinde state'leri güncelle
    useEffect(() => {
        if (initialContent) {
            setTitle(initialContent.title || "")
            setTitleType(initialContent.titleType || "h1")
            setContent(initialContent.text || "")
            setContentLength([initialContent.contentLength || 6])
            setIsFullScreen(initialContent.isFullScreen || false)
            setHasMultipleImages(initialContent.hasMultipleImages || false)
            setTextPosition(initialContent.textPosition || "left")
            setIsActive(initialContent.isActive !== false)
            setCenterContent(initialContent.centerContent || false)
            setMargin(initialContent.margin || "")
            setPadding(initialContent.padding || "")
            setBackgroundColor(initialContent.backgroundColor || "")
            setMainImage(initialContent.image || "")
            setMultipleImages(initialContent.multipleImages || [])
            setTextAnimation(initialContent.textAnimation || "fade-left")
            setImageAnimation(initialContent.imageAnimation || "fade-right")
        }
    }, [initialContent])

    const editor = useEditor({
        extensions: [
            StarterKit,
            TextStyle,
            Color,
            UnderlineExtension,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Link.configure({
                openOnClick: false,
            }),
            Image,
        ],
        content: content,
        onUpdate: ({ editor }) => {
            setContent(editor.getHTML())
        },
    })

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content)
        }
    }, [content, editor])

    const handleSave = () => {
        const moduleContent = {
            title,
            titleType,
            text: content,
            contentLength: contentLength[0],
            isFullScreen,
            hasMultipleImages,
            textPosition,
            isActive,
            centerContent,
            margin,
            padding,
            backgroundColor,
            image: mainImage,
            multipleImages,
            imagePosition: textPosition === "left" ? "right" : "left",
            textAnimation,
            imageAnimation
        }
        onSave(moduleContent)
        onClose()
    }

    const addImageToEditor = () => {
        const url = prompt('Resim URL\'sini girin:')
        if (url && editor) {
            editor.chain().focus().setImage({ src: url }).run()
        }
    }

    const addLinkToEditor = () => {
        const url = prompt('Link URL\'sini girin:')
        if (url && editor) {
            editor.chain().focus().setLink({ href: url }).run()
        }
    }

    const addMultipleImage = () => {
        const url = prompt('Resim URL\'sini girin:')
        if (url) {
            setMultipleImages([...multipleImages, { url, alt: '' }])
        }
    }

    const removeMultipleImage = (index: number) => {
        setMultipleImages(multipleImages.filter((_: any, i: number) => i !== index))
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch('/api/upload/image', {
                method: 'POST',
                body: formData,
            })

            const result = await response.json()

            if (result.success) {
                setMainImage(result.url)
            } else {
                alert(result.error || 'Resim yüklenirken hata oluştu')
            }
        } catch (error) {
            console.error('Upload error:', error)
            alert('Resim yüklenirken hata oluştu')
        }
    }

    if (!editor) return null

    return (
        <CustomModal
            isOpen={isOpen}
            onClose={onClose}
            title="Text + Image Modülü Düzenle"
        >

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full min-h-0">
                {/* Sol Panel - İçerik */}
                <div className="lg:col-span-3 space-y-3 overflow-y-auto">
                    {/* Başlık */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Başlık</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-0">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <div className="md:col-span-3">
                                    <Label htmlFor="title" className="text-sm">Başlık</Label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Özel teklifler kaçırmayın"
                                        className="h-8"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="titleType" className="text-sm">Başlık Tipi</Label>
                                    <Select value={titleType} onValueChange={setTitleType}>
                                        <SelectTrigger className="h-8">
                                            <SelectValue>
                                                {titleType ? titleType.toUpperCase() : "Başlık tipi seçin"}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent className="z-[999999]">
                                            <SelectItem value="h1">H1</SelectItem>
                                            <SelectItem value="h2">H2</SelectItem>
                                            <SelectItem value="h3">H3</SelectItem>
                                            <SelectItem value="h4">H4</SelectItem>
                                            <SelectItem value="h5">H5</SelectItem>
                                            <SelectItem value="h6">H6</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* İçerik Editörü */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center justify-between">
                                İçerik
                                <button
                                    type="button"
                                    onClick={() => setShowSourceEditor(!showSourceEditor)}
                                    className="text-xs px-2 py-1 border rounded hover:bg-muted"
                                >
                                    {showSourceEditor ? 'Visual' : 'Source'}
                                </button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            {!showSourceEditor ? (
                                <div className="space-y-2">
                                    {/* Toolbar */}
                                    <div className="flex flex-wrap gap-1 p-2 border rounded bg-muted/30">
                                        <button
                                            type="button"
                                            onClick={() => editor.chain().focus().toggleBold().run()}
                                            className={`px-2 py-1 text-xs rounded ${editor.isActive('bold') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                                        >
                                            <Bold className="h-3 w-3" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => editor.chain().focus().toggleItalic().run()}
                                            className={`px-2 py-1 text-xs rounded ${editor.isActive('italic') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                                        >
                                            <Italic className="h-3 w-3" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                                            className={`px-2 py-1 text-xs rounded ${editor.isActive('underline') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                                        >
                                            <Underline className="h-3 w-3" />
                                        </button>
                                        <div className="w-px h-6 bg-border mx-1" />
                                        <button
                                            type="button"
                                            onClick={() => editor.chain().focus().setTextAlign('left').run()}
                                            className={`px-2 py-1 text-xs rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                                        >
                                            <AlignLeft className="h-3 w-3" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => editor.chain().focus().setTextAlign('center').run()}
                                            className={`px-2 py-1 text-xs rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                                        >
                                            <AlignCenter className="h-3 w-3" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => editor.chain().focus().setTextAlign('right').run()}
                                            className={`px-2 py-1 text-xs rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                                        >
                                            <AlignRight className="h-3 w-3" />
                                        </button>
                                        <div className="w-px h-6 bg-border mx-1" />
                                        <button
                                            type="button"
                                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                                            className={`px-2 py-1 text-xs rounded ${editor.isActive('bulletList') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                                        >
                                            <List className="h-3 w-3" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                                            className={`px-2 py-1 text-xs rounded ${editor.isActive('orderedList') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                                        >
                                            <ListOrdered className="h-3 w-3" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => editor.chain().focus().toggleBlockquote().run()}
                                            className={`px-2 py-1 text-xs rounded ${editor.isActive('blockquote') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                                        >
                                            <Quote className="h-3 w-3" />
                                        </button>
                                        <div className="w-px h-6 bg-border mx-1" />
                                        <button
                                            type="button"
                                            onClick={addLinkToEditor}
                                            className="px-2 py-1 text-xs rounded hover:bg-muted"
                                        >
                                            <LinkIcon className="h-3 w-3" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={addImageToEditor}
                                            className="px-2 py-1 text-xs rounded hover:bg-muted"
                                        >
                                            <ImageIcon className="h-3 w-3" />
                                        </button>
                                        <div className="w-px h-6 bg-border mx-1" />
                                        <button
                                            type="button"
                                            onClick={() => editor.chain().focus().undo().run()}
                                            className="px-2 py-1 text-xs rounded hover:bg-muted"
                                        >
                                            <Undo className="h-3 w-3" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => editor.chain().focus().redo().run()}
                                            className="px-2 py-1 text-xs rounded hover:bg-muted"
                                        >
                                            <Redo className="h-3 w-3" />
                                        </button>
                                    </div>

                                    {/* Editor */}
                                    <div className="border rounded min-h-[250px] p-3">
                                        <EditorContent editor={editor} />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <Label htmlFor="sourceContent" className="text-sm">HTML Source</Label>
                                    <Textarea
                                        id="sourceContent"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        rows={12}
                                        className="font-mono text-xs mt-1"
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sağ Panel - Ayarlar */}
                <div className="space-y-2 overflow-y-auto">
                    {/* Genel Ayarlar */}
                    <Card>
                        <CardHeader className="pb-1">
                            <CardTitle className="text-xs">Genel Ayarlar</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 pt-0">
                            <div>
                                <Label className="text-xs">İçerik Alanı: {contentLength[0]}</Label>
                                <Slider
                                    value={contentLength}
                                    onValueChange={setContentLength}
                                    max={12}
                                    min={1}
                                    step={1}
                                    className="mt-1 h-4"
                                />
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="fullScreen" className="text-xs">Tam Ekran</Label>
                                    <Switch
                                        id="fullScreen"
                                        checked={isFullScreen}
                                        onCheckedChange={setIsFullScreen}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="multipleImages" className="text-xs">Çoklu Görsel</Label>
                                    <Switch
                                        id="multipleImages"
                                        checked={hasMultipleImages}
                                        onCheckedChange={setHasMultipleImages}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="centerContent" className="text-xs">İçerik Ortala</Label>
                                    <Switch
                                        id="centerContent"
                                        checked={centerContent}
                                        onCheckedChange={setCenterContent}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="isActive" className="text-xs">Durumu</Label>
                                    <Switch
                                        id="isActive"
                                        checked={isActive}
                                        onCheckedChange={setIsActive}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label className="text-xs">Yazı İçerik Konumu</Label>
                                <div className="flex gap-1 mt-1">
                                    <button
                                        type="button"
                                        onClick={() => setTextPosition("left")}
                                        className={`flex-1 h-7 px-2 border rounded flex items-center justify-center ${textPosition === "left" ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                                    >
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 bg-current rounded"></div>
                                            <ImageIcon className="h-3 w-3" />
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTextPosition("right")}
                                        className={`flex-1 h-7 px-2 border rounded flex items-center justify-center ${textPosition === "right" ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                                    >
                                        <div className="flex items-center gap-1">
                                            <ImageIcon className="h-3 w-3" />
                                            <div className="w-2 h-2 bg-current rounded"></div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stil Ayarları */}
                    <Card>
                        <CardHeader className="pb-1">
                            <CardTitle className="text-xs">Stil Ayarları</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 pt-0">
                            <div>
                                <Label htmlFor="margin" className="text-xs">Margin</Label>
                                <Input
                                    id="margin"
                                    value={margin}
                                    onChange={(e) => setMargin(e.target.value)}
                                    placeholder="20px 0"
                                    className="h-7 mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="padding" className="text-xs">Padding</Label>
                                <Input
                                    id="padding"
                                    value={padding}
                                    onChange={(e) => setPadding(e.target.value)}
                                    placeholder="40px 20px"
                                    className="h-7 mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="backgroundColor" className="text-xs">Arkaplan</Label>
                                <div className="flex gap-1 mt-1">
                                    <Input
                                        id="backgroundColor"
                                        value={backgroundColor}
                                        onChange={(e) => setBackgroundColor(e.target.value)}
                                        placeholder="#ffffff"
                                        className="h-7"
                                    />
                                    <input
                                        type="color"
                                        value={backgroundColor || "#ffffff"}
                                        onChange={(e) => setBackgroundColor(e.target.value)}
                                        className="w-7 h-7 border rounded"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Animasyon Ayarları */}
                    <Card>
                        <CardHeader className="pb-1">
                            <CardTitle className="text-xs">Animasyon Ayarları</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 pt-0">
                            <div>
                                <Label className="text-xs">Metin Animasyonu</Label>
                                <Select value={textAnimation} onValueChange={setTextAnimation}>
                                    <SelectTrigger className="h-7 mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="z-[999999]">
                                        <SelectItem value="fade-left">Soldan Gel</SelectItem>
                                        <SelectItem value="fade-right">Sağdan Gel</SelectItem>
                                        <SelectItem value="fade-up">Aşağıdan Gel</SelectItem>
                                        <SelectItem value="fade-down">Yukarıdan Gel</SelectItem>
                                        <SelectItem value="zoom-in">Yakınlaş</SelectItem>
                                        <SelectItem value="zoom-out">Uzaklaş</SelectItem>
                                        <SelectItem value="flip-left">Sol Çevir</SelectItem>
                                        <SelectItem value="flip-right">Sağ Çevir</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label className="text-xs">Görsel Animasyonu</Label>
                                <Select value={imageAnimation} onValueChange={setImageAnimation}>
                                    <SelectTrigger className="h-7 mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="z-[999999]">
                                        <SelectItem value="fade-left">Soldan Gel</SelectItem>
                                        <SelectItem value="fade-right">Sağdan Gel</SelectItem>
                                        <SelectItem value="fade-up">Aşağıdan Gel</SelectItem>
                                        <SelectItem value="fade-down">Yukarıdan Gel</SelectItem>
                                        <SelectItem value="zoom-in">Yakınlaş</SelectItem>
                                        <SelectItem value="zoom-out">Uzaklaş</SelectItem>
                                        <SelectItem value="flip-left">Sol Çevir</SelectItem>
                                        <SelectItem value="flip-right">Sağ Çevir</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Görsel Ayarları */}
                    <Card>
                        <CardHeader className="pb-1">
                            <CardTitle className="text-xs">Görsel & Video</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 pt-0">
                            {!hasMultipleImages ? (
                                <div>
                                    <Label htmlFor="mainImage" className="text-xs">Ana Görsel</Label>
                                    <div className="space-y-1 mt-1">
                                        <Input
                                            id="mainImage"
                                            value={mainImage}
                                            onChange={(e) => setMainImage(e.target.value)}
                                            placeholder="https://example.com/image.jpg"
                                            className="h-7"
                                        />
                                        <div className="flex gap-1">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                                id="imageUpload"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => document.getElementById('imageUpload')?.click()}
                                                className="h-6 px-2 text-xs"
                                            >
                                                <Upload className="h-3 w-3 mr-1" />
                                                Yükle
                                            </Button>
                                        </div>
                                    </div>
                                    {mainImage && (
                                        <div className="mt-1">
                                            <img
                                                src={mainImage}
                                                alt="Preview"
                                                className="w-full h-16 object-cover rounded border"
                                            />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <Label className="text-xs">Çoklu Görsel</Label>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={addMultipleImage}
                                            className="h-6 px-2"
                                        >
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    <div className="space-y-1 max-h-32 overflow-y-auto">
                                        {multipleImages.map((img: any, index: number) => (
                                            <div key={index} className="flex items-center gap-1 p-1 border rounded">
                                                <img
                                                    src={img.url}
                                                    alt={`Image ${index + 1}`}
                                                    className="w-8 h-8 object-cover rounded"
                                                />
                                                <span className="flex-1 text-xs truncate">{img.url}</span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeMultipleImage(index)}
                                                    className="h-6 w-6 p-0"
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 pt-3 border-t mt-auto">
                    <Button variant="outline" size="sm" onClick={onClose}>
                        İptal
                    </Button>
                    <Button size="sm" onClick={handleSave}>
                        Güncelle
                    </Button>
                </div>
            </div>
        </CustomModal>
    )
}
