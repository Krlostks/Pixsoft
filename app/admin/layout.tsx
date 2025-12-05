"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  BarChart3Icon, 
  ShoppingBagIcon, 
  PackageIcon, 
  UsersIcon, 
  CalendarIcon,
  SettingsIcon,
  MenuIcon,
  XIcon,
  LogOutIcon,
  HomeIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const navItems = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: BarChart3Icon,
  },
  {
    href: "/admin/ventas",
    label: "Ventas",
    icon: ShoppingBagIcon,
  },
  {
    href: "/admin/inventario",
    label: "Inventario",
    icon: PackageIcon,
  },
  {
    href: "/admin/usuarios",
    label: "Usuarios",
    icon: UsersIcon,
  },
  {
    href: "/admin/arrendamientos",
    label: "Arrendamientos",
    icon: CalendarIcon,
  },
  {
    href: "/admin/configuracion",
    label: "Configuración",
    icon: SettingsIcon,
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar para desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto glass border-r border-border/30 px-6 py-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Admin</h1>
              <p className="text-xs text-muted-foreground">Panel de Control</p>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Navegación */}
          <nav className="flex flex-1 flex-col">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== "/admin" && pathname?.startsWith(item.href))
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-300",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                          : "text-foreground hover:bg-secondary/50 hover:shadow-md"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>

            <div className="mt-auto pt-8">
              <Separator className="mb-6" />
              
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-foreground hover:bg-secondary/50 transition-all duration-300 mb-3"
              >
                <HomeIcon className="w-5 h-5" />
                <span className="font-medium">Volver al Sitio</span>
              </Link>

              <Button
                variant="outline"
                className="w-full justify-start gap-3 rounded-2xl hover:bg-red-50 hover:text-red-600 border-red-200"
              >
                <LogOutIcon className="w-5 h-5" />
                <span>Cerrar Sesión</span>
              </Button>
            </div>
          </nav>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto glass px-6 py-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Admin</h1>
                  <p className="text-xs text-muted-foreground">Panel de Control</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="rounded-xl"
              >
                <XIcon className="w-5 h-5" />
              </Button>
            </div>

            <Separator className="my-4" />

            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== "/admin" && pathname?.startsWith(item.href))
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-300 mb-2",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "text-foreground hover:bg-secondary/50 hover:shadow-md"
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="mt-8 pt-8 border-t border-border/30">
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-foreground hover:bg-secondary/50 transition-all duration-300 mb-3"
                onClick={() => setSidebarOpen(false)}
              >
                <HomeIcon className="w-5 h-5" />
                <span className="font-medium">Volver al Sitio</span>
              </Link>

              <Button
                variant="outline"
                className="w-full justify-start gap-3 rounded-2xl hover:bg-red-50 hover:text-red-600 border-red-200"
              >
                <LogOutIcon className="w-5 h-5" />
                <span>Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-40 glass border-b border-border/30">
          <div className="flex h-16 items-center gap-x-4 px-4 sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden rounded-xl"
            >
              <MenuIcon className="w-5 h-5" />
            </Button>

            <div className="flex flex-1 items-center justify-end gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground">Administrador</p>
              </div>
              
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold">A</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="py-8">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}