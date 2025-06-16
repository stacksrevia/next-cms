"use client"

import React, { useState, useEffect } from "react"
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
    Plus,
    Trash2,
    Play,
    Pause,
    RotateCcw,
    Navigation,
    Circle,
    Eye,
    EyeOff
} from "lucide-react"

interface SlideItem {
    id: string
    type: "image" | "video"
    imageUrl: string
    videoUrl: string
    title: string
    titleType: string
    content: string
    button1Text: string
    button1Link: string
    button2Text: string
    button2Link: string
    button3Text: string
    button3Link: string
    filigranColor: string
    textColor: string
    opacity: number
    contentPosition: "left" | "center" | "right"
    isActive: boolean
    order: number
}

interface SliderModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (content: any) => void
    initialContent?: any
}

export function SliderModal({ isOpen, onClose, onSave, initialContent }: SliderModalProps) {
    // Slider Ayarları
    const [sliderType, setSliderType] = useState("horizontal")
    const [loop, setLoop] = useState(false)
    const [autoplay, setAutoplay] = useState(false)
    const [navigation, setNavigation] = useState(true)
    const [animatedArrows, setAnimatedArrows] = useState(false)
    const [pagination, setPagination] = useState(true)
    const [slidesPerView, setSlidesPerView] = useState(1)
    const [isActive, setIsActive] = useState(true)
    const [videoDelay, setVideoDelay] = useState(3300)
    const [autoplayDelay, setAutoplayDelay] = useState(2500)
    const [speed, setSpeed] = useState(1000)
    const [titleSize, setTitleSize] = useState("32px")
    const [paragraphSize, setParagraphSize] = useState("14px")
    const [margin, setMargin] = useState("")
    const [height, setHeight] = useState("85vh")
    const [effect, setEffect] = useState("")
    const [uniqueId, setUniqueId] = useState("vira-slider-1")

    // Slides
    const [slides, setSlides] = useState<SlideItem[]>([])
    const [activeSlideIndex, setActiveSlideIndex] = useState(0)

    // Editor for current slide
    const [currentSlideEditor, setCurrentSlideEditor] = useState<any>(null)

    // initialContent değiştiğinde state'leri güncelle
    useEffect(() => {
        if (initialContent) {
            setSliderType(initialContent.sliderType || "horizontal")
            setLoop(initialContent.loop || false)
            setAutoplay(initialContent.autoplay || false)
            setNavigation(initialContent.navigation !== false)
            setAnimatedArrows(initialContent.animatedArrows || false)
            setPagination(initialContent.pagination !== false)
            setSlidesPerView(initialContent.slidesPerView || 1)
            setIsActive(initialContent.isActive !== false)
            setVideoDelay(initialContent.videoDelay || 3300)
            setAutoplayDelay(initialContent.autoplayDelay || 2500)
            setSpeed(initialContent.speed || 1000)
            setTitleSize(initialContent.titleSize || "32px")
            setParagraphSize(initialContent.paragraphSize || "14px")
            setMargin(initialContent.margin || "")
            setHeight(initialContent.height || "85vh")
            setEffect(initialContent.effect || "")
            setUniqueId(initialContent.uniqueId || "vira-slider-1")
            setSlides(initialContent.slides || [])
        } else {
            // İlk slide'ı ekle eğer hiç slide yoksa
            if (slides.length === 0) {
                addSlide()
            }
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
        content: slides[activeSlideIndex]?.content || "",
        onUpdate: ({ editor }) => {
            updateSlideContent(activeSlideIndex, 'content', editor.getHTML())
        },
    })

    useEffect(() => {
        if (editor && slides[activeSlideIndex]) {
            editor.commands.setContent(slides[activeSlideIndex].content || "")
        }
    }, [activeSlideIndex, editor])

    const addSlide = () => {
        const newSlide: SlideItem = {
            id: `slide-${Date.now()}`,
            type: "image",
            imageUrl: "",
            videoUrl: "",
            title: "",
            titleType: "h1",
            content: "",
            button1Text: "",
            button1Link: "",
            button2Text: "",
            button2Link: "",
            button3Text: "",
            button3Link: "",
            filigranColor: "#000000",
            textColor: "#ffffff",
            opacity: 0.5,
            contentPosition: "left",
            isActive: true,
            order: slides.length
        }
        setSlides([...slides, newSlide])
        setActiveSlideIndex(slides.length)
    }

    const removeSlide = (index: number) => {
        if (slides.length <= 1) return
        const newSlides = slides.filter((_, i) => i !== index)
        setSlides(newSlides)
        if (activeSlideIndex >= newSlides.length) {
            setActiveSlideIndex(newSlides.length - 1)
        }
    }

    const updateSlideContent = (index: number, field: string, value: any) => {
        const newSlides = [...slides]
        if (newSlides[index]) {
            newSlides[index] = { ...newSlides[index], [field]: value }
            setSlides(newSlides)
        }
    }

    const handleSave = () => {
        const moduleContent = {
            sliderType,
            loop,
            autoplay,
            navigation,
            animatedArrows,
            pagination,
            slidesPerView,
            isActive,
            videoDelay,
            autoplayDelay,
            speed,
            titleSize,
            paragraphSize,
            margin,
            height,
            effect,
            uniqueId,
            slides
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
                updateSlideContent(activeSlideIndex, 'imageUrl', result.url)
            } else {
                alert(result.error || 'Resim yüklenirken hata oluştu')
            }
        } catch (error) {
            console.error('Upload error:', error)
            alert('Resim yüklenirken hata oluştu')
        }
    }

    const currentSlide = slides[activeSlideIndex]

    if (!editor) return null

    return (
        <CustomModal
            isOpen={isOpen}
            onClose={onClose}
            title="Slider Modülü Düzenle"
        >
            <div className="space-y-6">
                <Tabs defaultValue="slider-settings" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="slider-settings">Slider Ayarları</TabsTrigger>
                        <TabsTrigger value="slides">Sliderlar</TabsTrigger>
                    </TabsList>

                    {/* Slider Ayarları */}
                    <TabsContent value="slider-settings" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Slider Ayarları</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Üst Satır - Temel Ayarlar */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Slider Tipi</Label>
                                        <Select value={sliderType} onValueChange={setSliderType}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="z-[99999]">
                                                <SelectItem value="horizontal">Yatay</SelectItem>
                                                <SelectItem value="vertical">Dikey</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Margin</Label>
                                        <Input
                                            value={margin}
                                            onChange={(e) => setMargin(e.target.value)}
                                            placeholder="0px"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Yükseklik</Label>
                                        <Input
                                            value={height}
                                            onChange={(e) => setHeight(e.target.value)}
                                            placeholder="85vh"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Efekt</Label>
                                        <Select value={effect || "slide"} onValueChange={(value) => setEffect(value === "slide" ? "" : value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Efekt Seçin" />
                                            </SelectTrigger>
                                            <SelectContent className="z-[99999]">
                                                <SelectItem value="slide">Slide (Varsayılan)</SelectItem>
                                                <SelectItem value="fade">Fade</SelectItem>
                                                <SelectItem value="cube">Cube</SelectItem>
                                                <SelectItem value="coverflow">Coverflow</SelectItem>
                                                <SelectItem value="flip">Flip</SelectItem>
                                                <SelectItem value="cards">Cards</SelectItem>
                                                <SelectItem value="creative">Creative</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* İkinci Satır - Switch'ler */}
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Loop (Tekrar)</Label>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="loop"
                                                checked={loop}
                                                onCheckedChange={setLoop}
                                            />
                                            <Label htmlFor="loop" className="text-sm">{loop ? 'Açık' : 'Kapalı'}</Label>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Otomatik Slayt</Label>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="autoplay"
                                                checked={autoplay}
                                                onCheckedChange={setAutoplay}
                                            />
                                            <Label htmlFor="autoplay" className="text-sm">{autoplay ? 'Açık' : 'Kapalı'}</Label>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Navigasyon Okları</Label>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="navigation"
                                                checked={navigation}
                                                onCheckedChange={setNavigation}
                                            />
                                            <Label htmlFor="navigation" className="text-sm">{navigation ? 'Açık' : 'Kapalı'}</Label>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Animasyonlu Ok</Label>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="animated"
                                                checked={animatedArrows}
                                                onCheckedChange={setAnimatedArrows}
                                            />
                                            <Label htmlFor="animated" className="text-sm">{animatedArrows ? 'Açık' : 'Kapalı'}</Label>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Navigasyon Bullets</Label>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="bullets"
                                                checked={pagination}
                                                onCheckedChange={setPagination}
                                            />
                                            <Label htmlFor="bullets" className="text-sm">{pagination ? 'Açık' : 'Kapalı'}</Label>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Slider Görünüş</Label>
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    id="view-1"
                                                    checked={slidesPerView === 1}
                                                    onCheckedChange={(checked) => setSlidesPerView(checked ? 1 : 2)}
                                                />
                                                <Label htmlFor="view-1" className="text-sm">1</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    id="view-2"
                                                    checked={slidesPerView === 2}
                                                    onCheckedChange={(checked) => setSlidesPerView(checked ? 2 : 1)}
                                                />
                                                <Label htmlFor="view-2" className="text-sm">2</Label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Üçüncü Satır - Sayısal Değerler */}
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Slider Durumu</Label>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="status"
                                                checked={isActive}
                                                onCheckedChange={setIsActive}
                                            />
                                            <Label htmlFor="status" className="text-sm">{isActive ? 'Aktif' : 'Pasif'}</Label>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Video Gecikme Süresi</Label>
                                        <Input
                                            type="number"
                                            value={videoDelay}
                                            onChange={(e) => setVideoDelay(Number(e.target.value))}
                                            placeholder="3300"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Otomatik Slayt Zamanı</Label>
                                        <Input
                                            type="number"
                                            value={autoplayDelay}
                                            onChange={(e) => setAutoplayDelay(Number(e.target.value))}
                                            placeholder="2500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Slayt Geçiş Hızı</Label>
                                        <Input
                                            type="number"
                                            value={speed}
                                            onChange={(e) => setSpeed(Number(e.target.value))}
                                            placeholder="1000"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Başlık Boyutu</Label>
                                        <Input
                                            value={titleSize}
                                            onChange={(e) => setTitleSize(e.target.value)}
                                            placeholder="32px"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Paragraf Boyutu</Label>
                                        <Input
                                            value={paragraphSize}
                                            onChange={(e) => setParagraphSize(e.target.value)}
                                            placeholder="14px"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Sliderlar */}
                    <TabsContent value="slides" className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Sliderlar ({slides.length})</h3>
                            <Button onClick={addSlide} className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Yeni Slide Ekle
                            </Button>
                        </div>

                        {slides.length === 0 ? (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <p className="text-muted-foreground">Henüz slide eklenmemiş.</p>
                                    <Button onClick={addSlide} className="mt-4">
                                        İlk Slide'ı Ekle
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Slide Listesi */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Slide Listesi</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {slides.map((slide, index) => (
                                            <div
                                                key={slide.id}
                                                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                                                    activeSlideIndex === index ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                                                }`}
                                                onClick={() => setActiveSlideIndex(index)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-medium">#{index + 1}</span>
                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            {slide.title || `Slide ${index + 1}`}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {slide.type === 'video' ? 'Video' : 'Görsel'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            updateSlideContent(index, 'isActive', !slide.isActive)
                                                        }}
                                                    >
                                                        {slide.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            removeSlide(index)
                                                        }}
                                                        disabled={slides.length <= 1}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                {/* Slide Düzenleme */}
                                {currentSlide && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-sm">
                                                Slide #{activeSlideIndex + 1} Düzenle
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {/* Görsel/Video Seçimi */}
                                            <div className="space-y-2">
                                                <Label>Görsel / Video</Label>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant={currentSlide.type === 'image' ? 'default' : 'outline'}
                                                        size="sm"
                                                        onClick={() => updateSlideContent(activeSlideIndex, 'type', 'image')}
                                                    >
                                                        Dosya Seç
                                                    </Button>
                                                    <Button
                                                        variant={currentSlide.type === 'image' ? 'outline' : 'default'}
                                                        size="sm"
                                                        onClick={() => updateSlideContent(activeSlideIndex, 'type', 'image')}
                                                    >
                                                        Dış
                                                    </Button>
                                                    <Button
                                                        variant={currentSlide.type === 'video' ? 'default' : 'outline'}
                                                        size="sm"
                                                        onClick={() => updateSlideContent(activeSlideIndex, 'type', 'video')}
                                                    >
                                                        Detay
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* URL Girişi */}
                                            <div className="space-y-2">
                                                <Label>
                                                    {currentSlide.type === 'video' ? 'Video URL' : 'Görsel URL'}
                                                </Label>
                                                <div className="space-y-2">
                                                    <Input
                                                        value={currentSlide.type === 'video' ? currentSlide.videoUrl : currentSlide.imageUrl}
                                                        onChange={(e) => updateSlideContent(
                                                            activeSlideIndex, 
                                                            currentSlide.type === 'video' ? 'videoUrl' : 'imageUrl', 
                                                            e.target.value
                                                        )}
                                                        placeholder={currentSlide.type === 'video' ? 'Video URL girin' : 'Görsel URL girin'}
                                                    />
                                                    {currentSlide.type === 'image' && (
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={handleImageUpload}
                                                                className="hidden"
                                                                id={`imageUpload-${activeSlideIndex}`}
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => document.getElementById(`imageUpload-${activeSlideIndex}`)?.click()}
                                                                className="flex items-center gap-2"
                                                            >
                                                                <Upload className="h-4 w-4" />
                                                                Görsel Yükle
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Başlık */}
                                            <div className="space-y-2">
                                                <Label>Başlık</Label>
                                                <Input
                                                    value={currentSlide.title}
                                                    onChange={(e) => updateSlideContent(activeSlideIndex, 'title', e.target.value)}
                                                    placeholder="Başlık girin"
                                                />
                                            </div>

                                            {/* Başlık Tipi */}
                                            <div className="space-y-2">
                                                <Label>Başlık Tipi</Label>
                                                <Select 
                                                    value={currentSlide.titleType} 
                                                    onValueChange={(value) => updateSlideContent(activeSlideIndex, 'titleType', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="z-[99999]">
                                                        <SelectItem value="h1">H1</SelectItem>
                                                        <SelectItem value="h2">H2</SelectItem>
                                                        <SelectItem value="h3">H3</SelectItem>
                                                        <SelectItem value="h4">H4</SelectItem>
                                                        <SelectItem value="h5">H5</SelectItem>
                                                        <SelectItem value="h6">H6</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* İçerik Editörü */}
                                            <div className="space-y-2">
                                                <Label>İçerik</Label>
                                                <div className="border rounded-lg">
                                                    {/* Toolbar */}
                                                    <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/50">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => editor?.chain().focus().toggleBold().run()}
                                                            className={editor?.isActive('bold') ? 'bg-muted' : ''}
                                                        >
                                                            <Bold className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => editor?.chain().focus().toggleItalic().run()}
                                                            className={editor?.isActive('italic') ? 'bg-muted' : ''}
                                                        >
                                                            <Italic className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => editor?.chain().focus().toggleUnderline().run()}
                                                            className={editor?.isActive('underline') ? 'bg-muted' : ''}
                                                        >
                                                            <Underline className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                                                        >
                                                            <AlignLeft className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                                                        >
                                                            <AlignCenter className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                                                        >
                                                            <AlignRight className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={addLinkToEditor}
                                                        >
                                                            <LinkIcon className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={addImageToEditor}
                                                        >
                                                            <ImageIcon className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <EditorContent 
                                                        editor={editor} 
                                                        className="prose prose-sm max-w-none p-4 min-h-[100px] focus:outline-none"
                                                    />
                                                </div>
                                            </div>

                                            {/* Butonlar */}
                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <Label className="text-xs">Button 1</Label>
                                                        <Input
                                                            value={currentSlide.button1Text}
                                                            onChange={(e) => updateSlideContent(activeSlideIndex, 'button1Text', e.target.value)}
                                                            placeholder="Button 1 metni"
                                                            className="text-xs"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs">Button 1 Link</Label>
                                                        <Input
                                                            value={currentSlide.button1Link}
                                                            onChange={(e) => updateSlideContent(activeSlideIndex, 'button1Link', e.target.value)}
                                                            placeholder="Button 1 linki"
                                                            className="text-xs"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <Label className="text-xs">Button 2</Label>
                                                        <Input
                                                            value={currentSlide.button2Text}
                                                            onChange={(e) => updateSlideContent(activeSlideIndex, 'button2Text', e.target.value)}
                                                            placeholder="Button 2 metni"
                                                            className="text-xs"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs">Button 2 Link</Label>
                                                        <Input
                                                            value={currentSlide.button2Link}
                                                            onChange={(e) => updateSlideContent(activeSlideIndex, 'button2Link', e.target.value)}
                                                            placeholder="Button 2 linki"
                                                            className="text-xs"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <Label className="text-xs">Button 3</Label>
                                                        <Input
                                                            value={currentSlide.button3Text}
                                                            onChange={(e) => updateSlideContent(activeSlideIndex, 'button3Text', e.target.value)}
                                                            placeholder="Button 3 metni"
                                                            className="text-xs"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs">Button 3 Link</Label>
                                                        <Input
                                                            value={currentSlide.button3Link}
                                                            onChange={(e) => updateSlideContent(activeSlideIndex, 'button3Link', e.target.value)}
                                                            placeholder="Button 3 linki"
                                                            className="text-xs"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Renk ve Pozisyon Ayarları */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs">Filigran Rengi</Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            type="color"
                                                            value={currentSlide.filigranColor}
                                                            onChange={(e) => updateSlideContent(activeSlideIndex, 'filigranColor', e.target.value)}
                                                            className="w-12 h-8 p-1"
                                                        />
                                                        <Input
                                                            value={currentSlide.filigranColor}
                                                            onChange={(e) => updateSlideContent(activeSlideIndex, 'filigranColor', e.target.value)}
                                                            className="text-xs"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs">Yazı Rengi</Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            type="color"
                                                            value={currentSlide.textColor}
                                                            onChange={(e) => updateSlideContent(activeSlideIndex, 'textColor', e.target.value)}
                                                            className="w-12 h-8 p-1"
                                                        />
                                                        <Input
                                                            value={currentSlide.textColor}
                                                            onChange={(e) => updateSlideContent(activeSlideIndex, 'textColor', e.target.value)}
                                                            className="text-xs"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Opaklık */}
                                            <div className="space-y-2">
                                                <Label className="text-xs">Opaklık Değeri: {currentSlide.opacity}</Label>
                                                <Slider
                                                    value={[currentSlide.opacity]}
                                                    onValueChange={(value) => updateSlideContent(activeSlideIndex, 'opacity', value[0])}
                                                    max={1}
                                                    min={0}
                                                    step={0.1}
                                                    className="w-full"
                                                />
                                            </div>

                                            {/* İçerik Konumu */}
                                            <div className="space-y-2">
                                                <Label className="text-xs">İçerik Konumu</Label>
                                                <Select 
                                                    value={currentSlide.contentPosition} 
                                                    onValueChange={(value: "left" | "center" | "right") => updateSlideContent(activeSlideIndex, 'contentPosition', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="z-[99999]">
                                                        <SelectItem value="left">Sol</SelectItem>
                                                        <SelectItem value="center">Orta</SelectItem>
                                                        <SelectItem value="right">Sağ</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Durumu */}
                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    id={`slide-active-${activeSlideIndex}`}
                                                    checked={currentSlide.isActive}
                                                    onCheckedChange={(checked) => updateSlideContent(activeSlideIndex, 'isActive', checked)}
                                                />
                                                <Label htmlFor={`slide-active-${activeSlideIndex}`} className="text-xs">
                                                    Durumu: {currentSlide.isActive ? 'Açık' : 'Kapalı'}
                                                </Label>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}
                    </TabsContent>


                </Tabs>

                {/* Kaydet/İptal Butonları */}
                <div className="flex justify-end gap-4 pt-6 border-t">
                    <Button variant="outline" onClick={onClose}>
                        Kapat
                    </Button>
                    <Button onClick={handleSave}>
                        Güncelle
                    </Button>
                </div>
            </div>
        </CustomModal>
    )
} 