"use client"

import { useState } from "react"
import { useTheme } from "@/hooks/use-theme"
import {
  SunIcon,
  MoonIcon,
  SearchIcon,
  HeartIcon,
  ShoppingCartIcon,
  UserIcon,
  MenuIcon,
  ChevronDownIcon,
  XMarkIcon,
} from "./icons"

const categories = [
  { name: "Promociones", href: "#" },
  { name: "Cómputo (Hardware)", href: "#" },
  { name: "Computadoras", href: "#" },
  { name: "Audio y Video", href: "#" },
  { name: "Impresión y Copiado", href: "#" },
  { name: "Energía", href: "#" },
  { name: "Celulares y Telefonía", href: "#" },
  { name: "Apple", href: "#" },
  { name: "Gaming", href: "#" },
  { name: "Seguridad y Vigilancia", href: "#" },
  { name: "Hogar", href: "#" },
  { name: "Home Office", href: "#" },
  { name: "Software y Servicios", href: "#" },
]

export function Header() {
  const { isDark, toggleTheme, mounted } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [cartCount] = useState(3)

  return (
    <header className="sticky top-0 z-50">
      {/* Promo Banner */}
      <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 dark:from-slate-700 dark:to-slate-800 text-white py-2 px-4 text-center text-sm">
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
              <a href="#" className="flex items-center gap-2 group">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 dark:from-cyan-500 dark:to-slate-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-500 dark:from-cyan-400 dark:to-slate-300 bg-clip-text text-transparent">
                  PixSoft
                </span>
              </a>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full group">
                <input
                  type="text"
                  placeholder="¿Qué producto buscas hoy?"
                  className="w-full h-12 pl-5 pr-14 rounded-2xl bg-secondary/50 dark:bg-secondary/30 border border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 text-foreground placeholder:text-muted-foreground"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-xl bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105">
                  <SearchIcon className="w-5 h-5 text-primary-foreground" />
                </button>
              </div>
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

              {/* Favorites */}
              <a
                href="#"
                className="hidden sm:flex p-2.5 rounded-xl hover:bg-secondary/80 transition-all duration-300 group"
              >
                <HeartIcon className="w-5 h-5 text-foreground group-hover:text-rose-500 transition-colors duration-300" />
              </a>

              {/* Cart */}
              <a href="#" className="relative p-2.5 rounded-xl hover:bg-secondary/80 transition-all duration-300 group">
                <ShoppingCartIcon className="w-5 h-5 text-foreground group-hover:text-primary transition-colors duration-300" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 flex items-center justify-center text-[10px] font-bold bg-primary text-primary-foreground rounded-full animate-pulse">
                    {cartCount}
                  </span>
                )}
              </a>

              {/* User */}
              <a
                href="#"
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-secondary/80 transition-all duration-300 group"
              >
                <UserIcon className="w-5 h-5 text-foreground group-hover:text-primary transition-colors duration-300" />
                <span className="hidden lg:block text-sm font-medium text-foreground">Ingresar</span>
              </a>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Buscar productos..."
                className="w-full h-11 pl-4 pr-12 rounded-xl bg-secondary/50 dark:bg-secondary/30 border border-border/50 focus:border-primary outline-none transition-all duration-300 text-foreground text-sm"
              />
              <button className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg bg-primary">
                <SearchIcon className="w-4 h-4 text-primary-foreground" />
              </button>
            </div>
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
                  <div className="absolute top-full left-0 mt-2 w-64 glass rounded-2xl shadow-xl py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {categories.map((category) => (
                      <a
                        key={category.name}
                        href={category.href}
                        className="flex items-center px-4 py-2.5 text-sm text-foreground hover:bg-secondary/50 hover:text-primary transition-all duration-200"
                      >
                        {category.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Nav Links */}
              {["Ofertas", "Lo Más Vendido", "Configurador PC", "Centro de Ayuda"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-secondary/50 hover:text-primary transition-all duration-300"
                >
                  {item}
                </a>
              ))}

              <div className="ml-auto flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">
                  Total: <span className="font-semibold text-foreground">$0.00</span>
                </span>
              </div>
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
                <a
                  key={category.name}
                  href={category.href}
                  className="flex items-center px-4 py-3 text-foreground hover:bg-secondary/50 hover:text-primary transition-all duration-200"
                >
                  {category.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
