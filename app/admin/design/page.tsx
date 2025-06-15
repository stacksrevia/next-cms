"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, Save, Code, Palette } from "lucide-react"
import { toast } from "sonner"
import dynamic from "next/dynamic"

// Monaco Editor'ı dinamik olarak yükle
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
    ssr: false,
    loading: () => (
        <div className="h-96 flex items-center justify-center border rounded-md">
            <Loader2 className="h-6 w-6 animate-spin" />
        </div>
    ),
})

interface GlobalDesign {
    id: string
    customCss: string | null
    customJs: string | null
    createdAt: string
    updatedAt: string
}

export default function DesignPage() {
    const [design, setDesign] = useState<GlobalDesign | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [customCss, setCustomCss] = useState("")
    const [customJs, setCustomJs] = useState("")

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
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
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
                    {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                        <Save className="h-4 w-4 mr-2" />
                    )}
                    Kaydet
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
                    <Tabs defaultValue="css" className="w-full">
                        <div className="border-b px-6 py-4">
                            <TabsList className="grid w-full max-w-md grid-cols-2">
                                <TabsTrigger value="css" className="flex items-center gap-2">
                                    <Code className="h-4 w-4" />
                                    Custom CSS
                                </TabsTrigger>
                                <TabsTrigger value="js" className="flex items-center gap-2">
                                    <Code className="h-4 w-4" />
                                    Custom JavaScript
                                </TabsTrigger>
                            </TabsList>
                        </div>

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

            {/* Warning */}
            <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <div className="p-1 bg-yellow-100 rounded">
                            <Code className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-medium text-yellow-800">Dikkat</h4>
                            <p className="text-sm text-yellow-700">
                                Buraya yazdığınız kodlar tüm sayfalarda çalışacaktır. Hatalı kod yazmanız
                                sitenizin çalışmasını etkileyebilir. Değişiklik yapmadan önce kodlarınızı
                                test ettiğinizden emin olun.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 