"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import Cookies from "js-cookie"
import { toast } from "sonner"
import Link from "next/link"
import { 
  ArrowLeftIcon,
  PackageIcon
} from "@/components/icons"

import OrderDetail from "@/components/pedidos/OrderDetail"
import { Button } from "@/components/ui/button"
import ProtectedRoute from "@/components/auth/ProtectedRoute" // Importar

interface DetallePedido {
  id: number
  producto_id: number
  producto_nombre: string
  producto_marca: string
  producto_categoria: string
  producto_imagen: string
  producto_url_imagen: string
  producto_descripcion?: string
  cantidad: number
  precio_unitario: number
  descuento_unitario: number
  es_arrendamiento: boolean
  periodo_arrendamiento?: string
  cantidad_periodos?: number
  fecha_inicio_arrendamiento?: string
  fecha_fin_arrendamiento?: string
}

interface PedidoDetallado {
  id: number
  numero_orden: string
  total: number
  subtotal: number
  descuento: number
  envio: number
  iva: number
  estado_orden: 'pendiente' | 'procesando' | 'enviado' | 'entregado' | 'cancelado'
  estado_pago: 'pendiente' | 'pagado' | 'rechazado' | 'reembolsado'
  metodo_pago: 'tarjeta_credito' | 'tarjeta_debito' | 'paypal' | 'transferencia' | 'efectivo'
  notas?: string
  fecha_creacion: string
  fecha_actualizacion: string
  detalles: DetallePedido[]
  envio_calle?: string
  envio_numero_exterior?: string
  envio_numero_interior?: string
  envio_colonia?: string
  envio_ciudad?: string
  envio_estado?: string
  envio_codigo_postal?: string
  facturacion_calle?: string
  facturacion_numero_exterior?: string
  facturacion_numero_interior?: string
  facturacion_colonia?: string
  facturacion_ciudad?: string
  facturacion_estado?: string
  facturacion_codigo_postal?: string
}

function PedidoDetailContent() {
  const params = useParams()
  const router = useRouter()
  const [pedido, setPedido] = useState<PedidoDetallado | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)

  // Verificar token
  useEffect(() => {
    const t = Cookies.get("token")
    setToken(t || null)
  }, [])

  // Obtener detalle del pedido
  const fetchPedidoDetalle = useCallback(async () => {
    if (!token || !params.id) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await axios.get<PedidoDetallado>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/pedidos/${params.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      setPedido(response.data)
    } catch (error: any) {
      console.error("Error al obtener detalle del pedido:", error)
      if (error.response?.status === 401) {
        Cookies.remove("token")
        setToken(null)
        toast.error("Sesión expirada. Por favor, inicia sesión nuevamente.")
        router.push("/login")
      } else if (error.response?.status === 404) {
        toast.error("Pedido no encontrado")
        router.push("/pedidos")
      } else {
        toast.error("Error al cargar el detalle del pedido")
      }
    } finally {
      setIsLoading(false)
    }
  }, [token, params.id, router])

  useEffect(() => {
    fetchPedidoDetalle()
  }, [fetchPedidoDetalle])

  // Cancelar pedido
  const handleCancelarPedido = async (id: number) => {
    if (!token) return

    if (!confirm("¿Estás seguro de que deseas cancelar este pedido?")) {
      return
    }

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/pedidos/${id}/cancelar`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      toast.success("Pedido cancelado exitosamente")
      fetchPedidoDetalle() // Refrescar los datos
    } catch (error: any) {
      console.error("Error al cancelar pedido:", error)
      const errorMessage = error.response?.data || "Error al cancelar el pedido"
      toast.error(errorMessage)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-10 pb-20">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <Link
              href="/pedidos"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors duration-300 mb-6"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Volver a mis pedidos</span>
            </Link>

            {isLoading ? (
              <div className="space-y-2">
                <div className="h-8 bg-secondary/50 rounded w-1/3 animate-pulse" />
                <div className="h-4 bg-secondary/50 rounded w-1/4 animate-pulse" />
              </div>
            ) : pedido ? (
              <>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  Detalle del Pedido
                </h1>
                <p className="text-muted-foreground">
                  Información completa del pedido {pedido.numero_orden}
                </p>
              </>
            ) : (
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Pedido no encontrado
              </h1>
            )}
          </div>

          {isLoading ? (
            // Loading State
            <div className="space-y-6">
              <div className="glass rounded-3xl p-6 animate-pulse">
                <div className="space-y-4">
                  <div className="h-8 bg-secondary/50 rounded w-1/2" />
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-4 bg-secondary/50 rounded" />
                    <div className="h-4 bg-secondary/50 rounded" />
                    <div className="h-4 bg-secondary/50 rounded" />
                  </div>
                </div>
              </div>
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="glass rounded-3xl p-6 animate-pulse">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 bg-secondary/50 rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-secondary/50 rounded w-3/4" />
                          <div className="h-3 bg-secondary/50 rounded w-1/2" />
                          <div className="h-4 bg-secondary/50 rounded w-1/4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="glass rounded-3xl p-6 animate-pulse">
                      <div className="h-6 bg-secondary/50 rounded w-1/2 mb-4" />
                      <div className="space-y-2">
                        <div className="h-4 bg-secondary/50 rounded" />
                        <div className="h-4 bg-secondary/50 rounded" />
                        <div className="h-4 bg-secondary/50 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : pedido ? (
            <OrderDetail 
              pedido={pedido} 
              onCancel={handleCancelarPedido}
            />
          ) : (
            // Estado de pedido no encontrado
            <div className="glass rounded-3xl p-12 text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary/50 flex items-center justify-center">
                <PackageIcon className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Pedido no encontrado
              </h3>
              <p className="text-muted-foreground mb-6">
                El pedido que buscas no existe o no tienes permiso para verlo
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/pedidos">
                  <Button className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-medium hover:bg-primary/90 transition-all duration-300">
                    Ver todos mis pedidos
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="px-6 py-3 rounded-2xl font-medium">
                    Volver al inicio
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function PedidoDetailPage() {
  return (
    <ProtectedRoute>
      <PedidoDetailContent />
    </ProtectedRoute>
  )
}