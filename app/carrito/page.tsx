"use client"

import { useState, useEffect, useCallback } from "react"
import { 
  ShoppingCartIcon, 
  TrashIcon, 
  PlusIcon, 
  MinusIcon, 
  ArrowLeftIcon,
  SparklesIcon 
} from "@/components/icons"
import axios from "axios"
import { toast } from "sonner"
import Cookies from "js-cookie"
import Link from "next/link"

interface CartItem {
  id_carrito: number
  producto_id: number
  nombre: string
  marca: string
  categoria: string
  imagen: string
  cantidad: number
  precio_unitario: string
  subtotal: string
}

interface CartResponse {
  items: CartItem[]
  total_carrito: string
  success: boolean
  message?: string
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [total, setTotal] = useState("0.00")
  const [isLoading, setIsLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)

  // Verificar token
  useEffect(() => {
    const t = Cookies.get("token")
    setToken(t || null)
  }, [])

  // Obtener carrito
  const fetchCart = useCallback(async () => {
    if (!token) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await axios.get<CartResponse>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/carrito/`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (response.data.success) {
        setCartItems(response.data.items || [])
        setTotal(response.data.total_carrito || "0.00")
      }
    } catch (error: any) {
      console.error("Error al obtener carrito:", error)
      if (error.response?.status === 401) {
        Cookies.remove("token")
        setToken(null)
        toast.error("Sesión expirada. Por favor, inicia sesión nuevamente.")
      } else {
        toast.error("Error al cargar el carrito")
      }
      setCartItems([])
      setTotal("0.00")
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  // Actualizar cantidad
  const updateQuantity = async (idCarrito: number, nuevaCantidad: number) => {
    if (!token || nuevaCantidad < 1) return

    try {
      // Si la cantidad es 0, eliminar producto
      if (nuevaCantidad === 0) {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/carrito/${idCarrito}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
        toast.success("Producto eliminado del carrito")
      } else {
        // Actualizar cantidad
        await axios.put(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/carrito/${idCarrito}`,
          { cantidad: nuevaCantidad },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
        toast.success("Cantidad actualizada")
      }

      // Refrescar carrito
      fetchCart()
      
      // Disparar evento para actualizar contador en header
      window.dispatchEvent(new Event('cartUpdated'))
    } catch (error) {
      console.error("Error al actualizar cantidad:", error)
      toast.error("Error al actualizar el carrito")
    }
  }

  // Eliminar producto
  const removeItem = async (idCarrito: number) => {
    if (!token) return

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/carrito/${idCarrito}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      toast.success("Producto eliminado del carrito")
      fetchCart()
      window.dispatchEvent(new Event('cartUpdated'))
    } catch (error) {
      console.error("Error al eliminar producto:", error)
      toast.error("Error al eliminar producto")
    }
  }

  // Vaciar carrito
  const clearCart = async () => {
    if (!token || cartItems.length === 0) return

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/carrito/limpiar`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      toast.success("Carrito vaciado")
      setCartItems([])
      setTotal("0.00")
      window.dispatchEvent(new Event('cartUpdated'))
    } catch (error) {
      console.error("Error al vaciar carrito:", error)
      toast.error("Error al vaciar el carrito")
    }
  }

  // Si no hay token, mostrar mensaje para iniciar sesión
  if (!token && !isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="pt-10 pb-20">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors duration-300 mb-6"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span>Ver los productos</span>
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Mi Carrito</h1>
              <p className="text-muted-foreground">Gestiona tus productos antes de la compra</p>
            </div>

            <div className="glass rounded-3xl p-12 text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary/50 flex items-center justify-center">
                <ShoppingCartIcon className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Carrito vacío</h3>
              <p className="text-muted-foreground mb-6">
                Debes iniciar sesión para ver tu carrito de compras
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/login"
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-medium hover:bg-primary/90 transition-all duration-300"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/productos"
                  className="px-6 py-3 glass rounded-2xl font-medium hover:bg-secondary/50 transition-all duration-300"
                >
                  Ver Productos
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-10 pb-20">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors duration-300 mb-6"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Ver los productos</span>
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Mi Carrito</h1>
            <p className="text-muted-foreground">Gestiona tus productos antes de la compra</p>
          </div>

          {isLoading ? (
            // Loading State
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="glass rounded-3xl p-6 animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-secondary/50 rounded-2xl" />
                      <div className="flex-1 space-y-3">
                        <div className="h-4 bg-secondary/50 rounded w-3/4" />
                        <div className="h-3 bg-secondary/50 rounded w-1/3" />
                        <div className="h-4 bg-secondary/50 rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="lg:col-span-1">
                <div className="glass rounded-3xl p-6 animate-pulse">
                  <div className="space-y-4">
                    <div className="h-4 bg-secondary/50 rounded w-1/2" />
                    <div className="h-8 bg-secondary/50 rounded" />
                    <div className="h-4 bg-secondary/50 rounded w-3/4" />
                  </div>
                </div>
              </div>
            </div>
          ) : cartItems.length > 0 ? (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Items List */}
              <div className="lg:col-span-2 space-y-4">
                {/* Clear Cart Button */}
                <div className="flex justify-end">
                  <button
                    onClick={clearCart}
                    className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all duration-300"
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">Vaciar carrito</span>
                  </button>
                </div>

                {/* Cart Items */}
                {cartItems.map((item) => (
                  <div key={item.id_carrito} className="glass rounded-3xl p-6 hover:shadow-xl transition-all duration-300">
                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-secondary/50">
                          {item.imagen ? (
                            <img
                              src={item.imagen}
                              alt={item.nombre}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingCartIcon className="w-8 h-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-foreground mb-1">{item.nombre}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {item.marca} • {item.categoria}
                            </p>
                            <div className="flex items-center gap-2 mb-4">
                              <span className="text-lg font-bold text-primary">
                                ${item.precio_unitario}
                              </span>
                              <span className="text-sm text-muted-foreground">c/u</span>
                            </div>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center glass rounded-2xl">
                              <button
                                onClick={() => updateQuantity(item.id_carrito, item.cantidad - 1)}
                                className="p-2 hover:bg-secondary/50 rounded-l-2xl transition-colors duration-200"
                                disabled={item.cantidad <= 1}
                              >
                                <MinusIcon className="w-4 h-4" />
                              </button>
                              <span className="px-4 py-2 font-medium min-w-[40px] text-center">
                                {item.cantidad}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id_carrito, item.cantidad + 1)}
                                className="p-2 hover:bg-secondary/50 rounded-r-2xl transition-colors duration-200"
                              >
                                <PlusIcon className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => removeItem(item.id_carrito)}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all duration-300"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        {/* Subtotal */}
                        <div className="flex items-center justify-between pt-4 border-t border-border/30">
                          <span className="text-sm text-muted-foreground">Subtotal</span>
                          <span className="text-lg font-bold text-foreground">
                            ${item.subtotal}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 glass rounded-3xl p-6">
                  <h2 className="text-xl font-bold text-foreground mb-6">Resumen del pedido</h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">${total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Envío</span>
                      <span className="font-medium text-green-500">Gratis</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Impuestos</span>
                      <span className="font-medium">$0.00</span>
                    </div>
                  </div>

                  <div className="border-t border-border/30 pt-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-foreground">Total</span>
                      <div>
                        <div className="text-2xl font-bold text-primary">${total}</div>
                        <div className="text-sm text-muted-foreground text-right">
                          en MXN
                        </div>
                      </div>
                    </div>
                  </div>

                  <button className="w-full py-3.5 bg-primary text-primary-foreground rounded-2xl font-semibold hover:bg-primary/90 transition-all duration-300 hover:scale-[1.02] mb-4 flex items-center justify-center gap-2">
                    <SparklesIcon className="w-5 h-5" />
                    Proceder al pago
                  </button>

                  <Link
                    href="/productos"
                    className="w-full py-3.5 glass rounded-2xl font-medium hover:bg-secondary/50 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <ShoppingCartIcon className="w-4 h-4" />
                    <span>Seguir comprando</span>
                  </Link>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      Envío gratis en compras mayores a $999
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Empty Cart State (usuario autenticado pero carrito vacío)
            <div className="glass rounded-3xl p-12 text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary/50 flex items-center justify-center">
                <ShoppingCartIcon className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Tu carrito está vacío</h3>
              <p className="text-muted-foreground mb-6">
                Agrega productos a tu carrito para poder verlos aquí
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/productos"
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-medium hover:bg-primary/90 transition-all duration-300"
                >
                  Explorar Productos
                </Link>
                <Link
                  href="/"
                  className="px-6 py-3 glass rounded-2xl font-medium hover:bg-secondary/50 transition-all duration-300"
                >
                  Volver al inicio
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}