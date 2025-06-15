import Link from "next/link"
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Heart } from "lucide-react"
import styles from "@/styles/vira-footer.module.css"

export function ViraFooter() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className={styles.viraFooter}>
            {/* Main Footer Content */}
            <div className={styles.viraFooterMain}>
                <div className={styles.viraFooterContainer}>
                    <div className={styles.viraFooterGrid}>
                        {/* Company Info */}
                        <div className={styles.viraFooterSection}>
                            <div className={styles.viraFooterLogo}>
                                <div className={styles.viraFooterLogoIcon}>
                                    <div className={styles.viraFooterLogoSymbol}>V</div>
                                </div>
                                <span className={styles.viraFooterLogoText}>VIRA CMS</span>
                            </div>
                            <p className={styles.viraFooterDescription}>
                                Modern web çözümleri ile işletmenizi dijital dünyada öne çıkarıyoruz.
                                Profesyonel tasarım ve güçlü teknoloji bir arada.
                            </p>
                            <div className={styles.viraFooterSocial}>
                                <a href="#" className={styles.viraFooterSocialLink} aria-label="Facebook">
                                    <Facebook size={20} />
                                </a>
                                <a href="#" className={styles.viraFooterSocialLink} aria-label="Twitter">
                                    <Twitter size={20} />
                                </a>
                                <a href="#" className={styles.viraFooterSocialLink} aria-label="Instagram">
                                    <Instagram size={20} />
                                </a>
                                <a href="#" className={styles.viraFooterSocialLink} aria-label="LinkedIn">
                                    <Linkedin size={20} />
                                </a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className={styles.viraFooterSection}>
                            <h3 className={styles.viraFooterTitle}>Hızlı Bağlantılar</h3>
                            <ul className={styles.viraFooterList}>
                                <li>
                                    <Link href="/" className={styles.viraFooterLink}>
                                        Ana Sayfa
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/hakkimizda" className={styles.viraFooterLink}>
                                        Hakkımızda
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/hizmetler" className={styles.viraFooterLink}>
                                        Hizmetler
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/projeler" className={styles.viraFooterLink}>
                                        Projeler
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/blog" className={styles.viraFooterLink}>
                                        Blog
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/iletisim" className={styles.viraFooterLink}>
                                        İletişim
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Services */}
                        <div className={styles.viraFooterSection}>
                            <h3 className={styles.viraFooterTitle}>Hizmetlerimiz</h3>
                            <ul className={styles.viraFooterList}>
                                <li>
                                    <Link href="/hizmetler/web-tasarim" className={styles.viraFooterLink}>
                                        Web Tasarım
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/hizmetler/e-ticaret" className={styles.viraFooterLink}>
                                        E-Ticaret
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/hizmetler/seo" className={styles.viraFooterLink}>
                                        SEO Hizmetleri
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/hizmetler/dijital-pazarlama" className={styles.viraFooterLink}>
                                        Dijital Pazarlama
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/hizmetler/mobil-uygulama" className={styles.viraFooterLink}>
                                        Mobil Uygulama
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/hizmetler/grafik-tasarim" className={styles.viraFooterLink}>
                                        Grafik Tasarım
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div className={styles.viraFooterSection}>
                            <h3 className={styles.viraFooterTitle}>İletişim</h3>
                            <div className={styles.viraFooterContact}>
                                <div className={styles.viraFooterContactItem}>
                                    <MapPin size={18} />
                                    <span>
                                        Atatürk Mahallesi, Teknoloji Caddesi<br />
                                        No: 123, 34000 İstanbul
                                    </span>
                                </div>
                                <div className={styles.viraFooterContactItem}>
                                    <Phone size={18} />
                                    <a href="tel:+905551234567" className={styles.viraFooterContactLink}>
                                        +90 555 123 45 67
                                    </a>
                                </div>
                                <div className={styles.viraFooterContactItem}>
                                    <Mail size={18} />
                                    <a href="mailto:info@viracms.com" className={styles.viraFooterContactLink}>
                                        info@viracms.com
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Bottom */}
            <div className={styles.viraFooterBottom}>
                <div className={styles.viraFooterContainer}>
                    <div className={styles.viraFooterBottomContent}>
                        <div className={styles.viraFooterCopyright}>
                            <p>
                                © {currentYear} VIRA CMS. Tüm hakları saklıdır.
                            </p>
                        </div>
                        <div className={styles.viraFooterLegal}>
                            <Link href="/gizlilik-politikasi" className={styles.viraFooterLegalLink}>
                                Gizlilik Politikası
                            </Link>
                            <Link href="/kullanim-kosullari" className={styles.viraFooterLegalLink}>
                                Kullanım Koşulları
                            </Link>
                            <Link href="/cerez-politikasi" className={styles.viraFooterLegalLink}>
                                Çerez Politikası
                            </Link>
                        </div>
                        <div className={styles.viraFooterMadeWith}>
                            <span>Made with</span>
                            <Heart size={16} className={styles.viraFooterHeart} />
                            <span>by VIRA Team</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
} 