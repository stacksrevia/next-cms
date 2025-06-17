'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronDown, Menu, X, Globe } from 'lucide-react'
import ReactCountryFlag from 'react-country-flag'
import styles from '@/styles/navbar.module.css'

interface NavPage {
    id: string
    title: string
    slug: string
    parentId: string | null
    order: number
    children?: NavPage[]
}

interface Language {
    id: string
    code: string
    name: string
    flag: string
    isDefault: boolean
    isActive: boolean
}

interface NavbarProps {
    pages: NavPage[]
    currentLanguage: Language | null
    homePageSlug: string
}

export function Navbar({ pages, currentLanguage, homePageSlug }: NavbarProps) {
    const pathname = usePathname()
    const router = useRouter()

    // States
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set())
    const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false)
    const [languages, setLanguages] = useState<Language[]>([])
    const [isMounted, setIsMounted] = useState(false)

    // Mount effect
    useEffect(() => {
        setIsMounted(true)
    }, [])

    // Scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Fetch languages
    useEffect(() => {
        const fetchLanguages = async () => {
            try {
                const response = await fetch('/api/languages')
                if (response.ok) {
                    const data = await response.json()
                    setLanguages(data.languages || [])
                }
            } catch (error) {
                console.error('Error fetching languages:', error)
            }
        }

        fetchLanguages()
    }, [])

    // Body scroll lock for mobile menu
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }

        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isMobileMenuOpen])

    // Close dropdowns when clicking outside (only for mobile and language selector)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element

            // Close language menu when clicking outside
            if (!target.closest(`.${styles.languageSelector}`)) {
                setIsLanguageMenuOpen(false)
            }

            // Close mobile dropdowns when clicking outside
            if (!target.closest(`.${styles.mobileDropdown}`) && isMobileMenuOpen) {
                setOpenDropdowns(new Set())
            }
        }

        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsMobileMenuOpen(false)
                setIsLanguageMenuOpen(false)
                setOpenDropdowns(new Set())
            }
        }

        document.addEventListener('click', handleClickOutside)
        document.addEventListener('keydown', handleEscapeKey)

        return () => {
            document.removeEventListener('click', handleClickOutside)
            document.removeEventListener('keydown', handleEscapeKey)
        }
    }, [isMobileMenuOpen])

    // Helper functions
    const getPageUrl = (page: NavPage) => {
        const currentLangPrefix = `/${currentLanguage?.code || 'tr'}`

        // Ana sayfa kontrolü (order 0 veya slug = homePageSlug)
        if (!page.parentId && (page.order === 0 || page.slug === homePageSlug)) {
            // Ana sayfa için her zaman / URL'sini kullan
            return currentLangPrefix
        }

        // Diğer sayfalar için normal URL
        return `${currentLangPrefix}/${page.slug}`
    }

    const isActivePage = (page: NavPage) => {
        const currentLangPrefix = `/${currentLanguage?.code || 'tr'}`

        // Ana sayfa kontrolü (order 0 veya slug = homePageSlug)
        if (!page.parentId && (page.order === 0 || page.slug === homePageSlug)) {
            // Ana sayfa için hem / hem de /slug URL'leri kontrol ediliyor
            return pathname === currentLangPrefix ||
                pathname === `${currentLangPrefix}/` ||
                pathname === `${currentLangPrefix}/${homePageSlug}`
        }

        // Diğer sayfalar için normal kontrol
        const expectedPath = `${currentLangPrefix}/${page.slug}`
        return pathname === expectedPath
    }

    const handleLanguageChange = async (language: Language) => {
        if (!language || !currentLanguage || language.code === currentLanguage.code) return

        setIsLanguageMenuOpen(false)
        setIsMobileMenuOpen(false)

        const currentPath = pathname
        const segments = currentPath.split('/').filter(Boolean)

        let currentLangCode = currentLanguage.code
        let slug = null

        // Dil kodunu ve slug'ı ayıkla
        if (segments.length > 0 && languages.some(lang => lang.code === segments[0])) {
            currentLangCode = segments[0]
            if (segments.length > 1) {
                slug = segments[1]
            }
        } else if (segments.length > 0) {
            slug = segments[0]
        }

        // Anasayfa kontrolü
        if (!slug || slug === homePageSlug) {
            // Anasayfa için direkt dil kodu ile yönlendir
            router.push(`/${language.code}`)
            return
        }

        // Diğer sayfalar için slug çevirisi yap
        try {
            const response = await fetch(`/api/pages/translate-slug?slug=${slug}&from=${currentLangCode}&to=${language.code}`)
            if (response.ok) {
                const data = await response.json()
                if (data.redirectToHome) {
                    router.push(`/${language.code}`)
                    return
                } else if (data.slug) {
                    router.push(`/${language.code}/${data.slug}`)
                    return
                }
            }
        } catch (error) {
            console.error('Error translating slug:', error)
        }

        // Fallback olarak ana sayfaya yönlendir
        router.push(`/${language.code}`)
    }

    const toggleDropdown = (pageId: string) => {
        const newOpenDropdowns = new Set(openDropdowns)
        if (newOpenDropdowns.has(pageId)) {
            newOpenDropdowns.delete(pageId)
        } else {
            newOpenDropdowns.clear()
            newOpenDropdowns.add(pageId)
        }
        setOpenDropdowns(newOpenDropdowns)
    }

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen)
        setOpenDropdowns(new Set())
    }

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false)
        setOpenDropdowns(new Set())
    }

    // Get root pages
    const rootPages = pages.filter(page => !page.parentId)

    // Render desktop menu item
    const renderDesktopMenuItem = (page: NavPage) => {
        const hasChildren = page.children && page.children.length > 0
        const isActive = isActivePage(page)

        if (hasChildren) {
            const isOpen = openDropdowns.has(page.id)

            return (
                <li key={page.id} className={styles.navItem}>
                    <div className={styles.dropdown}>
                        <Link
                            href={getPageUrl(page)}
                            className={`${styles.dropdownToggle} ${isActive ? styles.active : ''}`}
                        >
                            <span>{page.title}</span>
                            <ChevronDown className={styles.dropdownIcon} />
                        </Link>
                        <div className={styles.dropdownMenu}>
                            {page.children?.map((child) => (
                                <Link
                                    key={child.id}
                                    href={getPageUrl(child)}
                                    className={`${styles.dropdownItem} ${isActivePage(child) ? styles.active : ''}`}
                                >
                                    {child.title}
                                </Link>
                            ))}
                        </div>
                    </div>
                </li>
            )
        }

        return (
            <li key={page.id} className={styles.navItem}>
                <Link
                    href={getPageUrl(page)}
                    className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                >
                    {page.title}
                </Link>
            </li>
        )
    }

    // Render mobile menu item
    const renderMobileMenuItem = (page: NavPage) => {
        const hasChildren = page.children && page.children.length > 0
        const isActive = isActivePage(page)

        if (hasChildren) {
            const isOpen = openDropdowns.has(page.id)

            return (
                <li key={page.id} className={styles.mobileNavItem}>
                    <div className={styles.mobileDropdown}>
                        <div className={styles.mobileDropdownToggle}>
                            <Link
                                href={getPageUrl(page)}
                                onClick={closeMobileMenu}
                                className={`${isActive ? styles.active : ''}`}
                                style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}
                            >
                                <span>{page.title}</span>
                            </Link>
                            <button
                                onClick={() => toggleDropdown(page.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 0 0.5rem', color: 'inherit' }}
                            >
                                <ChevronDown className={`${styles.dropdownIcon} ${isOpen ? styles.open : ''}`} />
                            </button>
                        </div>
                        <div className={`${styles.mobileDropdownMenu} ${isOpen ? styles.open : ''}`}>
                            {page.children?.map((child) => (
                                <Link
                                    key={child.id}
                                    href={getPageUrl(child)}
                                    className={`${styles.mobileDropdownItem} ${isActivePage(child) ? styles.active : ''}`}
                                    onClick={closeMobileMenu}
                                >
                                    {child.title}
                                </Link>
                            ))}
                        </div>
                    </div>
                </li>
            )
        }

        return (
            <li key={page.id} className={styles.mobileNavItem}>
                <Link
                    href={getPageUrl(page)}
                    className={`${styles.mobileNavLink} ${isActive ? styles.active : ''}`}
                    onClick={closeMobileMenu}
                >
                    {page.title}
                </Link>
            </li>
        )
    }

    // SSR-friendly render
    if (!isMounted) {
        return (
            <nav className={styles.navbar}>
                <div className={styles.container}>
                    <Link href={`/${currentLanguage?.code || 'tr'}`} className={styles.logo}>
                        VIRA
                    </Link>
                    <div className={styles.desktopMenu}>
                        <ul className={styles.navList}>
                            {rootPages.map(page => (
                                <li key={page.id} className={styles.navItem}>
                                    <Link
                                        href={getPageUrl(page)}
                                        className={styles.navLink}
                                    >
                                        {page.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <div className={styles.languageSelector}>
                            <button className={styles.languageButton}>
                                {currentLanguage ? (
                                    <>
                                        <ReactCountryFlag
                                            countryCode={currentLanguage.flag}
                                            svg
                                            style={{ width: '1em', height: '1em' }}
                                        />
                                        <span>{currentLanguage.code.toUpperCase()}</span>
                                    </>
                                ) : (
                                    <>
                                        <Globe size={16} />
                                        <span>Dil</span>
                                    </>
                                )}
                                <ChevronDown className={styles.dropdownIcon} />
                            </button>
                        </div>
                    </div>
                    <button className={styles.mobileToggle} aria-label="Toggle mobile menu">
                        <Menu size={24} />
                    </button>
                </div>
            </nav>
        )
    }

    return (
        <>
            <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
                <div className={styles.container}>
                    {/* Logo */}
                    <Link href={`/${currentLanguage?.code || 'tr'}`} className={styles.logo}>
                        VIRA
                    </Link>

                    {/* Desktop Menu */}
                    <div className={styles.desktopMenu}>
                        <ul className={styles.navList}>
                            {rootPages.map(renderDesktopMenuItem)}
                        </ul>

                        {/* Language Selector */}
                        <div className={styles.languageSelector}>
                            <button
                                className={styles.languageButton}
                                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                            >
                                {currentLanguage ? (
                                    <>
                                        <ReactCountryFlag
                                            countryCode={currentLanguage.flag}
                                            svg
                                            style={{ width: '1em', height: '1em' }}
                                        />
                                        <span>{currentLanguage.code.toUpperCase()}</span>
                                    </>
                                ) : (
                                    <>
                                        <Globe size={16} />
                                        <span>Dil</span>
                                    </>
                                )}
                                <ChevronDown className={`${styles.dropdownIcon} ${isLanguageMenuOpen ? styles.open : ''}`} />
                            </button>

                            <div className={`${styles.languageMenu} ${isLanguageMenuOpen ? styles.open : ''}`}>
                                {languages.filter(lang => lang.isActive).map((language) => (
                                    <button
                                        key={language.id}
                                        onClick={() => handleLanguageChange(language)}
                                        className={`${styles.languageOption} ${currentLanguage?.code === language.code ? styles.active : ''}`}
                                    >
                                        <ReactCountryFlag
                                            countryCode={language.flag}
                                            svg
                                            style={{ width: '1em', height: '1em' }}
                                        />
                                        <span>{language.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className={styles.mobileToggle}
                        onClick={toggleMobileMenu}
                        aria-label="Toggle mobile menu"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.open : ''}`}>
                    <ul className={styles.mobileNavList}>
                        {rootPages.map(renderMobileMenuItem)}

                        {/* Mobile Language Section */}
                        <li className={styles.mobileLanguageSection}>
                            <div className={styles.mobileLanguageTitle}>
                                <Globe size={16} />
                                <span>Dil Seçin</span>
                            </div>
                            <div className={styles.mobileLanguageList}>
                                {languages.filter(lang => lang.isActive).map((language) => (
                                    <button
                                        key={language.id}
                                        onClick={() => handleLanguageChange(language)}
                                        className={`${styles.mobileLanguageOption} ${currentLanguage?.code === language.code ? styles.active : ''}`}
                                    >
                                        <ReactCountryFlag
                                            countryCode={language.flag}
                                            svg
                                            style={{ width: '1em', height: '1em' }}
                                        />
                                        <span>{language.name}</span>
                                    </button>
                                ))}
                            </div>
                        </li>
                    </ul>
                </div>
            </nav>

            {/* Mobile Overlay */}
            <div
                className={`${styles.mobileOverlay} ${isMobileMenuOpen ? styles.open : ''}`}
                onClick={closeMobileMenu}
            />
        </>
    )
} 