"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import { toast } from "sonner"
import Link from "next/link"
import { 
  ArrowLeftIcon, 
  PackageIcon, 
  FilterIcon
} from "@/components/icons"

import OrderCard from "@/components/pedidos/OrderCard"
import EmptyOrders from "@/components/pedidos/EmptyOrders"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DetallePedido {
  id: number
  producto_id: number
  producto_nombre: string
  producto_url_imagen: string
  cantidad: number
  precio_unitario: string | number
  es_arrendamiento: boolean
}

interface Pedido {
  id: number
  numero_orden: string
  total: string | number
  estado_orden: 'pendiente' | 'procesando' | 'enviado' | 'entregado' | 'cancelado'
  estado_pago: 'pendiente' | 'pagado' | 'rechazado' | 'reembolsado'
  metodo_pago: 'tarjeta_credito' | 'tarjeta_debito' | 'paypal' | 'transferencia' | 'efectivo'
  fecha_creacion: string
  detalles: DetallePedido[]
  subtotal: string | number
  envio: string | number
  iva: string | number
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")

  // Verificar token
  useEffect(() => {
    const t = Cookies.get("token")
    setToken(t || null)
  }, [])

  // Obtener pedidos
  const fetchPedidos = useCallback(async () => {
    if (!token) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await axios.get<Pedido[]>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/pedidos/`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      setPedidos(response.data)
    } catch (error: any) {
      console.error("Error al obtener pedidos:", error)
      if (error.response?.status === 401) {
        Cookies.remove("token")
        setToken(null)
        toast.error("Sesión expirada. Por favor, inicia sesión nuevamente.")
      } else {
        toast.error("Error al cargar los pedidos")
      }
      setPedidos([])
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchPedidos()
  }, [fetchPedidos])

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
      fetchPedidos() // Refrescar la lista
    } catch (error: any) {
      console.error("Error al cancelar pedido:", error)
      const errorMessage = error.response?.data || "Error al cancelar el pedido"
      toast.error(errorMessage)
    }
  }

  // Filtrar pedidos
  const pedidosFiltrados = filtroEstado === "todos" 
    ? pedidos 
    : pedidos.filter(pedido => pedido.estado_orden === filtroEstado)

  // Si no hay token, mostrar mensaje para iniciar sesión
  if (!token && !isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="pt-10 pb-20">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <Link
                href="/perfil"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors duration-300 mb-6"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span>Volver al perfil</span>
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Mis Pedidos
              </h1>
              <p className="text-muted-foreground">
                Revisa el historial y estado de tus pedidos
              </p>
            </div>

            <div className="glass rounded-3xl p-12 text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary/50 flex items-center justify-center">
                <PackageIcon className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Acceso requerido
              </h3>
              <p className="text-muted-foreground mb-6">
                Debes iniciar sesión para ver tus pedidos
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/login"
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-medium hover:bg-primary/90 transition-all duration-300"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/"
                  className="px-6 py-3 glass rounded-2xl font-medium hover:bg-secondary/50 transition-all duration-300"
                >
                  Volver al inicio
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
              href="/perfil"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors duration-300 mb-6"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Volver al perfil</span>
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Mis Pedidos
            </h1>
            <p className="text-muted-foreground">
              Revisa el historial y estado de tus pedidos
            </p>
          </div>

          {isLoading ? (
            // Loading State
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="glass rounded-3xl p-6 animate-pulse">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <div className="h-6 bg-secondary/50 rounded w-1/4" />
                      <div className="h-8 bg-secondary/50 rounded w-24" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-4 bg-secondary/50 rounded" />
                      <div className="h-4 bg-secondary/50 rounded" />
                      <div className="h-4 bg-secondary/50 rounded" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-20 bg-secondary/50 rounded" />
                      <div className="h-4 bg-secondary/50 rounded w-1/3 mx-auto" />
                    </div>
                    <div className="flex gap-3">
                      <div className="h-10 bg-secondary/50 rounded flex-1" />
                      <div className="h-10 bg-secondary/50 rounded flex-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Filtros */}
              <div className="mb-6 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FilterIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Filtrar por:</span>
                </div>
                <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Estado del pedido" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="procesando">Procesando</SelectItem>
                    <SelectItem value="enviado">Enviado</SelectItem>
                    <SelectItem value="entregado">Entregado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {pedidosFiltrados.length > 0 ? (
                <div className="space-y-6">
                  {pedidosFiltrados.map((pedido) => (
                    <OrderCard
                      key={pedido.id}
                      pedido={pedido}
                      onCancel={handleCancelarPedido}
                    />
                  ))}
                </div>
              ) : (
                <EmptyOrders 
                  title={pedidos.length === 0 ? "Aún no tienes pedidos" : "No hay pedidos con este filtro"}
                  description={pedidos.length === 0 
                    ? "Realiza tu primera compra para ver tus pedidos aquí" 
                    : "Intenta con otro filtro para ver tus pedidos"
                  }
                  showBackButton={pedidos.length === 0}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}