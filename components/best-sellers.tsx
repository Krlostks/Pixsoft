"use client"

import { ProductCard } from "./product-card"
import { ChevronRightIcon } from "./icons"

const bestSellers = [
  {
    id: 101,
    name: "Fuente de Poder Seasonic Core V2 Gx 60 PLUS",
    brand: "Seasonic",
    price: 1899,
    image: "/placeholder.svg?height=300&width=300",
    rating: 5,
    reviews: 0,
    stock: 34,
  },
  {
    id: 102,
    name: "Tarjeta Madre ASUS Prime B640-PLUS WiFi ATX",
    brand: "ASUS",
    price: 2719,
    originalPrice: 3199,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4,
    reviews: 1,
    stock: 44,
  },
  {
    id: 103,
    name: "NZXT Kraken Plus 360 RGB Enfriamiento Líquido",
    brand: "NZXT",
    price: 3689,
    image: "/placeholder.svg?height=300&width=300",
    rating: 5,
    reviews: 0,
    stock: 22,
  },
  {
    id: 104,
    name: "Tarjeta Madre MSI B550M PRO-VDH Micro-ATX",
    brand: "MSI",
    price: 1519,
    image: "/placeholder.svg?height=300&width=300",
    rating: 5,
    reviews: 30,
    stock: 67,
  },
  {
    id: 105,
    name: "Disipador CPU Cooler Master Hyper 212 RGB",
    brand: "Cooler Master",
    price: 699,
    originalPrice: 899,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4,
    reviews: 59,
    stock: 123,
  },
]

export function BestSellers() {
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
          <a href="#" className="group flex items-center gap-1 text-primary font-medium hover:underline">
            Ver todos
            <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
