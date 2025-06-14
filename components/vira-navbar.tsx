import { prisma } from "@/lib/prisma"
import Link from "next/link"
import styles from "@/styles/vira-navbar.module.css"

interface NavPage {
  id: string
  title: string
  slug: string
}

async function getNavPages() {
  try {
    const pages = await prisma.page.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        slug: true
      },
      orderBy: { createdAt: 'asc' }
    })
    return pages
  } catch (error) {
    console.error("Error fetching nav pages:", error)
    return []
  }
}

export async function ViraNavbar() {
  const pages = await getNavPages()

  return (
    <>
      <nav className={styles.viraNavbar}>
        <div className={styles.viraNavbarContainer}>
          {/* Logo */}
          <div className={styles.viraNavbarLogo}>
            <Link href="/" className={styles.viraNavbarLogoLink}>
              <span className={styles.viraNavbarLogoText}>VIRA CMS</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className={styles.viraNavbarMobileToggle} id="vira-mobile-toggle">
            <span className={styles.viraNavbarHamburger}></span>
            <span className={styles.viraNavbarHamburger}></span>
            <span className={styles.viraNavbarHamburger}></span>
          </button>

          {/* Navigation Links */}
          <div className={styles.viraNavbarMenu} id="vira-navbar-menu">
            <ul className={styles.viraNavbarList}>
              {pages.map((page) => (
                <li key={page.id} className={styles.viraNavbarItem}>
                  <Link
                    href={page.slug === 'anasayfa' ? '/' : `/${page.slug}`}
                    className={styles.viraNavbarLink}
                  >
                    {page.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('DOMContentLoaded', function() {
              const toggle = document.getElementById('vira-mobile-toggle');
              const menu = document.getElementById('vira-navbar-menu');
              
              if (toggle && menu) {
                toggle.addEventListener('click', function() {
                  menu.classList.toggle('${styles.viraNavbarMenuActive}');
                  toggle.classList.toggle('${styles.viraNavbarMobileToggleActive}');
                });
              }
            });
          `
        }}
      />
    </>
  )
} 