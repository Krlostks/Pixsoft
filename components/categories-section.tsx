"use client"

import { useEffect, useMemo, useState } from "react"
import axios from "axios"

interface Category {
  nombre: string
  imagen_url: string
  descripcion: string
  activa: number
  count: number
}

const GRADIENTS = [
  "from-violet-500/20 via-fuchsia-500/10 to-amber-500/30",
  "from-cyan-500/20 via-sky-500/10 to-blue-500/30",
  "from-emerald-500/20 via-teal-500/10 to-lime-500/30",
  "from-rose-500/20 via-pink-500/10 to-orange-500/30",
  "from-indigo-500/20 via-slate-500/10 to-purple-500/30",
  "from-amber-500/20 via-orange-500/10 to-red-500/30",
]

const getRandomGradient = () => {
  const index = Math.floor(Math.random() * GRADIENTS.length)
  return GRADIENTS[index]
}

export function CategoriesSection() {
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

  const categoriesWithGradient = useMemo(
    () =>
      categories.map((category) => ({
        ...category,
        gradient: getRandomGradient(),
      })),
    [categories]
  )

  if (isLoading) {
    return (
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div className="animate-pulse space-y-2">
              <div className="h-7 w-48 bg-muted rounded" />
              <div className="h-4 w-64 bg-muted rounded" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="aspect-square rounded-3xl bg-muted animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!categories.length) return null

  return (
    <section className="py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
              Categorías <span className="text-primary">destacadas</span>
            </h2>
            <p className="text-muted-foreground mt-1">
              Explora nuestras categorías más populares
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
          {categoriesWithGradient.map((category) => (
            <a
              key={category.nombre}
              href="#"
              className="group relative overflow-hidden rounded-3xl aspect-square bg-card border border-border/60 hover:shadow-2xl transition-all duration-500 hover:scale-105"
            >
              {/* Background Gradient */}
              <div
                className={`
                  absolute inset-0 
                  bg-gradient-to-br
                  ${category.gradient}
                  opacity-0 group-hover:opacity-100 
                  transition-opacity duration-500
                `}
              />

              {/* Image */}
              <div className="absolute inset-0 p-4 flex items-center justify-center">
                <img
                  src={category.imagen_url || "/placeholder.svg"}
                  alt={category.nombre}
                  className="w-full h-full object-contain transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
                  loading="lazy"
                />
              </div>

              {/* Overlay Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <h3 className="text-white font-semibold text-sm lg:text-base line-clamp-1">
                  {category.nombre}
                </h3>
                <span className="text-white/80 text-xs">
                  {category.count} productos
                </span>
              </div>

              {/* Default Label */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background/95 to-background/60 group-hover:opacity-0 transition-opacity duration-300">
                <h3 className="text-foreground font-medium text-sm text-center truncate">
                  {category.nombre}
                </h3>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
