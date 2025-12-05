"use client"

import { useState } from "react"
import Link from "next/link"
import { HeartIcon, ShoppingCartIcon, StarIcon } from "./icons"
import type { ProductListItem } from "@/types/products"
import { toast } from "sonner"
import Cookies from "js-cookie"
import axios from "axios"

export function ProductGridCard({ 
  product, 
  viewMode = "grid" 
}: { 
  product: ProductListItem
  viewMode?: "grid" | "list" 
}) {
  const [isLiked, setIsLiked] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [loadingCart, setLoadingCart] = useState(false)

  const token = Cookies.get('token')

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!token) {
      toast.error("Debes iniciar sesión para agregar productos al carrito")
      return
    }
    
    setLoadingCart(true)
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
      )
      
      if (response.data.success) {
        toast.success("Producto agregado al carrito")
        window.dispatchEvent(new Event('cartUpdated'))
      }
    } catch (error: any) {
      console.error("Error adding to cart:", error)
      if (error.response?.status === 401) {
        toast.error("Sesión expirada. Por favor, inicia sesión nuevamente.")
        Cookies.remove("token")
        window.location.reload()
      } else {
        toast.error("Error al agregar producto al carrito")
      }
    } finally {
      setLoadingCart(false)
    }
  }

  const precio = Number.parseFloat(product.precio)
  const precioDescuento = Number.parseFloat(product.precio_descuento)
  const tieneDescuento = precioDescuento < precio
  const descuento = tieneDescuento ? Math.round((1 - precioDescuento / precio) * 100) : 0
  const precioFinal = tieneDescuento ? precioDescuento : precio
  const rating = Number.parseFloat(product.promedio_calificacion) || 0

  // Vista de lista
  if (viewMode === "list") {
    return (
      <div className="group glass rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 mx-auto w-full">
        <Link href={`/productos/${product.id}`}>
          {/* En móvil: diseño vertical, en desktop: horizontal */}
          <div className="flex flex-col md:flex-row items-stretch">
            {/* Imagen - Siempre a la izquierda/top */}
            <div className="md:w-1/4 lg:w-1/5 xl:w-1/6 relative">
              <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                {product.destacado && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-amber-500 text-white rounded-full shadow-sm">
                    Destacado
                  </span>
                )}
                {descuento > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-rose-500 text-white rounded-full shadow-sm">
                    -{descuento}%
                  </span>
                )}
              </div>
              
              <div className="aspect-square p-4 sm:p-5 bg-linear-to-br from-secondary/20 to-secondary/5">
                <img
                  src={product.url_imagen || "/placeholder.svg"}
                  alt={product.producto_nombre}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </div>

            {/* Contenido del producto */}
            <div className="flex-1 p-4 sm:p-5 md:p-6 flex flex-col justify-center">
              {/* Categoría */}
              <div className="mb-2">
                <span className="inline-block text-xs text-muted-foreground px-3 py-1 bg-secondary/40 rounded-full">
                  {product.categoria_nombre}
                </span>
              </div>

              {/* Nombre del producto */}
              <h3 className="text-lg sm:text-xl font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-3">
                {product.producto_nombre}
              </h3>

              {/* Rating */}
              <div className="flex items-center gap-1.5 mb-3">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${star <= Math.round(rating) ? "text-amber-400" : "text-muted/30"}`}
                      filled={star <= Math.round(rating)}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">({rating.toFixed(1)})</span>
              </div>

              {/* Precio */}
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-2xl font-bold text-foreground">${precioFinal.toLocaleString()}</span>
                {tieneDescuento && (
                  <span className="text-sm text-muted-foreground line-through">${precio.toLocaleString()}</span>
                )}
              </div>
            </div>

            {/* Sección derecha: Stock y botón - CENTRADOS Y VERTICALES */}
            <div className="p-4 sm:p-5 md:p-6 border-t md:border-t-0 md:border-l border-border/30 flex flex-col justify-center items-center gap-4">
              {/* Stock - CENTRADO */}
              <div className="flex flex-col items-center gap-2 text-center">
                <div
                  className={`w-3 h-3 rounded-full ${
                    product.stock === null || product.stock > 10
                      ? "bg-emerald-500"
                      : product.stock > 0
                        ? "bg-amber-500"
                        : "bg-rose-500"
                  }`}
                />
                <span className="text-sm text-muted-foreground font-medium">
                  {product.stock === null
                    ? "Disponible"
                    : product.stock > 10
                      ? "En stock"
                      : product.stock > 0
                        ? `Solo ${product.stock}`
                        : "Agotado"}
                </span>
              </div>

              {/* Botón de carrito - SOLO ICONO REDONDO EN DESKTOP */}
              <button
                onClick={handleAddToCart}
                disabled={loadingCart || (product.stock !== null && product.stock <= 0)}
                className={`
                  transition-all duration-300 flex items-center justify-center
                  ${product.stock !== null && product.stock <= 0
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-110"
                  }
                  ${loadingCart ? "opacity-70 cursor-wait" : ""}
                `}
                title={product.stock !== null && product.stock <= 0 ? "Agotado" : "Agregar al carrito"}
              >
                {loadingCart ? (
                  <div className="w-14 h-14 rounded-full border-3 border-primary border-t-transparent flex items-center justify-center animate-spin">
                    {/* Spinner elegante */}
                  </div>
                ) : (
                  <div className={`
                    flex items-center justify-center
                    ${product.stock !== null && product.stock <= 0
                      ? "bg-gray-300 dark:bg-gray-700 text-gray-500"
                      : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                    }
                    rounded-full
                    w-14 h-14
                    md:w-16 md:h-16
                  `}>
                    {/* En móvil: icono + texto, en desktop: solo icono */}
                    <div className="flex flex-col md:flex-row items-center justify-center">
                      <ShoppingCartIcon className="w-6 h-6 md:w-7 md:h-7" />
                      <span className="text-xs font-medium mt-1 md:hidden">Carrito</span>
                    </div>
                  </div>
                )}
              </button>
              
              {/* Texto adicional en móvil */}
              <span className="text-xs text-muted-foreground md:hidden">
                {product.stock !== null && product.stock <= 0 ? "Producto agotado" : "Click para agregar"}
              </span>
            </div>
          </div>
        </Link>
      </div>
    )
  }

  // Vista Grid (mosaico)
  return (
    <div
      className="group relative glass rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:scale-[1.02] mx-auto w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {product.destacado && (
          <span className="px-2 py-0.5 text-xs font-bold bg-amber-500 text-white rounded-full">
            Destacado
          </span>
        )}
      </div>

      {/* Discount Badge */}
      {descuento > 0 && (
        <div className="absolute top-3 right-3 z-10">
          <span className="px-2 py-0.5 text-xs font-bold bg-rose-500 text-white rounded-full">
            -{descuento}%
          </span>
        </div>
      )}

      <Link href={`/productos/${product.id}`}>
        {/* Imagen */}
        <div className="relative aspect-square p-4 sm:p-6 bg-linear-to-br from-secondary/20 to-secondary/5">
          <img
            src={product.url_imagen || "/placeholder.svg"}
            alt={product.producto_nombre}
            className={`w-full h-full object-contain transition-transform duration-300 ${
              isHovered ? "scale-105" : "scale-100"
            }`}
          />
        </div>

        {/* Contenido */}
        <div className="p-4 sm:p-5">
          {/* Categoría */}
          <div className="mb-1">
            <span className="text-xs text-muted-foreground">{product.categoria_nombre}</span>
          </div>

          {/* Nombre */}
          <h3 className="text-sm font-medium text-foreground line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
            {product.producto_nombre}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${star <= Math.round(rating) ? "text-amber-400" : "text-muted/30"}`}
                  filled={star <= Math.round(rating)}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({rating.toFixed(1)})</span>
          </div>

          {/* Precio */}
          <div className="mt-2 sm:mt-3 flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-bold text-foreground">${precioFinal.toLocaleString()}</span>
            {tieneDescuento && (
              <span className="text-sm text-muted-foreground line-through">${precio.toLocaleString()}</span>
            )}
          </div>

          {/* Stock y botón - EN VISTA GRID SÍ VAN JUNTOS */}
          <div className="mt-3 flex items-center justify-between">
            {/* Stock */}
            <div className="flex items-center gap-2">
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
                    ? "Stock"
                    : product.stock > 0
                      ? `${product.stock} u`
                      : "Agotado"}
              </span>
            </div>
          </div>

          {/* Botón de carrito - FULL WIDTH */}
          <div className="mt-4">
            <button
              onClick={handleAddToCart}
              disabled={loadingCart || (product.stock !== null && product.stock <= 0)}
              className={`
                w-full py-2.5 rounded-xl font-medium transition-all duration-300 
                flex items-center justify-center gap-2
                ${product.stock !== null && product.stock <= 0
                  ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                  : loadingCart
                  ? "bg-primary/70 text-primary-foreground cursor-wait"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-[1.02]"
                }
              `}
            >
              {loadingCart ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Agregando...</span>
                </>
              ) : (
                <>
                  <ShoppingCartIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">
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