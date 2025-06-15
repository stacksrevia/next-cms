'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, Globe } from 'lucide-react'
import ReactCountryFlag from 'react-country-flag'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface Language {
    id: string
    code: string
    name: string
    flag: string
    isDefault: boolean
    isActive: boolean
}

interface LanguageFilterProps {
    languages: Language[]
    selectedLanguage: Language | null
    onLanguageChange: (language: Language | null) => void
    showAllOption?: boolean
}

export function LanguageFilter({
    languages,
    selectedLanguage,
    onLanguageChange,
    showAllOption = true
}: LanguageFilterProps) {
    const handleLanguageChange = (value: string) => {
        if (value === "all") {
            onLanguageChange(null)
        } else {
            const language = languages.find((lang: Language) => lang.id === value)
            onLanguageChange(language || null)
        }
    }

    return (
        <Select
            value={selectedLanguage?.id || "all"}
            onValueChange={handleLanguageChange}
        >
            <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Dil seçin" />
            </SelectTrigger>
            <SelectContent>
                {showAllOption && (
                    <SelectItem value="all">
                        <div className="flex items-center gap-2">
                            <span>🌐</span>
                            <span>Tüm Diller</span>
                        </div>
                    </SelectItem>
                )}
                {languages
                    .filter(lang => lang.isActive)
                    .map((language) => (
                        <SelectItem key={language.id} value={language.id}>
                            <div className="flex items-center gap-2">
                                <ReactCountryFlag
                                    countryCode={language.flag}
                                    svg
                                    style={{
                                        width: '1em',
                                        height: '1em',
                                    }}
                                />
                                <span>{language.name}</span>
                                {language.isDefault && (
                                    <span className="text-xs text-muted-foreground">(Varsayılan)</span>
                                )}
                            </div>
                        </SelectItem>
                    ))}
            </SelectContent>
        </Select>
    )
} 