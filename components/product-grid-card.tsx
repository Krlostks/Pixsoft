"use client"

import { useState } from "react"
import Link from "next/link"
import { HeartIcon, ShoppingCartIcon, StarIcon } from "./icons"
import type { ProductListItem } from "@/types/products"
import { toast } from "sonner"
import Cookies from "js-cookie"
import axios from "axios"

export function ProductGridCard({ product }: { product: ProductListItem }) {
  const [isLiked, setIsLiked] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const token = Cookies.get('token');
  const [loadingCart, setLoadingCart] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!token) {
      toast.error("Debes iniciar sesión para agregar productos al carrito");
      return;
    }
    
    setLoadingCart(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/carrito/agregar`, 
        {
          producto_id: product.id,
          cantidad: 1,
        },
        { 
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        }
      );
      
      if (response.data.success) {
        toast.success("Producto agregado al carrito");
        // Disparar evento para actualizar el contador en el header
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      if (error.response?.status === 401) {
        toast.error("Sesión expirada. Por favor, inicia sesión nuevamente.");
        Cookies.remove("token");
        window.location.reload();
      } else {
        toast.error("Error al agregar producto al carrito");
      }
    } finally {
      setLoadingCart(false);
    }
  }

  const precio = Number.parseFloat(product.precio)
  const precioDescuento = Number.parseFloat(product.precio_descuento)
  const tieneDescuento = precioDescuento < precio
  const descuento = tieneDescuento ? Math.round((1 - precioDescuento / precio) * 100) : 0
  const precioFinal = tieneDescuento ? precioDescuento : precio
  const rating = Number.parseFloat(product.promedio_calificacion) || 0

  return (
    <div
      className="group relative glass rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:scale-[1.02]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {product.destacado && (
          <span className="px-3 py-1 text-xs font-bold bg-amber-500 text-white rounded-full shadow-lg">Destacado</span>
        )}
      </div>

      {/* Discount Badge */}
      {descuento > 0 && (
        <div className="absolute top-4 right-4 z-10">
          <span className="px-2.5 py-1 text-xs font-bold bg-rose-500 text-white rounded-full shadow-lg">
            -{descuento}%
          </span>
        </div>
      )}

      <Link href={`/productos/${product.id}`}>
        {/* Image */}
        <div className="relative aspect-square p-6 bg-gradient-to-br from-secondary/30 to-secondary/10">
          <img
            src={product.url_imagen || "/placeholder.svg?height=300&width=300&query=product"}
            alt={product.producto_nombre}
            className={`w-full h-full object-contain transition-transform duration-500 ${
              isHovered ? "scale-110" : "scale-100"
            }`}
          />
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Category */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-muted-foreground">{product.categoria_nombre}</span>
          </div>

          {/* Name */}
          <h3 className="text-sm font-medium text-foreground line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors duration-300">
            {product.producto_nombre}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={`w-4 h-4 ${star <= Math.round(rating) ? "text-amber-400" : "text-muted/30"}`}
                  filled={star <= Math.round(rating)}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({rating.toFixed(1)})</span>
          </div>

          {/* Price */}
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-bold text-foreground">${precioFinal.toLocaleString()}</span>
            {tieneDescuento && (
              <span className="text-sm text-muted-foreground line-through">${precio.toLocaleString()}</span>
            )}
          </div>

          {/* Stock */}
          <div className="mt-2 flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                product.stock === null || product.stock > 10
                  ? "bg-emerald-500"
                  : product.stock > 0
                    ? "bg-amber-500"
                    : "bg-rose-500"
              }`}
            />
            <span className="text-xs text-muted-foreground">
              {product.stock === null
                ? "Disponible"
                : product.stock > 10
                  ? "Disponible"
                  : product.stock > 0
                    ? `¡Solo ${product.stock} disponibles!`
                    : "Agotado"}
            </span>
          </div>

          {/* Add to Cart Button - SIEMPRE VISIBLE */}
          <div className="mt-4">
            <button
              onClick={handleAddToCart}
              disabled={loadingCart || (product.stock !== null && product.stock <= 0)}
              className={`w-full py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                product.stock !== null && product.stock <= 0
                  ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                  : loadingCart
                  ? "bg-primary/70 text-primary-foreground cursor-wait"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-[1.02]"
              }`}
            >
              {loadingCart ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                  <span>Agregando...</span>
                </>
              ) : (
                <>
                  <ShoppingCartIcon className="w-4 h-4" />
                  <span>
                    {product.stock !== null && product.stock <= 0
                      ? "Agotado"
                      : "Agregar al carrito"}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </Link>
    </div>
  )
}