"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Globe, Flag } from "lucide-react"
import { toast } from "sonner"
import ReactCountryFlag from "react-country-flag"

interface Language {
    id: string
    code: string
    name: string
    flag: string
    isDefault: boolean
    isActive: boolean
    createdAt: string
    updatedAt: string
}

const COUNTRY_OPTIONS = [
    { code: 'TR', name: 'Türkiye', flag: 'TR' },
    { code: 'US', name: 'Amerika Birleşik Devletleri', flag: 'US' },
    { code: 'GB', name: 'Birleşik Krallık', flag: 'GB' },
    { code: 'DE', name: 'Almanya', flag: 'DE' },
    { code: 'FR', name: 'Fransa', flag: 'FR' },
    { code: 'ES', name: 'İspanya', flag: 'ES' },
    { code: 'IT', name: 'İtalya', flag: 'IT' },
    { code: 'RU', name: 'Rusya', flag: 'RU' },
    { code: 'CN', name: 'Çin', flag: 'CN' },
    { code: 'JP', name: 'Japonya', flag: 'JP' },
    { code: 'KR', name: 'Güney Kore', flag: 'KR' },
    { code: 'AR', name: 'Arjantin', flag: 'AR' },
    { code: 'BR', name: 'Brezilya', flag: 'BR' },
    { code: 'MX', name: 'Meksika', flag: 'MX' },
    { code: 'CA', name: 'Kanada', flag: 'CA' },
    { code: 'AU', name: 'Avustralya', flag: 'AU' },
    { code: 'IN', name: 'Hindistan', flag: 'IN' },
    { code: 'SA', name: 'Suudi Arabistan', flag: 'SA' },
    { code: 'AE', name: 'Birleşik Arap Emirlikleri', flag: 'AE' },
    { code: 'NL', name: 'Hollanda', flag: 'NL' },
    { code: 'BE', name: 'Belçika', flag: 'BE' },
    { code: 'CH', name: 'İsviçre', flag: 'CH' },
    { code: 'AT', name: 'Avusturya', flag: 'AT' },
    { code: 'SE', name: 'İsveç', flag: 'SE' },
    { code: 'NO', name: 'Norveç', flag: 'NO' },
    { code: 'DK', name: 'Danimarka', flag: 'DK' },
    { code: 'FI', name: 'Finlandiya', flag: 'FI' },
    { code: 'PL', name: 'Polonya', flag: 'PL' },
    { code: 'CZ', name: 'Çek Cumhuriyeti', flag: 'CZ' },
    { code: 'HU', name: 'Macaristan', flag: 'HU' },
    { code: 'GR', name: 'Yunanistan', flag: 'GR' },
    { code: 'PT', name: 'Portekiz', flag: 'PT' },
]

export default function LanguagesManagement() {
    const [languages, setLanguages] = useState<Language[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [editingLanguage, setEditingLanguage] = useState<Language | null>(null)
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        flag: '',
        isDefault: false,
        isActive: true
    })

    useEffect(() => {
        fetchLanguages()
    }, [])

    const fetchLanguages = async () => {
        try {
            const response = await fetch('/api/admin/languages')
            if (response.ok) {
                const data = await response.json()
                setLanguages(data.languages)
            } else {
                toast.error('Diller yüklenirken hata oluştu')
            }
        } catch {
            toast.error('Diller yüklenirken hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.code || !formData.name || !formData.flag) {
            toast.error('Lütfen tüm alanları doldurun')
            return
        }

        try {
            const url = editingLanguage
                ? `/api/admin/languages/${editingLanguage.id}`
                : '/api/admin/languages'

            const method = editingLanguage ? 'PATCH' : 'POST'

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                toast.success(editingLanguage ? 'Dil güncellendi' : 'Dil oluşturuldu')
                setIsCreateDialogOpen(false)
                setIsEditDialogOpen(false)
                setEditingLanguage(null)
                setFormData({
                    code: '',
                    name: '',
                    flag: '',
                    isDefault: false,
                    isActive: true
                })
                fetchLanguages()
            } else {
                const error = await response.json()
                toast.error(error.error || 'Bir hata oluştu')
            }
        } catch {
            toast.error('Bir hata oluştu')
        }
    }

    const handleEdit = (language: Language) => {
        setEditingLanguage(language)
        setFormData({
            code: language.code,
            name: language.name,
            flag: language.flag,
            isDefault: language.isDefault,
            isActive: language.isActive
        })
        setIsEditDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Bu dili silmek istediğinizden emin misiniz?')) {
            return
        }

        try {
            const response = await fetch(`/api/admin/languages/${id}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                toast.success('Dil silindi')
                fetchLanguages()
            } else {
                const error = await response.json()
                toast.error(error.error || 'Dil silinirken hata oluştu')
            }
        } catch {
            toast.error('Dil silinirken hata oluştu')
        }
    }

    const handleToggleStatus = async (id: string, isActive: boolean) => {
        try {
            const response = await fetch(`/api/admin/languages/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isActive }),
            })

            if (response.ok) {
                toast.success(`Dil ${isActive ? 'aktif' : 'pasif'} edildi`)
                fetchLanguages()
            } else {
                const error = await response.json()
                toast.error(error.error || 'Durum güncellenirken hata oluştu')
            }
        } catch {
            toast.error('Durum güncellenirken hata oluştu')
        }
    }

    const handleSetDefault = async (id: string) => {
        try {
            const response = await fetch(`/api/admin/languages/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isDefault: true }),
            })

            if (response.ok) {
                toast.success('Varsayılan dil güncellendi')
                fetchLanguages()
            } else {
                const error = await response.json()
                toast.error(error.error || 'Varsayılan dil güncellenirken hata oluştu')
            }
        } catch {
            toast.error('Varsayılan dil güncellenirken hata oluştu')
        }
    }

    const resetForm = () => {
        setFormData({
            code: '',
            name: '',
            flag: '',
            isDefault: false,
            isActive: true
        })
        setEditingLanguage(null)
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
                    <h2 className="text-3xl font-bold tracking-tight">Dil Yönetimi</h2>
                    <p className="text-muted-foreground">
                        Web sitesi dillerini oluşturun ve yönetin
                    </p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="mr-2 h-4 w-4" />
                            Yeni Dil
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Yeni Dil Ekle</DialogTitle>
                            <DialogDescription>
                                Web siteniz için yeni bir dil ekleyin
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="code">Dil Kodu</Label>
                                    <Input
                                        id="code"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase() })}
                                        placeholder="tr, en, de..."
                                        maxLength={2}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="name">Dil Adı</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Türkçe, English, Deutsch..."
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="flag">Ülke Bayrağı</Label>
                                    <Select
                                        value={formData.flag}
                                        onValueChange={(value) => setFormData({ ...formData, flag: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Ülke seçin">
                                                {formData.flag && (
                                                    <div className="flex items-center gap-2">
                                                        <ReactCountryFlag
                                                            countryCode={formData.flag}
                                                            svg
                                                            style={{ width: '1em', height: '1em' }}
                                                        />
                                                        {COUNTRY_OPTIONS.find(c => c.flag === formData.flag)?.name}
                                                    </div>
                                                )}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {COUNTRY_OPTIONS.map((country) => (
                                                <SelectItem key={country.flag} value={country.flag}>
                                                    <div className="flex items-center gap-2">
                                                        <ReactCountryFlag
                                                            countryCode={country.flag}
                                                            svg
                                                            style={{ width: '1em', height: '1em' }}
                                                        />
                                                        {country.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="isDefault"
                                        checked={formData.isDefault}
                                        onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked })}
                                    />
                                    <Label htmlFor="isDefault">Varsayılan dil</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="isActive"
                                        checked={formData.isActive}
                                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                                    />
                                    <Label htmlFor="isActive">Aktif</Label>
                                </div>
                            </div>
                            <DialogFooter className="mt-6">
                                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                    İptal
                                </Button>
                                <Button type="submit">
                                    Oluştur
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Toplam Dil
                        </CardTitle>
                        <Globe className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{languages.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Aktif Diller
                        </CardTitle>
                        <Flag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {languages.filter(l => l.isActive).length}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Varsayılan Dil
                        </CardTitle>
                        <ReactCountryFlag
                            countryCode={languages.find(l => l.isDefault)?.flag || 'TR'}
                            svg
                            style={{ width: '1em', height: '1em' }}
                        />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold">
                            {languages.find(l => l.isDefault)?.name || 'Belirlenmemiş'}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Pasif Diller
                        </CardTitle>
                        <Globe className="h-4 w-4 text-muted-foreground opacity-50" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {languages.filter(l => !l.isActive).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Languages Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Diller</CardTitle>
                    <CardDescription>
                        Tüm dilleri görüntüleyin ve yönetin
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Bayrak</TableHead>
                                    <TableHead>Dil</TableHead>
                                    <TableHead>Kod</TableHead>
                                    <TableHead>Durum</TableHead>
                                    <TableHead>Varsayılan</TableHead>
                                    <TableHead className="text-right">İşlemler</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {languages.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            <div className="text-muted-foreground">
                                                Henüz dil eklenmemiş
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    languages.map((language) => (
                                        <TableRow key={language.id}>
                                            <TableCell>
                                                <ReactCountryFlag
                                                    countryCode={language.flag}
                                                    svg
                                                    style={{
                                                        width: '1.5em',
                                                        height: '1.5em',
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {language.name}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {language.code.toUpperCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Switch
                                                        checked={language.isActive}
                                                        onCheckedChange={(checked) => handleToggleStatus(language.id, checked)}
                                                    />
                                                    <Badge variant={language.isActive ? "default" : "secondary"}>
                                                        {language.isActive ? "Aktif" : "Pasif"}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {language.isDefault ? (
                                                    <Badge variant="default">Varsayılan</Badge>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleSetDefault(language.id)}
                                                    >
                                                        Varsayılan Yap
                                                    </Button>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEdit(language)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDelete(language.id)}
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

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Dil Düzenle</DialogTitle>
                        <DialogDescription>
                            Dil bilgilerini güncelleyin
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="edit-code">Dil Kodu</Label>
                                <Input
                                    id="edit-code"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase() })}
                                    placeholder="tr, en, de..."
                                    maxLength={2}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-name">Dil Adı</Label>
                                <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Türkçe, English, Deutsch..."
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-flag">Ülke Bayrağı</Label>
                                <Select
                                    value={formData.flag}
                                    onValueChange={(value) => setFormData({ ...formData, flag: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Ülke seçin">
                                            {formData.flag && (
                                                <div className="flex items-center gap-2">
                                                    <ReactCountryFlag
                                                        countryCode={formData.flag}
                                                        svg
                                                        style={{ width: '1em', height: '1em' }}
                                                    />
                                                    {COUNTRY_OPTIONS.find(c => c.flag === formData.flag)?.name}
                                                </div>
                                            )}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {COUNTRY_OPTIONS.map((country) => (
                                            <SelectItem key={country.flag} value={country.flag}>
                                                <div className="flex items-center gap-2">
                                                    <ReactCountryFlag
                                                        countryCode={country.flag}
                                                        svg
                                                        style={{ width: '1em', height: '1em' }}
                                                    />
                                                    {country.name}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="edit-isDefault"
                                    checked={formData.isDefault}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked })}
                                />
                                <Label htmlFor="edit-isDefault">Varsayılan dil</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="edit-isActive"
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                                />
                                <Label htmlFor="edit-isActive">Aktif</Label>
                            </div>
                        </div>
                        <DialogFooter className="mt-6">
                            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                İptal
                            </Button>
                            <Button type="submit">
                                Güncelle
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
} 