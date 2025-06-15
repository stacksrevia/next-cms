'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronDown, Menu, X } from "lucide-react"
import styles from "@/styles/vira-navbar.module.css"

interface NavPage {
  id: string
  title: string
  slug: string
  parentId: string | null
  order: number
  children?: NavPage[]
}

interface ViraNavbarProps {
  pages: NavPage[]
}

export function ViraNavbar({ pages }: ViraNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set())
  const [isScrolled, setIsScrolled] = useState(false)

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

    // Cleanup function
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

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

  // Sayfa URL'ini belirle - ana seviyede order 0 olan sayfa "/" olur
  const getPageUrl = (page: NavPage) => {
    // Ana seviye sayfa ve order'ı 0 ise anasayfa
    if (!page.parentId && page.order === 0) {
      return '/'
    }
    return `/${page.slug}`
  }

  // Sayfa hiyerarşisini oluştur
  const buildPageHierarchy = (pages: NavPage[]): NavPage[] => {
    const pageMap = new Map<string, NavPage>()
    const rootPages: NavPage[] = []

    // Tüm sayfaları map'e ekle
    pages.forEach(page => {
      pageMap.set(page.id, { ...page, children: [] })
    })

    // Parent-child ilişkilerini kur
    pages.forEach(page => {
      const pageWithChildren = pageMap.get(page.id)!
      if (page.parentId && pageMap.has(page.parentId)) {
        const parent = pageMap.get(page.parentId)!
        if (!parent.children) parent.children = []
        parent.children.push(pageWithChildren)
      } else {
        rootPages.push(pageWithChildren)
      }
    })

    // Sırala
    const sortPages = (pages: NavPage[]) => {
      pages.sort((a, b) => a.order - b.order)
      pages.forEach(page => {
        if (page.children && page.children.length > 0) {
          sortPages(page.children)
        }
      })
    }

    sortPages(rootPages)
    return rootPages
  }

  const hierarchicalPages = buildPageHierarchy(pages)

  const renderDesktopMenuItem = (page: NavPage) => {
    const hasChildren = page.children && page.children.length > 0
    const isDropdownOpen = openDropdowns.has(page.id)

    if (hasChildren) {
      return (
        <li
          key={page.id}
          className={`${styles.viraNavbarItem} ${styles.viraNavbarDropdown}`}
          onMouseEnter={() => setOpenDropdowns(new Set([page.id]))}
          onMouseLeave={() => setOpenDropdowns(new Set())}
        >
          <div className={styles.viraNavbarDropdownContainer}>
            <Link
              href={getPageUrl(page)}
              className={`${styles.viraNavbarLink} ${styles.viraNavbarMainLink}`}
            >
              <span>{page.title}</span>
            </Link>
            <button
              className={`${styles.viraNavbarDropdownToggle}`}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              <ChevronDown size={16} className={`${styles.viraNavbarChevron} ${isDropdownOpen ? styles.viraNavbarChevronOpen : ''}`} />
            </button>
          </div>

          <div className={`${styles.viraNavbarDropdownMenu} ${isDropdownOpen ? styles.viraNavbarDropdownMenuOpen : ''}`}>
            {page.children?.map((child) => (
              <Link
                key={child.id}
                href={getPageUrl(child)}
                className={styles.viraNavbarDropdownLink}
              >
                {child.title}
              </Link>
            ))}
          </div>
        </li>
      )
    }

    return (
      <li key={page.id} className={styles.viraNavbarItem}>
        <Link
          href={getPageUrl(page)}
          className={styles.viraNavbarLink}
        >
          <span>{page.title}</span>
        </Link>
      </li>
    )
  }

  const renderMobileMenuItem = (page: NavPage) => {
    const hasChildren = page.children && page.children.length > 0
    const isDropdownOpen = openDropdowns.has(page.id)

    if (hasChildren) {
      return (
        <div key={page.id} className={styles.viraNavbarMobileDropdown}>
          <div className={styles.viraNavbarMobileParentContainer}>
            <Link
              href={getPageUrl(page)}
              className={styles.viraNavbarMobileLink}
              onClick={closeMobileMenu}
            >
              <span>{page.title}</span>
            </Link>
            <button
              className={styles.viraNavbarMobileDropdownToggle}
              onClick={() => toggleDropdown(page.id)}
            >
              <ChevronDown size={16} className={`${styles.viraNavbarChevron} ${isDropdownOpen ? styles.viraNavbarChevronOpen : ''}`} />
            </button>
          </div>
          {isDropdownOpen && (
            <div className={styles.viraNavbarMobileSubMenu}>
              {page.children?.map((child) => (
                <Link
                  key={child.id}
                  href={getPageUrl(child)}
                  className={styles.viraNavbarMobileSubLink}
                  onClick={closeMobileMenu}
                >
                  {child.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link
        key={page.id}
        href={getPageUrl(page)}
        className={styles.viraNavbarMobileLink}
        onClick={closeMobileMenu}
      >
        <span>{page.title}</span>
      </Link>
    )
  }

  return (
    <nav className={`${styles.viraNavbar} ${isScrolled ? styles.viraNavbarScrolled : ''}`}>
      <div className={styles.viraNavbarContainer}>
        {/* Logo */}
        <div className={styles.viraNavbarLogo}>
          <Link href="/" className={styles.viraNavbarLogoLink}>
            <div className={styles.viraNavbarLogoIcon}>
              <div className={styles.viraNavbarLogoSymbol}>V</div>
            </div>
            <span className={styles.viraNavbarLogoText}>VIRA CMS</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className={styles.viraNavbarMenu}>
          <ul className={styles.viraNavbarList}>
            {hierarchicalPages.map(page => renderDesktopMenuItem(page))}
          </ul>
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`${styles.viraNavbarMobileToggle} ${isMobileMenuOpen ? styles.viraNavbarMobileToggleActive : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Menüyü aç/kapat"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`${styles.viraNavbarMobileMenu} ${isMobileMenuOpen ? styles.viraNavbarMobileMenuOpen : ''}`}>
        <div className={styles.viraNavbarMobileList}>
          {hierarchicalPages.map(page => renderMobileMenuItem(page))}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className={styles.viraNavbarOverlay}
          onClick={closeMobileMenu}
        />
      )}
    </nav>
  )
} 