"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Users,
    Settings,
    Shield,
    LogOut,
    Home,
    FileText,
    BarChart3,
    Globe
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

const menuItems = [
    {
        title: "Dashboard",
        icon: LayoutDashboard,
        href: "/admin/dashboard",
    },
    {
        title: "Sayfa Yönetimi",
        icon: FileText,
        href: "/admin/pages",
    },
    {
        title: "Dil Yönetimi",
        icon: Globe,
        href: "/admin/languages",
    },
    {
        title: "Kullanıcılar",
        icon: Users,
        href: "/admin/users",
    },
    {
        title: "İçerik",
        icon: FileText,
        href: "/admin/content",
    },
    {
        title: "Raporlar",
        icon: BarChart3,
        href: "/admin/reports",
    },
    {
        title: "Ayarlar",
        icon: Settings,
        href: "/admin/settings",
    },
]

export function AdminSidebar() {
    const { data: session } = useSession()
    const router = useRouter()
    const pathname = usePathname()

    const handleSignOut = async () => {
        await signOut({ callbackUrl: "/admin" })
    }

    const handleNavigation = (href: string) => {
        router.push(href)
    }

    return (
        <Sidebar>
            <SidebarHeader>
                <div className="flex items-center space-x-3 px-4 py-2">
                    <div className="p-2 bg-primary rounded-lg">
                        <Shield className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">Admin Panel</h2>
                        <p className="text-sm text-muted-foreground">Yönetim Paneli</p>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menü</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton
                                        onClick={() => handleNavigation(item.href)}
                                        isActive={pathname === item.href}
                                    >
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton onClick={() => router.push("/")}>
                                    <Home />
                                    <span>Ana Sayfa</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <div className="p-4 space-y-4">
                    {/* Theme Toggle */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Tema</span>
                        <ThemeToggle />
                    </div>

                    <Separator />

                    {/* User Info */}
                    {session?.user && (
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-secondary rounded-full">
                                    <Users className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                        {session.user.name || "Admin"}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {session.user.email}
                                    </p>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                    {session.user.role}
                                </Badge>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSignOut}
                                className="w-full"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Çıkış Yap
                            </Button>
                        </div>
                    )}
                </div>
            </SidebarFooter>
        </Sidebar>
    )
} 