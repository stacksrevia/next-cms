import type { Metadata } from "next"
import { AdminLayoutClient } from "@/components/admin/admin-layout-client"
import { AdminThemeProvider } from "@/components/admin/admin-theme-provider"
import { DesignStylesInjector } from "@/components/design-styles-injector"
import { getLogoData, getDesignData } from "@/lib/design-utils"

export const metadata: Metadata = {
    title: "Admin Panel",
    description: "Admin panel for managing the application",
}

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [logoData, designData] = await Promise.all([
        getLogoData(),
        getDesignData()
    ])

    return (
        <AdminThemeProvider>
            <DesignStylesInjector designData={designData} logoData={logoData} />
            <AdminLayoutClient>{children}</AdminLayoutClient>
        </AdminThemeProvider>
    )
} 
