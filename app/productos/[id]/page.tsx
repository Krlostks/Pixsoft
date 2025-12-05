"use client"

import type React from "react"
import { useState, useEffect, use } from "react"
import Link from "next/link"
import { Footer } from "@/components/footer"
import {
  StarIcon,
  HeartIcon,
  ShoppingCartIcon,
  TruckIcon,
  ShieldCheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PackageIcon,
  MinusIcon,
  PlusIcon,
  ShareIcon,
  SparklesIcon,
} from "@/components/icons"
import type { ProductDetail, ProductDetailResponse } from "@/types/products"
import axios from "axios"
import { toast } from "sonner"
import { ProductReviews } from "@/components/product-reviews"
import { Opinion , OpinionEstadisticas, OpinionesProductoResponse } from "@/types/opiniones"
import Cookies from "js-cookie"

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)

  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isLiked, setIsLiked] = useState(false)
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews">("description")
  const [isZoomed, setIsZoomed] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [opiniones, setOpiniones] = useState<Opinion[]>([]);
  const [estadisticas, setEstadisticas] = useState<OpinionEstadisticas | null>(null);
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
          producto_id: resolvedParams.id,
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

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true)
      try {
        const response = await axios.get<ProductDetailResponse>(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/productos/${resolvedParams.id}`,
        )
        setProduct(response.data.data)
        setError(false)
      } catch (err) {
        console.error("Error fetching product:", err)
        setError(true)
        toast.error("Error al cargar el producto")
      } finally {
        setIsLoading(false)
      }
    }
    
    const fetchOpiniones = async () => {
    try {
      const response = await axios.get<OpinionesProductoResponse>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/opiniones/producto/${resolvedParams.id}`
      );
      setOpiniones(response.data.opiniones);
      setEstadisticas(response.data.estadisticas);
    } catch (err) {
      console.error("Error fetching opiniones:", err);
      toast.error("Error al cargar las opiniones");
    }
  };

    fetchOpiniones();
    fetchProduct()
  }, [resolvedParams.id])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMousePosition({ x, y })}

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="pt-32 pb-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
              {/* Image Skeleton */}
              <div className="glass-strong rounded-3xl aspect-square animate-pulse bg-secondary/30" />
              {/* Info Skeleton */}
              <div className="space-y-6">
                <div className="h-8 bg-secondary/30 rounded-2xl w-32 animate-pulse" />
                <div className="h-12 bg-secondary/30 rounded-2xl w-full animate-pulse" />
                <div className="h-6 bg-secondary/30 rounded-2xl w-48 animate-pulse" />
                <div className="h-32 bg-secondary/30 rounded-3xl w-full animate-pulse" />
                <div className="h-14 bg-secondary/30 rounded-2xl w-full animate-pulse" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <main className="pt-32 pb-20">
          <div className="container mx-auto px-4 text-center">
            <div className="glass rounded-3xl p-12 max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                <PackageIcon className="w-10 h-10 text-rose-500" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-4">Producto no encontrado</h1>
              <p className="text-muted-foreground mb-6">El producto que buscas no existe o fue eliminado.</p>
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all duration-300"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                Volver a productos
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Datos procesados del producto
  const precio = Number.parseFloat(product.precio)
  const precioDescuento = Number.parseFloat(product.precio_descuento)
  const tieneDescuento = precioDescuento < precio
  const descuento = tieneDescuento ? Math.round((1 - precioDescuento / precio) * 100) : 0
  const precioFinal = tieneDescuento ? precioDescuento : precio
  const rating = Number.parseFloat(product.promedio_calificacion) || 0
  const imagen = product.url_imagen || "/diverse-products-still-life.png"
  const stock = product.stock ?? 999
  

  return (
    <div className="min-h-screen bg-background">

      <main className="pt-10 pb-20">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-8 overflow-x-auto pb-2">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors whitespace-nowrap">
              Inicio
            </Link>
            <ChevronRightIcon className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
            <Link
              href="/productos"
              className="text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
            >
              Productos
            </Link>
            <ChevronRightIcon className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
            <Link
              href={`/productos?categoria=${encodeURIComponent(product.categoria_nombre)}`}
              className="text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
            >
              {product.categoria_nombre}
            </Link>
            <ChevronRightIcon className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
            <span className="text-foreground font-medium truncate max-w-[200px]">{product.producto_nombre}</span>
          </nav>

          {/* Product Section */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 mb-16">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div
                className="relative glass-strong rounded-3xl overflow-hidden aspect-square cursor-zoom-in group"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
              >
                {/* Badges Container */}
                <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                  {product.destacado && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-linear-to-r from-amber-500 to-orange-500 text-white rounded-full shadow-lg animate-pulse">
                      <SparklesIcon className="w-3.5 h-3.5" />
                      Destacado
                    </span>
                  )}
                  {descuento > 0 && (
                    <span className="px-3 py-1.5 text-xs font-bold bg-linear-to-r from-rose-500 to-pink-500 text-white rounded-full shadow-lg">
                      -{descuento}% OFF
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className={`p-3 rounded-2xl backdrop-blur-xl transition-all duration-300 hover:scale-110 ${
                      isLiked
                        ? "bg-rose-500/20 border border-rose-500/30"
                        : "bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10"
                    }`}
                  >
                    <HeartIcon
                      className={`w-5 h-5 transition-colors ${isLiked ? "text-rose-500" : "text-foreground"}`}
                      filled={isLiked}
                    />
                  </button>
                  <button className="p-3 rounded-2xl backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 transition-all duration-300 hover:scale-110">
                    <ShareIcon className="w-5 h-5 text-foreground" />
                  </button>
                </div>

                {/* Image Container with Zoom Effect */}
                <div className="p-8 lg:p-12 h-full flex items-center justify-center bg-linear-to-br from-white/50 to-white/20 dark:from-slate-800/50 dark:to-slate-900/20 overflow-hidden">
                  <img
                    src={imagen || "/placeholder.svg"}
                    alt={product.producto_nombre}
                    className={`max-w-full max-h-full object-contain transition-all duration-500 ${
                      isZoomed ? "scale-110" : "scale-100"
                    }`}
                    style={
                      isZoomed
                        ? {
                            transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                          }
                        : undefined
                    }
                  />
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6 lg:sticky lg:top-32 lg:self-start">
              {/* Brand & Category */}
              <div className="flex items-center gap-3 text-sm">
                <span className="font-bold text-primary uppercase tracking-widest">{product.marca_nombre}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                <span className="text-muted-foreground">{product.categoria_nombre}</span>
              </div>

              {/* Name */}
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground text-balance leading-tight">
                {product.producto_nombre}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      className={`w-5 h-5 transition-colors ${star <= Math.round(rating) ? "text-amber-400" : "text-muted/30"}`}
                      filled={star <= Math.round(rating)}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-foreground">{rating.toFixed(1)}</span>
              </div>

              {/* Price Card */}
              <div className="glass-strong rounded-3xl p-6 space-y-4">
                <div className="flex items-end gap-4 flex-wrap">
                  <span className="text-4xl lg:text-5xl font-bold text-foreground">
                    ${precioFinal.toLocaleString()}
                  </span>
                  {tieneDescuento && (
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xl text-muted-foreground line-through">${precio.toLocaleString()}</span>
                      <span className="px-2.5 py-1 bg-linear-to-r from-rose-500/20 to-pink-500/20 border border-rose-500/30 text-rose-500 dark:text-rose-400 rounded-lg text-sm font-bold">
                        Ahorras ${(precio - precioFinal).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Precio incluye IVA • Hasta 12 MSI disponibles</p>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-secondary/30">
                <div
                  className={`w-3 h-3 rounded-full animate-pulse ${
                    stock > 10 ? "bg-emerald-500" : stock > 0 ? "bg-amber-500" : "bg-rose-500"
                  }`}
                />
                <span className="text-sm font-medium">
                  {stock > 10 ? (
                    <span className="text-emerald-600 dark:text-emerald-400">En stock - Envío en 24-48 horas</span>
                  ) : stock > 0 ? (
                    <span className="text-amber-600 dark:text-amber-400">¡Últimas {stock} unidades disponibles!</span>
                  ) : (
                    <span className="text-rose-600 dark:text-rose-400">Temporalmente agotado</span>
                  )}
                </span>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-foreground">Cantidad:</span>
                  <div className="flex items-center glass rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-secondary/50 transition-colors disabled:opacity-50"
                      disabled={quantity <= 1}
                    >
                      <MinusIcon className="w-5 h-5 text-foreground" />
                    </button>
                    <span className="w-14 text-center font-bold text-foreground text-lg">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                      className="p-3 hover:bg-secondary/50 transition-colors disabled:opacity-50"
                      disabled={quantity >= stock}
                    >
                      <PlusIcon className="w-5 h-5 text-foreground" />
                    </button>
                  </div>
                </div>

                <button
                  disabled={stock === 0}
                  onClick={handleAddToCart}
                  className="w-full py-4 px-8 bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 disabled:from-muted disabled:to-muted disabled:cursor-not-allowed text-primary-foreground rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-500 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ShoppingCartIcon className="w-6 h-6" />
                  Agregar al Carrito
                </button>
              </div>

              {/* Benefits Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/30">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <TruckIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-foreground">Envío gratis</p>
                    <p className="text-muted-foreground">En pedidos +$999</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/30">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <ShieldCheckIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-foreground">Garantía oficial</p>
                    <p className="text-muted-foreground">12 meses de cobertura</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="glass-strong rounded-3xl overflow-hidden">
            {/* Tab Headers */}
            <div className="flex overflow-x-auto border-b border-border/30">
              {[
                { id: "description", label: "Descripción" },
                { id: "specs", label: "Características" },
                { id: "reviews", label: "Reseñas" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex-shrink-0 px-8 py-5 text-sm font-semibold transition-all duration-300 relative ${
                    activeTab === tab.id
                      ? "text-primary bg-primary/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-primary to-primary/50" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6 lg:p-10">
              {/* Description Tab */}
              {activeTab === "description" && (
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    {product.descripcion || "Sin descripción disponible."}
                  </p>
                </div>
              )}

              {/* Specs Tab */}
              {activeTab === "specs" && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {product.caracteristicas && Object.keys(product.caracteristicas).length > 0 ? (
                    Object.entries(product.caracteristicas).map(([key, value]) => (
                      <div
                        key={key}
                        className="p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors duration-300"
                      >
                        <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                          {key}
                        </dt>
                        <dd className="text-sm font-semibold text-foreground">{String(value)}</dd>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground col-span-full">No hay características disponibles.</p>
                  )}
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === "reviews" && (                
                <ProductReviews
                  promedioCalificacion={rating}
                  opiniones={opiniones}
                  estadisticas={estadisticas}
                />

              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
