"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "./product-card"
import { ChevronRightIcon } from "./icons"

const products = [
  {
    id: 1,
    name: "Tarjeta Madre ASUS Prime B660-PLUS WiFi, ATX, Socket AM5",
    brand: "ASUS",
    price: 2719,
    originalPrice: 3199,
    image: "/asus-motherboard-b660-computer-part.jpg",
    rating: 4,
    reviews: 1,
    stock: 44,
    badge: "Más vendido",
  },
  {
    id: 2,
    name: "Tarjeta Madre MSI B550M PRO-VDH, Micro-ATX, Socket AM4",
    brand: "MSI",
    price: 1519,
    originalPrice: 1899,
    image: "/msi-b550m-motherboard-computer-hardware.jpg",
    rating: 5,
    reviews: 30,
    stock: 67,
  },
  {
    id: 3,
    name: "NZXT Kraken Plus 360 RGB Enfriamiento Líquido para CPU",
    brand: "NZXT",
    price: 3689,
    image: "/nzxt-kraken-rgb-liquid-cooler.jpg",
    rating: 5,
    reviews: 15,
    stock: 22,
    badge: "Nuevo",
  },
  {
    id: 4,
    name: "Procesador AMD Ryzen 9 8900G con AMD Radeon Graphics",
    brand: "AMD",
    price: 3219,
    originalPrice: 3599,
    image: "/amd-ryzen-9-processor-cpu-chip.jpg",
    rating: 5,
    reviews: 33,
    stock: 89,
  },
  {
    id: 5,
    name: "RTX 4070 Super Gaming OC 12GB GDDR6X Triple Fan",
    brand: "NVIDIA",
    price: 12499,
    originalPrice: 14999,
    image: "/nvidia-rtx-4070-graphics-card-gpu.jpg",
    rating: 5,
    reviews: 47,
    stock: 8,
    badge: "Oferta",
  },
  {
    id: 6,
    name: "SSD Samsung 990 PRO 2TB NVMe M.2 PCIe 4.0",
    brand: "Samsung",
    price: 3299,
    originalPrice: 3999,
    image: "/samsung-990-pro-ssd-storage.jpg",
    rating: 5,
    reviews: 128,
    stock: 156,
  },
  {
    id: 7,
    name: "Memoria RAM Corsair Vengeance RGB 32GB DDR5 6000MHz",
    brand: "Corsair",
    price: 2199,
    image: "/corsair-vengeance-rgb-ram-ddr5.jpg",
    rating: 4,
    reviews: 89,
    stock: 234,
  },
  {
    id: 8,
    name: "Fuente de Poder EVGA SuperNOVA 850W 80+ Gold",
    brand: "EVGA",
    price: 1899,
    originalPrice: 2299,
    image: "/evga-power-supply-unit-850w.jpg",
    rating: 5,
    reviews: 56,
    stock: 45,
  },
]

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 24,
    seconds: 3,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev
        if (seconds > 0) {
          seconds--
        } else if (minutes > 0) {
          minutes--
          seconds = 59
        } else if (hours > 0) {
          hours--
          minutes = 59
          seconds = 59
        }
        return { hours, minutes, seconds }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex items-center gap-2">
      {Object.entries(timeLeft).map(([unit, value], index) => (
        <div key={unit} className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <span className="text-2xl lg:text-3xl font-bold text-foreground tabular-nums">
              {value.toString().padStart(2, "0")}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {unit === "hours" ? "hrs" : unit === "minutes" ? "min" : "seg"}
            </span>
          </div>
          {index < 2 && <span className="text-2xl font-light text-muted-foreground">:</span>}
        </div>
      ))}
    </div>
  )
}

export function FeaturedProducts() {
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
            <div className="glass-subtle px-4 py-3 rounded-2xl">
              <CountdownTimer />
            </div>
            <a href="#" className="group flex items-center gap-1 text-primary font-medium hover:underline">
              Ver todos
              <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
