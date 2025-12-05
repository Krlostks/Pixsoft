"use client"

import { ChevronRightIcon } from "./icons"
import Link from "next/link"
import { ProductGridCard } from "./product-grid-card"
import { useEffect, useState } from "react"
import { ProductListItem } from "@/types/products"
import axios from "axios"

export function BestSellers() {
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
    <section className="py-12 lg:py-16 bg-secondary/20 dark:bg-secondary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
              Lo más <span className="text-primary">vendido</span>
            </h2>
            <p className="text-muted-foreground mt-1">Los productos favoritos de nuestros clientes</p>
          </div>
          <Link href="/productos" className="group flex items-center gap-1 text-primary font-medium hover:underline">
            Ver todos
            <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
          {products.map((product) => (
            <ProductGridCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
