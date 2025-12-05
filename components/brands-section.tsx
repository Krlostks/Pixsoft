"use client"

import axios from "axios"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

interface Brand {
  id: number
  logo_url: string
  nombre: string
  descripcion: string
}

export function BrandsSection() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await axios.get<Brand[]>(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/marcas`
        )
        setBrands(response.data || [])
      } catch (error) {
        console.error("Error fetching brands:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBrands()
  }, [])

  const infiniteBrands = useMemo(() => {
    if (!brands.length) return []
    // duplicamos mínimo 3 veces para evitar cortes en pantallas grandes
    return [...brands, ...brands, ...brands]
  }, [brands])

  if (isLoading) {
    return (
      <section className="py-12 lg:py-16 bg-secondary/30 dark:bg-secondary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="h-7 w-64 bg-muted mx-auto rounded animate-pulse" />
            <div className="h-4 w-80 bg-muted mx-auto rounded mt-3 animate-pulse" />
          </div>
          <div className="relative overflow-hidden">
            <div className="flex gap-12 animate-pulse">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="w-32 h-16 bg-muted/70 rounded-xl"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!brands.length) return null

  return (
    <section className="py-12 lg:py-16 bg-secondary/30 dark:bg-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
            Trabajamos con las <span className="text-primary">mejores marcas</span>
          </h2>
          <p className="text-muted-foreground mt-2">
            Calidad garantizada en todos nuestros productos
          </p>
        </div>

        <div className="relative overflow-hidden">
          {/* máscara para degradar bordes */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-secondary/30 dark:from-secondary/20 to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-secondary/30 dark:from-secondary/20 to-transparent z-10" />

          <div className="flex w-max animate-marquee gap-12 items-center">
            {infiniteBrands.map((brand, index) => (
              <Link
                key={`${brand.id}-${index}`}
                href={`/productos?marca=${brand.id}`}
                className="flex-shrink-0 group cursor-pointer"
              >
                <div className="w-32 h-16 flex items-center justify-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300 hover:scale-110">
                  <img
                    src={brand.logo_url}
                    alt={brand.nombre}
                    className="max-w-full max-h-full object-contain dark:invert dark:opacity-80"
                    loading="lazy"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
