"use client"

import { use, useEffect, useState } from "react"
import { useTheme } from "@/hooks/use-theme"
import {
  SunIcon,
  MoonIcon,
  SearchIcon,
  ShoppingCartIcon,
  UserIcon,
  MenuIcon,
  ChevronDownIcon,
  XMarkIcon,
} from "./icons"
import Link from "next/link"
import Cookies from "js-cookie"
import axios from "axios"
import SearchBar from "./searchBar"

interface Category {
  id: number
  nombre: string
  imagen_url: string
  descripcion: string
  activa: number
  count: number
}

export function Header() {
  const { isDark, toggleTheme, mounted } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [token, setToken] = useState<string | null>(null)
  const [isLoadingCart, setIsLoadingCart] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get<Category[]>(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/categorias`
        )
        setCategories(response.data || [])
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const fetchProfile = async () => {
    const authToken = Cookies.get("token")
    if (!authToken) return
    
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/usuarios/cuenta`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      )
      if (response.data.data) {
        setIsAdmin(response.data.data.role == 'admin')
      }
      return response.data.user
    } catch (error) {
      console.error("Error fetching profile:", error)
      return null
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  // Función para obtener el conteo del carrito
  const fetchCartCount = async (authToken: string) => {
    if (!authToken) return
    
    setIsLoadingCart(true)
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/carrito/`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      )
      
      if (response.data.success && response.data.items) {
        const totalItems = response.data.items.reduce((sum: number, item: any) => 
          sum + item.cantidad, 0
        )
        setCartCount(totalItems)
      } else {
        setCartCount(0)
      }
    } catch (error) {
      console.error("Error al obtener carrito:", error)
      setCartCount(0)
    } finally {
      setIsLoadingCart(false)
    }
  }

  // Obtener token y carrito inicial
  useEffect(() => {
    const t = Cookies.get("token")
    setToken(t || null)
    
    if (t) {
      fetchCartCount(t)
    } else {
      setCartCount(0)
    }
  }, [])

  // Escuchar eventos de actualización del carrito
  useEffect(() => {
    const handleCartUpdate = () => {
      const t = Cookies.get("token")
      if (t) {
        fetchCartCount(t)
      }
    }
    
    window.addEventListener('cartUpdated', handleCartUpdate)
    return () => window.removeEventListener('cartUpdated', handleCartUpdate)
  }, [])

  // Actualizar carrito cuando cambie el token
  useEffect(() => {
    if (token) {
      fetchCartCount(token)
    } else {
      setCartCount(0)
    }
  }, [token])

  return (
    <header className="sticky top-0 z-50 backdrop-blur-sm">
      {/* Promo Banner */}
      <div className="bg-linear-to-r from-cyan-500 to-cyan-600 dark:from-slate-700 dark:to-slate-800 text-white py-2 px-4 text-center text-sm">
        <p className="animate-pulse">
          <span className="font-semibold">Envío GRATIS</span> en compras mayores a $999 | Hasta 18 MSI
        </p>
      </div>

      {/* Main Header */}
      <div className="glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 rounded-xl hover:bg-secondary/80 transition-all duration-300"
              >
                <MenuIcon className="w-6 h-6 text-foreground" />
              </button>
              <Link href="/" className="flex items-center gap-2 group">
                <img src="./pixsoft-logo.png" className="size-20 w-fit dark:invert-100" alt="Logo Pixsoft" />
              </Link>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <SearchBar />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="relative p-2.5 rounded-xl hover:bg-secondary/80 transition-all duration-300 group overflow-hidden"
                aria-label="Cambiar tema"
              >
                <div className="relative w-5 h-5">
                  {mounted && (
                    <>
                      <SunIcon
                        className={`w-5 h-5 text-amber-500 absolute inset-0 transition-all duration-500 ${
                          isDark ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"
                        }`}
                      />
                      <MoonIcon
                        className={`w-5 h-5 text-slate-300 absolute inset-0 transition-all duration-500 ${
                          isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"
                        }`}
                      />
                    </>
                  )}
                </div>
              </button>

              {/* Cart - SOLO SE MUESTRA SI HAY TOKEN */}
              {token && (
                <Link 
                  href="/carrito" 
                  className="relative p-2.5 rounded-xl hover:bg-secondary/80 transition-all duration-300 group"
                >
                  <ShoppingCartIcon className="w-5 h-5 text-foreground group-hover:text-primary transition-colors duration-300" />
                  {cartCount > 0 && !isLoadingCart && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 flex items-center justify-center text-[10px] font-bold bg-primary text-primary-foreground rounded-full animate-pulse">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                  {isLoadingCart && token && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 flex items-center justify-center text-[10px] font-bold bg-primary/50 text-primary-foreground rounded-full">
                      ...
                    </span>
                  )}
                </Link>
              )}

              {/* User */}
              {token === null ? (
                <Link
                  href="/login"
                  className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-secondary/80 transition-all duration-300 group"
                >
                  <UserIcon className="w-5 h-5 text-foreground group-hover:text-primary transition-colors duration-300" />
                  <span className="hidden lg:block text-sm font-medium text-foreground">Ingresar</span>
                </Link>
              ) : (
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-secondary/80 transition-all duration-300">
                    <UserIcon className="w-5 h-5 text-foreground" />
                    <span className="hidden lg:block text-sm font-medium text-foreground">
                      Mi Cuenta
                    </span>
                  </button>

                  <div className="absolute right-0 mt-0 w-48 bg-card rounded-xl shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50">
                    {isAdmin && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2 hover:bg-secondary/50 rounded-t-xl"
                    >
                      Admin
                    </Link>
                    )}
                    <Link
                      href="/cuenta"
                      className="block px-4 py-2 hover:bg-secondary/50 rounded-t-xl"
                    >
                      Perfil
                    </Link>
                    <Link
                      href="/pedidos"
                      className="block px-4 py-2 hover:bg-secondary/50"
                    >
                      Mis órdenes
                    </Link>
                    <Link
                      href="/direcciones"
                      className="block px-4 py-2 hover:bg-secondary/50"
                    >
                      Direcciones
                    </Link>
                    <Link
                      href="/carrito"
                      className="block px-4 py-2 hover:bg-secondary/50"
                    >
                      Mi Carrito
                    </Link>

                    {/* Logout */}
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-red-500/10 text-red-600 rounded-b-xl"
                      onClick={() => {
                        Cookies.remove("token")
                        localStorage.removeItem("token")
                        window.location.reload()
                      }}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
              
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-4">
            <SearchBar />
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden lg:block border-t border-border/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1 py-2">
              {/* Categories Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300"
                >
                  <MenuIcon className="w-5 h-5" />
                  <span className="font-medium">Categorías</span>
                  <ChevronDownIcon
                    className={`w-4 h-4 transition-transform duration-300 ${isCategoriesOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Categories Dropdown Menu */}
                {isCategoriesOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 glass rounded-2xl shadow-xl py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                    {categories.map((category) => (
                      <Link
                        key={category.nombre}
                        href={`/productos?categoria=${category.id}`}
                        className="flex items-center px-4 py-2.5 text-sm text-foreground hover:bg-secondary/50 hover:text-primary transition-all duration-200"
                      >
                        {category.nombre}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Nav Links */}
                <Link
                  href="/productos?offer=true"
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-secondary/50 hover:text-primary transition-all duration-300"
                >
                  Ofertas
                </Link>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 glass animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between p-4 border-b border-border/30">
              <span className="text-lg font-bold text-foreground">Menú</span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-secondary/80 transition-all"
              >
                <XMarkIcon className="w-5 h-5 text-foreground" />
              </button>
            </div>
            <div className="py-2 overflow-y-auto max-h-[calc(100vh-80px)]">
              {categories.map((category) => (
                <Link
                  key={category.nombre}
                  href={`/productos?categoria=${category.id}`}
                  className="flex items-center px-4 py-3 text-foreground hover:bg-secondary/50 hover:text-primary transition-all duration-200"
                >
                  {category.nombre}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}