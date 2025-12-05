"use client"

import { useState } from "react"
import { HeartIcon, ShoppingCartIcon, StarIcon } from "./icons"

interface Product {
  id: number
  name: string
  brand: string
  price: number
  originalPrice?: number
  image: string
  rating: number
  reviews: number
  stock: number
  badge?: string
}

export function ProductCard({ product }: { product: Product }) {
  const [isLiked, setIsLiked] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0

  return (
    <div
      className="group relative glass rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badge */}
      {product.badge && (
        <div className="absolute top-4 left-4 z-10">
          <span className="px-3 py-1 text-xs font-bold bg-primary text-primary-foreground rounded-full shadow-lg">
            {product.badge}
          </span>
        </div>
      )}

      {/* Discount Badge */}
      {discount > 0 && (
        <div className="absolute top-4 right-4 z-10">
          <span className="px-2 py-1 text-xs font-bold bg-rose-500 text-white rounded-full">-{discount}%</span>
        </div>
      )}

      {/* Like Button */}
      <button
        onClick={() => setIsLiked(!isLiked)}
        className={`absolute top-14 right-4 z-10 p-2 rounded-full transition-all duration-300 ${
          isLiked
            ? "bg-rose-100 dark:bg-rose-900/50"
            : "bg-white/80 dark:bg-slate-800/80 opacity-0 group-hover:opacity-100"
        }`}
      >
        <HeartIcon
          className={`w-5 h-5 transition-colors duration-300 ${isLiked ? "text-rose-500" : "text-muted-foreground"}`}
          filled={isLiked}
        />
      </button>

      {/* Image */}
      <div className="relative aspect-square p-6 bg-gradient-to-br from-secondary/30 to-secondary/10">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          className={`w-full h-full object-contain transition-transform duration-500 ${
            isHovered ? "scale-110" : "scale-100"
          }`}
        />

        {/* Quick Add */}
        <div
          className={`absolute bottom-4 left-4 right-4 transition-all duration-300 ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <button className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-medium flex items-center justify-center gap-2 shadow-lg transition-all duration-300 hover:shadow-xl">
            <ShoppingCartIcon className="w-5 h-5" />
            Agregar
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Brand */}
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{product.brand}</span>

        {/* Name */}
        <h3 className="mt-1 text-sm font-medium text-foreground line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors duration-300">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon
                key={star}
                className={`w-4 h-4 ${star <= product.rating ? "text-amber-400" : "text-muted/30"}`}
                filled={star <= product.rating}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({product.reviews})</span>
        </div>

        {/* Price */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-xl font-bold text-foreground">${product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>

        {/* Stock */}
        <div className="mt-2 flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${product.stock > 10 ? "bg-emerald-500" : product.stock > 0 ? "bg-amber-500" : "bg-rose-500"}`}
          />
          <span className="text-xs text-muted-foreground">
            {product.stock > 10 ? "Disponible" : product.stock > 0 ? `¡Solo ${product.stock} disponibles!` : "Agotado"}
          </span>
        </div>
      </div>
    </div>
  )
}
