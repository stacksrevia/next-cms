import type { Metadata } from "next"
import { AppInitializer } from "@/components/providers/app-initializer"
import { AdminLayoutClient } from "@/components/admin/admin-layout-client"

export const metadata: Metadata = {
    title: "Admin Panel",
    description: "Admin panel for managing the application",
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <AppInitializer><AdminLayoutClient>{children}</AdminLayoutClient></AppInitializer>
} 
