import { prisma } from "@/lib/prisma"

export interface DesignData {
    // Font Settings
    titleFontSize?: string
    titleFontWeight?: string
    titlePadding?: string
    paragraphFontSize?: string
    paragraphFontWeight?: string
    paragraphLineHeight?: string
    buttonFontSize?: string
    buttonFontWeight?: string
    buttonWidth?: string
    imageRadius?: string
    menuFont?: string
    titleFont?: string
    paragraphFont?: string

    // Color Settings
    siteBackgroundColor?: string
    titleColor?: string
    paragraphColor?: string
    hoverColor?: string
    menuBackgroundColor?: string
    menuTextColor?: string
    footerBackgroundColor?: string
    footerTextColor?: string

    // Custom CSS/JS
    customCss?: string
    customJs?: string
}

export interface LogoData {
    logo?: string | null
    footerLogo?: string | null
    favicon?: string | null
    placeholder?: string | null
}

export async function getLogoData(): Promise<LogoData> {
    try {
        // @ts-ignore - Prisma client henüz generate edilmedi
        const logos = await prisma.globalLogos.findFirst()
        return {
            logo: logos?.logo || null,
            footerLogo: logos?.footerLogo || null,
            favicon: logos?.favicon || null,
            placeholder: logos?.placeholder || null,
        }
    } catch (error) {
        console.error('Error fetching logo data:', error)
        return {
            logo: null,
            footerLogo: null,
            favicon: null,
            placeholder: null,
        }
    }
}

export async function getDesignData(): Promise<DesignData | null> {
    try {
        const design = await prisma.globalDesign.findFirst()

        if (!design) {
            return null
        }

        return {
            // Font Settings
            titleFontSize: design.titleFontSize || undefined,
            titleFontWeight: design.titleFontWeight || undefined,
            titlePadding: design.titlePadding || undefined,
            paragraphFontSize: design.paragraphFontSize || undefined,
            paragraphFontWeight: design.paragraphFontWeight || undefined,
            paragraphLineHeight: design.paragraphLineHeight || undefined,
            buttonFontSize: design.buttonFontSize || undefined,
            buttonFontWeight: design.buttonFontWeight || undefined,
            buttonWidth: design.buttonWidth || undefined,
            imageRadius: design.imageRadius || undefined,
            menuFont: design.menuFont || undefined,
            titleFont: design.titleFont || undefined,
            paragraphFont: design.paragraphFont || undefined,

            // Color Settings
            siteBackgroundColor: design.siteBackgroundColor || undefined,
            titleColor: design.titleColor || undefined,
            paragraphColor: design.paragraphColor || undefined,
            hoverColor: design.hoverColor || undefined,
            menuBackgroundColor: design.menuBackgroundColor || undefined,
            menuTextColor: design.menuTextColor || undefined,
            footerBackgroundColor: design.footerBackgroundColor || undefined,
            footerTextColor: design.footerTextColor || undefined,

            // Custom CSS/JS
            customCss: design.customCss || undefined,
            customJs: design.customJs || undefined,
        }
    } catch (error) {
        console.error('Error fetching design data:', error)
        return null
    }
} 