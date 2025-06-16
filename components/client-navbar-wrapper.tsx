'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from 'next/navigation'
import { ChevronDown, Menu, X, Globe, Loader2 } from "lucide-react"
import ReactCountryFlag from 'react-country-flag'
import styles from "@/styles/vira-navbar.module.css"
import { DesignData } from '@/lib/design-utils'

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

interface ClientNavbarWrapperProps {
    pages: NavPage[]
    currentLanguage: Language | null
    logo: string | null
    designData: DesignData | null
}

export function ClientNavbarWrapper({ pages, currentLanguage, logo, designData }: ClientNavbarWrapperProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set())
    const [isScrolled, setIsScrolled] = useState(false)
    const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false)
    const [languages, setLanguages] = useState<Language[]>([])
    const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout | null>(null)
    const [pageDropdownTimeouts, setPageDropdownTimeouts] = useState<Map<string, NodeJS.Timeout>>(new Map())
    const [isChangingLanguage, setIsChangingLanguage] = useState(false)

    // Site ana rengini al
    const siteMainColor = designData?.siteBackgroundColor || '#007bff'

    // Dilleri getir
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

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Mobil menü açıkken body scroll'unu engelle
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

    // Dropdown'ı kapatmak için document click listener
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element
            if (!target.closest('.viraNavbarLanguageDropdown')) {
                setLanguageDropdownOpen(false)
            }
        }

        if (languageDropdownOpen) {
            document.addEventListener('click', handleClickOutside)
        }

        return () => {
            document.removeEventListener('click', handleClickOutside)
        }
    }, [languageDropdownOpen])

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (dropdownTimeout) {
                clearTimeout(dropdownTimeout)
            }
            // Page dropdown timeout'larını temizle
            pageDropdownTimeouts.forEach(timeout => clearTimeout(timeout))
        }
    }, [dropdownTimeout, pageDropdownTimeouts])

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen)
    }

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false)
        setOpenDropdowns(new Set())
    }

    const toggleDropdown = (pageId: string) => {
        const newOpenDropdowns = new Set(openDropdowns)
        if (newOpenDropdowns.has(pageId)) {
            newOpenDropdowns.delete(pageId)
        } else {
            newOpenDropdowns.add(pageId)
        }
        setOpenDropdowns(newOpenDropdowns)
    }

    const handleLanguageChange = async (language: Language) => {
        if (!language || !currentLanguage || language.code === currentLanguage.code) return

        setLanguageDropdownOpen(false)
        setIsChangingLanguage(true)

        // Mevcut path'i al
        const currentPath = pathname
        const segments = currentPath.split('/').filter(Boolean)

        // Dil kodunu çıkar
        let currentLangCode = currentLanguage.code
        let slug = null

        if (segments.length > 0 && languages.some(lang => lang.code === segments[0])) {
            currentLangCode = segments[0]
            if (segments.length > 1) {
                slug = segments[1] // İkinci segment slug
            }
        } else if (segments.length > 0) {
            slug = segments[0] // İlk segment slug (dil kodu yoksa)
        }

        // Eğer slug varsa, hedef dildeki karşılığını bul
        if (slug) {
            try {
                const response = await fetch(`/api/pages/translate-slug?slug=${slug}&from=${currentLangCode}&to=${language.code}`)

                if (response.ok) {
                    const data = await response.json()

                    if (data.redirectToHome) {
                        // Hedef dilde sayfa yoksa ana sayfaya yönlendir
                        router.push(`/${language.code}`)
                        setIsChangingLanguage(false)
                        return
                    } else if (data.slug) {
                        // Hedef dildeki slug'a yönlendir
                        router.push(`/${language.code}/${data.slug}`)
                        setIsChangingLanguage(false)
                        return
                    }
                }
            } catch (error) {
                console.error('Error translating slug:', error)
                setIsChangingLanguage(false)
            }
        }

        // Fallback: Ana sayfaya yönlendir
        router.push(`/${language.code}`)
        setIsChangingLanguage(false)
    }

    const getPageUrl = (page: NavPage) => {
        // Ana sayfa kontrolü - parentId null ve order 0 ise ana sayfa
        if (!page.parentId && page.order === 0) {
            return `/${currentLanguage?.code || 'tr'}`
        }
        return `/${currentLanguage?.code || 'tr'}/${page.slug}`
    }

    const isActivePage = (page: NavPage) => {
        // Ana sayfa kontrolü - parentId null ve order 0 ise ana sayfa
        if (!page.parentId && page.order === 0) {
            return pathname === `/${currentLanguage?.code || 'tr'}` || pathname === `/${currentLanguage?.code || 'tr'}/`
        }

        const expectedPath = `/${currentLanguage?.code || 'tr'}/${page.slug}`
        return pathname === expectedPath
    }

    // Root level pages (parentId null)
    const rootPages = pages.filter(page => !page.parentId)

    const renderDesktopMenuItem = (page: NavPage) => {
        const hasChildren = page.children && page.children.length > 0
        const isActive = isActivePage(page)

        if (hasChildren) {
            return (
                <li
                    key={page.id}
                    className={`${styles.viraNavbarItem} ${styles.viraNavbarDropdown}`}
                    onMouseEnter={() => handlePageMouseEnter(page.id)}
                    onMouseLeave={() => handlePageMouseLeave(page.id)}
                >
                    <div className={styles.viraNavbarDropdownContainer}>
                        <Link
                            href={getPageUrl(page)}
                            className={`${styles.viraNavbarMainLink} ${isActive ? styles.viraNavbarLinkActive : ''}`}
                        >
                            <span>{page.title}</span>
                        </Link>
                        <button className={styles.viraNavbarDropdownToggle}>
                            <ChevronDown className={`${styles.viraNavbarChevron} ${openDropdowns.has(page.id) ? styles.viraNavbarChevronOpen : ''}`} />
                        </button>
                    </div>
                    <ul className={`${styles.viraNavbarDropdownMenu} ${openDropdowns.has(page.id) ? styles.viraNavbarDropdownMenuOpen : ''}`}>
                        {page.children?.map((child) => (
                            <li key={child.id}>
                                <Link
                                    href={getPageUrl(child)}
                                    className={`${styles.viraNavbarDropdownLink} ${isActivePage(child) ? styles.viraNavbarDropdownLinkActive : ''}`}
                                >
                                    <span>{child.title}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </li>
            )
        }

        return (
            <li key={page.id} className={styles.viraNavbarItem}>
                <Link
                    href={getPageUrl(page)}
                    className={`${styles.viraNavbarLink} ${isActive ? styles.viraNavbarLinkActive : ''}`}
                >
                    <span>{page.title}</span>
                </Link>
            </li>
        )
    }

    const renderMobileMenuItem = (page: NavPage) => {
        const hasChildren = page.children && page.children.length > 0
        const isDropdownOpen = openDropdowns.has(page.id)
        const isActive = isActivePage(page)

        if (hasChildren) {
            return (
                <li key={page.id} className={styles.viraNavbarMobileDropdown}>
                    <div className={styles.viraNavbarMobileParentContainer}>
                        <Link
                            href={getPageUrl(page)}
                            className={`${styles.viraNavbarMobileLink} ${isActive ? styles.viraNavbarMobileLinkActive : ''}`}
                            onClick={closeMobileMenu}
                        >
                            <span>{page.title}</span>
                        </Link>
                        <button
                            onClick={() => toggleDropdown(page.id)}
                            className={styles.viraNavbarMobileDropdownToggle}
                        >
                            <ChevronDown className={`${styles.viraNavbarMobileChevron} ${isDropdownOpen ? styles.viraNavbarMobileChevronOpen : ''}`} />
                        </button>
                    </div>
                    {isDropdownOpen && (
                        <ul className={styles.viraNavbarMobileSubmenu}>
                            {page.children?.map((child) => (
                                <li key={child.id}>
                                    <Link
                                        href={getPageUrl(child)}
                                        className={`${styles.viraNavbarMobileSublink} ${isActivePage(child) ? styles.viraNavbarMobileSubLinkActive : ''}`}
                                        onClick={closeMobileMenu}
                                    >
                                        <span>{child.title}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </li>
            )
        }

        return (
            <li key={page.id} className={styles.viraNavbarMobileItem}>
                <Link
                    href={getPageUrl(page)}
                    className={`${styles.viraNavbarMobileLink} ${isActive ? styles.viraNavbarMobileLinkActive : ''}`}
                    onClick={closeMobileMenu}
                >
                    <span>{page.title}</span>
                </Link>
            </li>
        )
    }

    const handleMouseEnter = () => {
        if (dropdownTimeout) {
            clearTimeout(dropdownTimeout)
            setDropdownTimeout(null)
        }
        setLanguageDropdownOpen(true)
    }

    const handleMouseLeave = () => {
        const timeout = setTimeout(() => {
            setLanguageDropdownOpen(false)
        }, 200) // 200ms delay
        setDropdownTimeout(timeout)
    }

    const handlePageMouseEnter = (pageId: string) => {
        // Mevcut timeout'u temizle
        const existingTimeout = pageDropdownTimeouts.get(pageId)
        if (existingTimeout) {
            clearTimeout(existingTimeout)
            const newTimeouts = new Map(pageDropdownTimeouts)
            newTimeouts.delete(pageId)
            setPageDropdownTimeouts(newTimeouts)
        }

        // Dropdown'u aç (CSS hover ile de açılacak ama JavaScript state'i de güncelle)
        setOpenDropdowns(new Set([pageId]))
    }

    const handlePageMouseLeave = (pageId: string) => {
        // 200ms sonra dropdown'u kapat (CSS hover bittiğinde de kapanacak)
        const timeout = setTimeout(() => {
            setOpenDropdowns(new Set())
        }, 200)

        const newTimeouts = new Map(pageDropdownTimeouts)
        newTimeouts.set(pageId, timeout)
        setPageDropdownTimeouts(newTimeouts)
    }

    return (
        <nav
            className={`${styles.viraNavbar} ${isScrolled ? styles.viraNavbarScrolled : ''}`}
            style={{
                '--vira-site-main-color': siteMainColor,
                '--navbar-height': '70px'
            } as React.CSSProperties}
        >
            <div className={styles.viraNavbarContainer}>
                {/* Logo */}
                <div className={styles.viraNavbarLogo}>
                    <Link href={`/${currentLanguage?.code || 'tr'}`}>
                        {logo ? (
                            <img
                                src={logo}
                                alt="Logo"
                                className={styles.viraNavbarLogoImage}
                            />
                        ) : (
                            <span className={styles.viraNavbarLogoText}>VIRA</span>
                        )}
                    </Link>
                </div>

                {/* Desktop Menu */}
                <div className={styles.viraNavbarDesktop}>
                    <ul className={styles.viraNavbarMenu}>
                        {rootPages.map(renderDesktopMenuItem)}
                    </ul>

                    {/* Dil Seçici */}
                    <div className={styles.viraNavbarLanguageSelector}>
                        <div
                            className={`${styles.viraNavbarLanguageDropdown} viraNavbarLanguageDropdown`}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <button
                                className={styles.viraNavbarLanguageButton}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setLanguageDropdownOpen(!languageDropdownOpen)
                                }}
                            >
                                {currentLanguage ? (
                                    <div className={styles.viraNavbarLanguageButtonContent}>
                                        <ReactCountryFlag
                                            countryCode={currentLanguage.flag}
                                            svg
                                            style={{
                                                width: '1.2em',
                                                height: '1.2em',
                                            }}
                                        />
                                        <span>{currentLanguage.code.toUpperCase()}</span>
                                        <ChevronDown className={`${styles.viraNavbarLanguageChevron} ${languageDropdownOpen ? styles.viraNavbarLanguageChevronOpen : ''}`} />
                                    </div>
                                ) : (
                                    <div className={styles.viraNavbarLanguageButtonContent}>
                                        <Globe size={16} />
                                        <span>Dil</span>
                                        <ChevronDown className={`${styles.viraNavbarLanguageChevron} ${languageDropdownOpen ? styles.viraNavbarLanguageChevronOpen : ''}`} />
                                    </div>
                                )}
                            </button>

                            {languageDropdownOpen && (
                                <ul className={styles.viraNavbarLanguageMenu}>
                                    {languages.filter(lang => lang.isActive).map((language) => (
                                        <li key={language.id}>
                                            <button
                                                onClick={() => handleLanguageChange(language)}
                                                className={`${styles.viraNavbarLanguageOption} ${currentLanguage?.code === language.code ? styles.viraNavbarLanguageOptionActive : ''
                                                    }`}
                                                disabled={isChangingLanguage}
                                            >
                                                {isChangingLanguage && currentLanguage?.code !== language.code ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <ReactCountryFlag
                                                        countryCode={language.flag}
                                                        svg
                                                        style={{
                                                            width: '1em',
                                                            height: '1em',
                                                        }}
                                                    />
                                                )}
                                                <span>{language.name}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className={styles.viraNavbarMobileToggle}
                    onClick={toggleMobileMenu}
                    aria-label="Toggle mobile menu"
                    data-open={isMobileMenuOpen}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className={styles.viraNavbarOverlay}
                    onClick={closeMobileMenu}
                />
            )}

            {/* Mobile Menu */}
            <div className={`${styles.viraNavbarMobile} ${isMobileMenuOpen ? styles.viraNavbarMobileOpen : ''}`}>
                <ul className={styles.viraNavbarMobileMenu}>
                    {rootPages.map(renderMobileMenuItem)}

                    {/* Mobil Dil Seçici */}
                    <li className={styles.viraNavbarMobileLanguageItem}>
                        <div className={styles.viraNavbarMobileLanguageTitle}>
                            <Globe size={16} />
                            <span>Dil Seçin</span>
                        </div>
                        <ul className={styles.viraNavbarMobileLanguageList}>
                            {languages.filter(lang => lang.isActive).map((language) => (
                                <li key={language.id}>
                                    <button
                                        onClick={() => {
                                            handleLanguageChange(language)
                                            closeMobileMenu()
                                        }}
                                        className={`${styles.viraNavbarMobileLanguageOption} ${currentLanguage?.code === language.code ? styles.viraNavbarMobileLanguageOptionActive : ''
                                            }`}
                                        disabled={isChangingLanguage}
                                    >
                                        {isChangingLanguage && currentLanguage?.code !== language.code ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <ReactCountryFlag
                                                countryCode={language.flag}
                                                svg
                                                style={{
                                                    width: '1em',
                                                    height: '1em',
                                                }}
                                            />
                                        )}
                                        <span>{language.name}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </li>
                </ul>
            </div>
        </nav>
    )
}