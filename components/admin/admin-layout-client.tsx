"use client"

import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "./admin-sidebar"

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const pathname = usePathname()

    console.log("AdminLayoutClient - pathname:", pathname, "session:", session, "status:", status)

    useEffect(() => {
        if (status === "loading") return

        // If on login page, don't redirect
        if (pathname === "/admin") {
            console.log("On login page, not redirecting")
            return
        }

        // If not logged in, redirect to admin login
        if (!session) {
            console.log("No session, redirecting to /admin")
            router.push("/admin")
            return
        }

        // If not admin, redirect to home
        if (session.user.role !== "ADMIN") {
            console.log("Not admin, redirecting to /")
            router.push("/")
            return
        }
    }, [session, status, router, pathname])

    // Show loading while checking session
    if (status === "loading") {
        console.log("Status loading, showing spinner")
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    // If on login page, always show children (login form)
    if (pathname === "/admin") {
        console.log("On login page, showing children")
        return <div className="min-h-screen bg-background">{children}</div>
    }

    // For other admin pages, check authentication
    if (!session || session.user.role !== "ADMIN") {
        console.log("Not authenticated or not admin")
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <p className="text-muted-foreground">Yetkiniz bulunmamaktadır...</p>
                </div>
            </div>
        )
    }

    // Show sidebar layout for authenticated admin users
    console.log("Showing sidebar layout")
    return (
        <SidebarProvider>
            <AdminSidebar />
            <main className="flex-1">
                <div className="flex items-center border-b px-4 py-2">
                    <SidebarTrigger />
                </div>
                {children}
            </main>
        </SidebarProvider>
    )
} 