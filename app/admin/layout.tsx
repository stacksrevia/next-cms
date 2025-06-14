import type { Metadata } from "next"
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
    return <AdminLayoutClient>{children}</AdminLayoutClient>
} 