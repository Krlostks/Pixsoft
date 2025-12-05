"use client"

import { useState, useEffect } from "react"
import { ChevronRightIcon } from "./icons"
import Link from "next/link"
import { ProductListItem } from "@/types/products"
import { ProductGridCard } from "./product-grid-card"
import axios from "axios"


export function FeaturedProducts() {
  const [products, setProducts] = useState<ProductListItem[]>([])

  const fetchFeaturedProducts = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/productos?destacado=true`
      )
      setProducts(response.data.data)
    } catch (error) {
      console.error("Error fetching featured products:", error)
    }
  }

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  return (
    <section className="py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
              Destacados del día
              <span className="text-primary"> ¡no los dejes pasar!</span>
            </h2>
            <p className="text-muted-foreground mt-1">Las mejores ofertas seleccionadas para ti</p>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/productos" className="group flex items-center gap-1 text-primary font-medium hover:underline">
              Ver todos
              <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 8).map((product) => (
            <ProductGridCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
