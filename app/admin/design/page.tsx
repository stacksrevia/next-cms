"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Code, Palette } from "lucide-react"
import { AdminLoading } from "@/components/admin/admin-loading"
import { toast } from "sonner"
import dynamic from "next/dynamic"

// Monaco Editor'ı dinamik olarak yükle
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
    ssr: false,
    loading: () => (
        <div className="h-96 flex items-center justify-center border rounded-md">
            <AdminLoading size="sm" text="Editor yükleniyor..." />
        </div>
    ),
})

interface GlobalDesign {
    id: string
    customCss: string | null
    customJs: string | null

    // Font Settings
    titleFontSize: string | null
    titleFontWeight: string | null
    titlePadding: string | null

    paragraphFontSize: string | null
    paragraphFontWeight: string | null
    paragraphLineHeight: string | null

    buttonFontSize: string | null
    buttonFontWeight: string | null
    buttonWidth: string | null

    imageRadius: string | null

    menuFont: string | null
    titleFont: string | null
    paragraphFont: string | null

    // Color Settings
    siteBackgroundColor: string | null
    titleColor: string | null
    paragraphColor: string | null
    hoverColor: string | null

    menuBackgroundColor: string | null
    menuTextColor: string | null

    footerBackgroundColor: string | null
    footerTextColor: string | null

    createdAt: string
    updatedAt: string
}

// Google Fonts listesi
const GOOGLE_FONTS = [
    { name: "Varsayılan", value: "default" },
    { name: "Inter", value: "Inter" },
    { name: "Montserrat", value: "Montserrat" },
    { name: "Roboto", value: "Roboto" },
    { name: "Open Sans", value: "Open Sans" },
    { name: "Lato", value: "Lato" },
    { name: "Poppins", value: "Poppins" },
    { name: "Source Sans Pro", value: "Source Sans Pro" },
    { name: "Oswald", value: "Oswald" },
    { name: "Raleway", value: "Raleway" },
    { name: "PT Sans", value: "PT Sans" },
    { name: "Nunito", value: "Nunito" },
    { name: "Playfair Display", value: "Playfair Display" },
    { name: "Merriweather", value: "Merriweather" },
    { name: "Ubuntu", value: "Ubuntu" },
    { name: "Fira Sans", value: "Fira Sans" }
]

export default function DesignPage() {
    const [design, setDesign] = useState<GlobalDesign | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [customCss, setCustomCss] = useState("")
    const [customJs, setCustomJs] = useState("")

    // Font Settings
    const [titleFontSize, setTitleFontSize] = useState("36px")
    const [titleFontWeight, setTitleFontWeight] = useState("600")
    const [titlePadding, setTitlePadding] = useState("40px 0px")

    const [paragraphFontSize, setParagraphFontSize] = useState("14px")
    const [paragraphFontWeight, setParagraphFontWeight] = useState("300")
    const [paragraphLineHeight, setParagraphLineHeight] = useState("")

    const [buttonFontSize, setButtonFontSize] = useState("14px")
    const [buttonFontWeight, setButtonFontWeight] = useState("400")
    const [buttonWidth, setButtonWidth] = useState("140px")

    const [imageRadius, setImageRadius] = useState("")

    const [menuFont, setMenuFont] = useState("Poppins")
    const [titleFont, setTitleFont] = useState("")
    const [paragraphFont, setParagraphFont] = useState("")

    // Color Settings
    const [siteBackgroundColor, setSiteBackgroundColor] = useState("")
    const [titleColor, setTitleColor] = useState("")
    const [paragraphColor, setParagraphColor] = useState("")
    const [hoverColor, setHoverColor] = useState("")

    const [menuBackgroundColor, setMenuBackgroundColor] = useState("")
    const [menuTextColor, setMenuTextColor] = useState("")

    const [footerBackgroundColor, setFooterBackgroundColor] = useState("")
    const [footerTextColor, setFooterTextColor] = useState("")

    // Global tasarım ayarlarını yükle
    useEffect(() => {
        fetchDesign()
    }, [])

    const fetchDesign = async () => {
        try {
            const response = await fetch("/api/admin/design")
            if (response.ok) {
                const data = await response.json()
                setDesign(data)
                setCustomCss(data.customCss || "")
                setCustomJs(data.customJs || "")

                // Font Settings
                setTitleFontSize(data.titleFontSize || "36px")
                setTitleFontWeight(data.titleFontWeight || "600")
                setTitlePadding(data.titlePadding || "40px 0px")

                setParagraphFontSize(data.paragraphFontSize || "14px")
                setParagraphFontWeight(data.paragraphFontWeight || "300")
                setParagraphLineHeight(data.paragraphLineHeight || "")

                setButtonFontSize(data.buttonFontSize || "14px")
                setButtonFontWeight(data.buttonFontWeight || "400")
                setButtonWidth(data.buttonWidth || "140px")

                setImageRadius(data.imageRadius || "")

                setMenuFont(data.menuFont || "Poppins")
                setTitleFont(data.titleFont || "")
                setParagraphFont(data.paragraphFont || "")

                // Color Settings
                setSiteBackgroundColor(data.siteBackgroundColor || "")
                setTitleColor(data.titleColor || "")
                setParagraphColor(data.paragraphColor || "")
                setHoverColor(data.hoverColor || "")

                setMenuBackgroundColor(data.menuBackgroundColor || "")
                setMenuTextColor(data.menuTextColor || "")

                setFooterBackgroundColor(data.footerBackgroundColor || "")
                setFooterTextColor(data.footerTextColor || "")
            }
        } catch (error) {
            console.error("Error fetching design:", error)
            toast.error("Tasarım ayarları yüklenirken hata oluştu")
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const response = await fetch("/api/admin/design", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    customCss,
                    customJs,

                    // Font Settings
                    titleFontSize,
                    titleFontWeight,
                    titlePadding,

                    paragraphFontSize,
                    paragraphFontWeight,
                    paragraphLineHeight,

                    buttonFontSize,
                    buttonFontWeight,
                    buttonWidth,

                    imageRadius,

                    menuFont,
                    titleFont,
                    paragraphFont,

                    // Color Settings
                    siteBackgroundColor,
                    titleColor,
                    paragraphColor,
                    hoverColor,

                    menuBackgroundColor,
                    menuTextColor,

                    footerBackgroundColor,
                    footerTextColor,
                }),
            })

            if (response.ok) {
                const updatedDesign = await response.json()
                setDesign(updatedDesign)
                toast.success("Tasarım ayarları başarıyla kaydedildi")
            } else {
                throw new Error("Failed to save design")
            }
        } catch (error) {
            console.error("Error saving design:", error)
            toast.error("Tasarım ayarları kaydedilirken hata oluştu")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <AdminLoading text="Tasarım ayarları yükleniyor..." />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Palette className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Tasarım Yönetimi</h1>
                        <p className="text-muted-foreground">
                            Tüm sayfalarda geçerli olacak özel CSS ve JavaScript kodları
                        </p>
                    </div>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Kaydediliyor..." : "Kaydet"}
                </Button>
            </div>

            {/* Info Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Code className="h-5 w-5" />
                        Global Tasarım Ayarları
                    </CardTitle>
                    <CardDescription>
                        Burada yazdığınız CSS ve JavaScript kodları sitenizin tüm sayfalarında çalışacaktır.
                        Değişiklikler anında tüm ziyaretçiler için geçerli olur.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">CSS</Badge>
                            <span>{customCss.length} karakter</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">JS</Badge>
                            <span>{customJs.length} karakter</span>
                        </div>
                        {design && (
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary">
                                    Son güncelleme: {new Date(design.updatedAt).toLocaleDateString("tr-TR")}
                                </Badge>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Editor Tabs */}
            <Card>
                <CardContent className="p-0">
                    <Tabs defaultValue="fonts" className="w-full">
                        <div className="border-b px-6 py-4">
                            <TabsList className="grid w-full max-w-2xl grid-cols-4">
                                <TabsTrigger value="fonts" className="flex items-center gap-2">
                                    <Palette className="h-4 w-4" />
                                    Font Ayarları
                                </TabsTrigger>
                                <TabsTrigger value="colors" className="flex items-center gap-2">
                                    <Palette className="h-4 w-4" />
                                    Renk Ayarları
                                </TabsTrigger>
                                <TabsTrigger value="css" className="flex items-center gap-2">
                                    <Code className="h-4 w-4" />
                                    Özel CSS
                                </TabsTrigger>
                                <TabsTrigger value="js" className="flex items-center gap-2">
                                    <Code className="h-4 w-4" />
                                    Özel JS
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="fonts" className="p-6 pt-4">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Font Ayarları</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Sitenizin genel font ayarlarını buradan düzenleyebilirsiniz.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {/* Başlık Boyutu */}
                                    <div className="space-y-2">
                                        <Label htmlFor="titleFontSize">Başlık Boyutu</Label>
                                        <Input
                                            id="titleFontSize"
                                            value={titleFontSize}
                                            onChange={(e) => setTitleFontSize(e.target.value)}
                                            placeholder="36px"
                                        />
                                    </div>

                                    {/* Başlık Kalınlığı */}
                                    <div className="space-y-2">
                                        <Label htmlFor="titleFontWeight">Başlık Kalınlığı</Label>
                                        <Input
                                            id="titleFontWeight"
                                            value={titleFontWeight}
                                            onChange={(e) => setTitleFontWeight(e.target.value)}
                                            placeholder="600"
                                        />
                                    </div>

                                    {/* Genel Padding */}
                                    <div className="space-y-2">
                                        <Label htmlFor="titlePadding">Genel Padding</Label>
                                        <Input
                                            id="titlePadding"
                                            value={titlePadding}
                                            onChange={(e) => setTitlePadding(e.target.value)}
                                            placeholder="40px 0px"
                                        />
                                    </div>

                                    {/* Paragraf Boyutu */}
                                    <div className="space-y-2">
                                        <Label htmlFor="paragraphFontSize">Paragraf Boyutu</Label>
                                        <Input
                                            id="paragraphFontSize"
                                            value={paragraphFontSize}
                                            onChange={(e) => setParagraphFontSize(e.target.value)}
                                            placeholder="14px"
                                        />
                                    </div>

                                    {/* Paragraf Kalınlığı */}
                                    <div className="space-y-2">
                                        <Label htmlFor="paragraphFontWeight">Paragraf Kalınlığı</Label>
                                        <Input
                                            id="paragraphFontWeight"
                                            value={paragraphFontWeight}
                                            onChange={(e) => setParagraphFontWeight(e.target.value)}
                                            placeholder="300"
                                        />
                                    </div>

                                    {/* Paragraf Yüksekliği */}
                                    <div className="space-y-2">
                                        <Label htmlFor="paragraphLineHeight">Paragraf Yüksekliği</Label>
                                        <Input
                                            id="paragraphLineHeight"
                                            value={paragraphLineHeight}
                                            onChange={(e) => setParagraphLineHeight(e.target.value)}
                                            placeholder="1.6"
                                        />
                                    </div>

                                    {/* Buton Boyutu */}
                                    <div className="space-y-2">
                                        <Label htmlFor="buttonFontSize">Buton Boyutu</Label>
                                        <Input
                                            id="buttonFontSize"
                                            value={buttonFontSize}
                                            onChange={(e) => setButtonFontSize(e.target.value)}
                                            placeholder="14px"
                                        />
                                    </div>

                                    {/* Buton Kalınlığı */}
                                    <div className="space-y-2">
                                        <Label htmlFor="buttonFontWeight">Buton Kalınlığı</Label>
                                        <Input
                                            id="buttonFontWeight"
                                            value={buttonFontWeight}
                                            onChange={(e) => setButtonFontWeight(e.target.value)}
                                            placeholder="400"
                                        />
                                    </div>

                                    {/* Buton Genişliği */}
                                    <div className="space-y-2">
                                        <Label htmlFor="buttonWidth">Buton Genişliği</Label>
                                        <Input
                                            id="buttonWidth"
                                            value={buttonWidth}
                                            onChange={(e) => setButtonWidth(e.target.value)}
                                            placeholder="140px"
                                        />
                                    </div>

                                    {/* Görsel Radius */}
                                    <div className="space-y-2">
                                        <Label htmlFor="imageRadius">Görsel Radius (Oval)</Label>
                                        <Input
                                            id="imageRadius"
                                            value={imageRadius}
                                            onChange={(e) => setImageRadius(e.target.value)}
                                            placeholder="8px"
                                        />
                                    </div>

                                    {/* Menü Font */}
                                    <div className="space-y-2">
                                        <Label htmlFor="menuFont">Menü ve Genel Font</Label>
                                        <Select value={menuFont} onValueChange={setMenuFont}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Font seçiniz" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {GOOGLE_FONTS.map((font) => (
                                                    <SelectItem key={font.value} value={font.value}>
                                                        <span style={{ fontFamily: font.value || 'inherit' }}>
                                                            {font.name}
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Başlık Font */}
                                    <div className="space-y-2">
                                        <Label htmlFor="titleFont">Başlık Font</Label>
                                        <Select value={titleFont} onValueChange={setTitleFont}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Font seçiniz" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {GOOGLE_FONTS.map((font) => (
                                                    <SelectItem key={font.value} value={font.value}>
                                                        <span style={{ fontFamily: font.value || 'inherit' }}>
                                                            {font.name}
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Paragraf Font */}
                                    <div className="space-y-2">
                                        <Label htmlFor="paragraphFont">Paragraf Font</Label>
                                        <Select value={paragraphFont} onValueChange={setParagraphFont}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Font seçiniz" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {GOOGLE_FONTS.map((font) => (
                                                    <SelectItem key={font.value} value={font.value}>
                                                        <span style={{ fontFamily: font.value || 'inherit' }}>
                                                            {font.name}
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="colors" className="p-6 pt-4">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Renk Ayarları</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Sitenizin genel renk ayarlarını buradan düzenleyebilirsiniz.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {/* Site Ana Renk */}
                                    <div className="space-y-2">
                                        <Label htmlFor="siteBackgroundColor">Site Ana Renk</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="color"
                                                id="siteBackgroundColor"
                                                value={siteBackgroundColor || '#ffffff'}
                                                onChange={(e) => setSiteBackgroundColor(e.target.value)}
                                                className="w-16 h-10 p-1 rounded cursor-pointer"
                                            />
                                            <Input
                                                value={siteBackgroundColor}
                                                onChange={(e) => setSiteBackgroundColor(e.target.value)}
                                                placeholder="#ffffff"
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>

                                    {/* Başlık Renk */}
                                    <div className="space-y-2">
                                        <Label htmlFor="titleColor">Başlık Renk</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="color"
                                                id="titleColor"
                                                value={titleColor || '#000000'}
                                                onChange={(e) => setTitleColor(e.target.value)}
                                                className="w-16 h-10 p-1 rounded cursor-pointer"
                                            />
                                            <Input
                                                value={titleColor}
                                                onChange={(e) => setTitleColor(e.target.value)}
                                                placeholder="#000000"
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>

                                    {/* Paragraf Renk */}
                                    <div className="space-y-2">
                                        <Label htmlFor="paragraphColor">Paragraf Renk</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="color"
                                                id="paragraphColor"
                                                value={paragraphColor || '#666666'}
                                                onChange={(e) => setParagraphColor(e.target.value)}
                                                className="w-16 h-10 p-1 rounded cursor-pointer"
                                            />
                                            <Input
                                                value={paragraphColor}
                                                onChange={(e) => setParagraphColor(e.target.value)}
                                                placeholder="#666666"
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>

                                    {/* Hover Renk */}
                                    <div className="space-y-2">
                                        <Label htmlFor="hoverColor">Hover Renk</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="color"
                                                id="hoverColor"
                                                value={hoverColor || '#0066cc'}
                                                onChange={(e) => setHoverColor(e.target.value)}
                                                className="w-16 h-10 p-1 rounded cursor-pointer"
                                            />
                                            <Input
                                                value={hoverColor}
                                                onChange={(e) => setHoverColor(e.target.value)}
                                                placeholder="#0066cc"
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>

                                    {/* Menü Arkaplan Renk */}
                                    <div className="space-y-2">
                                        <Label htmlFor="menuBackgroundColor">Menü (Navbar) Arkaplan Renk</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="color"
                                                id="menuBackgroundColor"
                                                value={menuBackgroundColor || '#ffffff'}
                                                onChange={(e) => setMenuBackgroundColor(e.target.value)}
                                                className="w-16 h-10 p-1 rounded cursor-pointer"
                                            />
                                            <Input
                                                value={menuBackgroundColor}
                                                onChange={(e) => setMenuBackgroundColor(e.target.value)}
                                                placeholder="#ffffff"
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>

                                    {/* Menü Yazı Renk */}
                                    <div className="space-y-2">
                                        <Label htmlFor="menuTextColor">Menü (Navbar) Yazı Renk</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="color"
                                                id="menuTextColor"
                                                value={menuTextColor || '#000000'}
                                                onChange={(e) => setMenuTextColor(e.target.value)}
                                                className="w-16 h-10 p-1 rounded cursor-pointer"
                                            />
                                            <Input
                                                value={menuTextColor}
                                                onChange={(e) => setMenuTextColor(e.target.value)}
                                                placeholder="#000000"
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>

                                    {/* Footer Arkaplan Renk */}
                                    <div className="space-y-2">
                                        <Label htmlFor="footerBackgroundColor">Footer Arkaplan Renk</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="color"
                                                id="footerBackgroundColor"
                                                value={footerBackgroundColor || '#f8f9fa'}
                                                onChange={(e) => setFooterBackgroundColor(e.target.value)}
                                                className="w-16 h-10 p-1 rounded cursor-pointer"
                                            />
                                            <Input
                                                value={footerBackgroundColor}
                                                onChange={(e) => setFooterBackgroundColor(e.target.value)}
                                                placeholder="#f8f9fa"
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>

                                    {/* Footer Yazı Renk */}
                                    <div className="space-y-2">
                                        <Label htmlFor="footerTextColor">Footer Yazı Renk</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="color"
                                                id="footerTextColor"
                                                value={footerTextColor || '#000000'}
                                                onChange={(e) => setFooterTextColor(e.target.value)}
                                                className="w-16 h-10 p-1 rounded cursor-pointer"
                                            />
                                            <Input
                                                value={footerTextColor}
                                                onChange={(e) => setFooterTextColor(e.target.value)}
                                                placeholder="#000000"
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="css" className="p-6 pt-4">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Global CSS</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Tüm sayfalarda geçerli olacak CSS kodlarınızı buraya yazın.
                                    </p>
                                </div>
                                <MonacoEditor
                                    height="500px"
                                    language="css"
                                    theme="vs-dark"
                                    value={customCss}
                                    onChange={(value) => setCustomCss(value || "")}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                        lineNumbers: "on",
                                        roundedSelection: false,
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true,
                                        tabSize: 2,
                                        insertSpaces: true,
                                        wordWrap: "on",
                                    }}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="js" className="p-6 pt-4">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Global JavaScript</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Tüm sayfalarda çalışacak JavaScript kodlarınızı buraya yazın.
                                    </p>
                                </div>
                                <MonacoEditor
                                    height="500px"
                                    language="javascript"
                                    theme="vs-dark"
                                    value={customJs}
                                    onChange={(value) => setCustomJs(value || "")}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                        lineNumbers: "on",
                                        roundedSelection: false,
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true,
                                        tabSize: 2,
                                        insertSpaces: true,
                                        wordWrap: "on",
                                    }}
                                />
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

        </div>
    )
} 