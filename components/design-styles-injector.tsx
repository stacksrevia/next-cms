import { DesignData, LogoData } from "@/lib/design-utils"

interface DesignStylesInjectorProps {
    designData: DesignData | null
    logoData?: LogoData
}

export function DesignStylesInjector({ designData, logoData }: DesignStylesInjectorProps) {
    if (!designData) return null

    // CSS değişkenlerini oluştur
    const cssVariables: Record<string, string> = {}

    // Font Settings
    if (designData.titleFontSize) cssVariables['--vira-title-font-size'] = designData.titleFontSize
    if (designData.titleFontWeight) cssVariables['--vira-title-font-weight'] = designData.titleFontWeight
    if (designData.titlePadding) cssVariables['--vira-title-padding'] = designData.titlePadding

    if (designData.paragraphFontSize) cssVariables['--vira-paragraph-font-size'] = designData.paragraphFontSize
    if (designData.paragraphFontWeight) cssVariables['--vira-paragraph-font-weight'] = designData.paragraphFontWeight
    if (designData.paragraphLineHeight) cssVariables['--vira-paragraph-line-height'] = designData.paragraphLineHeight

    if (designData.buttonFontSize) cssVariables['--vira-button-font-size'] = designData.buttonFontSize
    if (designData.buttonFontWeight) cssVariables['--vira-button-font-weight'] = designData.buttonFontWeight
    if (designData.buttonWidth) cssVariables['--vira-button-width'] = designData.buttonWidth

    if (designData.imageRadius) cssVariables['--vira-image-radius'] = designData.imageRadius

    if (designData.menuFont && designData.menuFont !== 'default') cssVariables['--vira-menu-font'] = designData.menuFont
    if (designData.titleFont && designData.titleFont !== 'default') cssVariables['--vira-title-font'] = designData.titleFont
    if (designData.paragraphFont && designData.paragraphFont !== 'default') cssVariables['--vira-paragraph-font'] = designData.paragraphFont

    // Color Settings
    if (designData.siteBackgroundColor) cssVariables['--vira-site-main-color'] = designData.siteBackgroundColor
    if (designData.titleColor) cssVariables['--vira-title-color'] = designData.titleColor
    if (designData.paragraphColor) cssVariables['--vira-paragraph-color'] = designData.paragraphColor
    if (designData.hoverColor) cssVariables['--vira-hover-color'] = designData.hoverColor

    if (designData.menuBackgroundColor) cssVariables['--vira-menu-background-color'] = designData.menuBackgroundColor
    if (designData.menuTextColor) cssVariables['--vira-menu-text-color'] = designData.menuTextColor

    if (designData.footerBackgroundColor) cssVariables['--vira-footer-background-color'] = designData.footerBackgroundColor
    if (designData.footerTextColor) cssVariables['--vira-footer-text-color'] = designData.footerTextColor

    // CSS string oluştur
    const rootStyles = Object.entries(cssVariables)
        .map(([key, value]) => `${key}: ${value};`)
        .join(' ')

    const customCSS = designData.customCss || ''
    const customJS = designData.customJs || ''

    return (
        <>
            {/* Favicon */}
            {logoData?.favicon && (
                <>
                    <link rel="icon" type="image/x-icon" href={logoData.favicon} />
                    <link rel="shortcut icon" href={logoData.favicon} />
                    <link rel="apple-touch-icon" href={logoData.favicon} />
                    <link rel="icon" type="image/png" sizes="32x32" href={logoData.favicon} />
                </>
            )}

            {/* Root CSS Variables */}
            <style
                dangerouslySetInnerHTML={{
                    __html: `:root { ${rootStyles} }`
                }}
            />

            {/* Custom CSS */}
            {customCSS && (
                <style
                    dangerouslySetInnerHTML={{
                        __html: customCSS
                    }}
                />
            )}

            {/* Custom JS */}
            {customJS && (
                <script
                    dangerouslySetInnerHTML={{
                        __html: customJS
                    }}
                />
            )}
        </>
    )
} 