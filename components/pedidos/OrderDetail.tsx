"use client"

import { 
  PackageIcon, 
  CreditCardIcon, 
  TruckIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon,
  MapPinIcon,
  FileTextIcon,
  HomeIcon,
  CalendarIcon,
  PenLineIcon,
  StarIcon
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { Textarea } from "../ui/textarea"
import { DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog"
import { useState } from "react"

interface DetallePedido {
  id: number
  producto_id: number
  producto_nombre: string
  producto_url_imagen: string
  cantidad: number
  precio_unitario: string | number
  descuento_unitario: string | number
  es_arrendamiento: boolean
  periodo_arrendamiento?: string
  cantidad_periodos?: number
  fecha_inicio_arrendamiento?: string
  fecha_fin_arrendamiento?: string
}

interface PedidoDetallado {
  id: number
  numero_orden: string
  total: string | number
  subtotal: string | number
  descuento: string | number
  envio: string | number
  iva: string | number
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

interface OrderDetailProps {
  pedido: PedidoDetallado
  onCancel?: (id: number) => void
}

export default function OrderDetail({ pedido, onCancel }: OrderDetailProps) {
  const [selectedRating, setSelectedRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comentario, setComentario] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

const handleSubmitReview = async (productoId: number, ventaId: number) => {
  if (!selectedRating || !comentario.trim()) return;

  try {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];

    if (!token) {
      alert("Debes iniciar sesión para dejar una reseña.");
      return;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/opiniones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        producto_id: productoId,  // Debes pasar el id del producto actual
        venta_id: ventaId,        // Debes pasar el id de la venta correspondiente
        calificacion: selectedRating,
        comentario: comentario.trim()
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error al enviar la reseña:', data);
      alert(data.error || 'Error al enviar la reseña');
      return;
    }

    // Opcional: mostrar mensaje de éxito
    alert('Reseña enviada correctamente');

    // Limpiar inputs
    setSelectedRating(0);
    setComentario('');
    setDialogOpen(false);

    // Opcional: actualizar la lista de reseñas en la UI
    // fetchReviews(); <-- Si tienes una función que carga las reseñas del producto

  } catch (err) {
    console.error('Error al enviar la reseña:', err);
    alert('Error al enviar la reseña');
  }
};


  const toNumber = (value: string | number): number => typeof value === 'string' ? parseFloat(value) : value
  const total = toNumber(pedido.total)
  const subtotal = toNumber(pedido.subtotal)
  const descuento = toNumber(pedido.descuento)
  const envio = toNumber(pedido.envio)
  const iva = toNumber(pedido.iva)
  

  const productosNormales = pedido.detalles.filter(d => !d.es_arrendamiento)
  const productosArrendados = pedido.detalles.filter(d => d.es_arrendamiento)
  const idVenta = pedido.id;

  const fechaCreacion = format(new Date(pedido.fecha_creacion), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es })
  const fechaActualizacion = format(new Date(pedido.fecha_actualizacion), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es })

  const getEstadoOrdenColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
      case 'procesando': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800'
      case 'enviado': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 border-purple-200 dark:border-purple-800'
      case 'entregado': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800'
      case 'cancelado': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-800'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700'
    }
  }

  const getEstadoPagoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
      case 'pagado': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800'
      case 'rechazado': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-800'
      case 'reembolsado': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700'
    }
  }

  const getMetodoPagoTexto = (metodo: string) => {
    switch (metodo) {
      case 'tarjeta_credito': return 'Tarjeta de Crédito'
      case 'tarjeta_debito': return 'Tarjeta de Débito'
      case 'paypal': return 'PayPal'
      case 'transferencia': return 'Transferencia Bancaria'
      case 'efectivo': return 'Efectivo'
      default: return metodo
    }
  }

  return (
    <div className="space-y-6">

      {/* Encabezado del pedido */}
      <Card className="glass rounded-3xl dark:bg-secondary/20">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">{pedido.numero_orden}</h1>
              <p className="text-muted-foreground dark:text-muted-foreground">
                Creado el {fechaCreacion} • Última actualización: {fechaActualizacion}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={`${getEstadoOrdenColor(pedido.estado_orden)} px-3 py-1`}>
                {pedido.estado_orden.toUpperCase()}
              </Badge>
              <Badge variant="outline" className={`${getEstadoPagoColor(pedido.estado_pago)} px-3 py-1`}>
                {pedido.estado_pago.toUpperCase()}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground dark:text-muted-foreground">Método de Pago</p>
              <p className="font-medium text-foreground dark:text-foreground">{getMetodoPagoTexto(pedido.metodo_pago)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground dark:text-muted-foreground">Total de Productos</p>
              <p className="font-medium text-foreground dark:text-foreground">{pedido.detalles.reduce((sum, d) => sum + d.cantidad, 0)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground dark:text-muted-foreground">Total del Pedido</p>
              <p className="text-2xl font-bold text-primary dark:text-primary">${total.toFixed(2)}</p>
            </div>
          </div>

          {pedido.notas && (
            <div className="p-4 bg-secondary/20 dark:bg-secondary/30 rounded-xl">
              <p className="text-sm font-medium text-foreground dark:text-foreground mb-1">Notas del pedido:</p>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground">{pedido.notas}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Productos y reseñas */}
      <div className="grid lg:grid-cols-2 gap-6">

        <div className="lg:col-span-2 space-y-6">

          {/* Productos normales */}
          {productosNormales.length > 0 && (
            <Card className="glass rounded-3xl dark:bg-secondary/20 relative">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-foreground dark:text-foreground mb-4 flex items-center gap-2">
                  <PackageIcon className="w-5 h-5" />
                  Productos
                </h2>

                <div className="space-y-4">
                  {productosNormales.map((detalle) => {
                    const precio = toNumber(detalle.precio_unitario)
                    const descuentoUnitario = toNumber(detalle.descuento_unitario)
                    return (
                      <div 
                        key={detalle.id} 
                        className="flex gap-4 p-4 bg-secondary/20 dark:bg-secondary/30 rounded-xl hover:bg-secondary/30 dark:hover:bg-secondary/40 transition-colors"
                      >                        
                        {detalle.producto_url_imagen ? (
                          <img
                            src={detalle.producto_url_imagen}
                            alt={detalle.producto_nombre}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-lg bg-secondary/50 dark:bg-secondary/70 flex items-center justify-center">
                            <PackageIcon className="w-8 h-8 text-muted-foreground dark:text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-foreground dark:text-foreground">{detalle.producto_nombre}</h3>
                              {detalle.es_arrendamiento && (
                                <p className="text-sm text-blue-600 dark:text-blue-400">Arrendamiento</p>
                              )}
                            </div>
                            <p className="font-bold text-lg text-foreground dark:text-foreground">${(precio * detalle.cantidad).toFixed(2)}</p>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <div>
                              <p className="text-sm text-foreground dark:text-foreground">${precio.toFixed(2)} c/u</p>
                              {descuentoUnitario > 0 && (
                                <p className="text-sm text-green-600 dark:text-green-400">Descuento: ${descuentoUnitario.toFixed(2)} c/u</p>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground dark:text-muted-foreground">Cantidad: {detalle.cantidad}</p>
                          </div>
                          {/* Botón y panel de reseña */}
                <div className="p-6 border-t border-secondary/30 dark:border-secondary/50">
                  <Button
                    onClick={() => setDialogOpen(!dialogOpen)}
                    className="gap-2 rounded-2xl px-6 py-4 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 dark:from-cyan-700 dark:to-cyan-600 dark:hover:from-cyan-600 dark:hover:to-cyan-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30 transition-all duration-300 w-full"
                  >
                    <PenLineIcon className="w-5 h-5" />
                    Escribir reseña
                  </Button>

                {dialogOpen && (
                  <div className="mt-4 p-4 rounded-2xl bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm border border-cyan-200/50 dark:border-slate-700/50 transition-all duration-300">
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-foreground dark:text-foreground">Escribe tu reseña</h3>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground">Comparte tu experiencia con este producto</p>
                    </div>

                    <div className="space-y-4 pt-2">
                      {/* Selector de estrellas */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Tu calificación</label>
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map(star => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setSelectedRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              className="p-1 transition-transform hover:scale-110"
                            >
                              <StarIcon
                                className={`w-8 h-8 transition-colors ${
                                  star <= (hoverRating || selectedRating)
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-slate-300 dark:text-slate-600"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Comentario */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Tu comentario</label>
                        <Textarea
                          placeholder="Cuéntanos qué te pareció el producto..."
                          value={comentario}
                          onChange={(e) => setComentario(e.target.value)}
                          className="min-h-[120px] rounded-2xl resize-none border-slate-200 dark:border-slate-700 focus:border-cyan-500 dark:focus:border-cyan-600"
                        />
                      </div>

                      <Button
                        onClick={() => handleSubmitReview(detalle.producto_id, idVenta)} // Aquí pasamos los ids correctos
                        disabled={selectedRating === 0 || !comentario.trim()}
                        className="w-full rounded-2xl py-4 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 dark:from-cyan-700 dark:to-cyan-600 disabled:from-slate-300 disabled:to-slate-300 dark:disabled:from-slate-700 dark:disabled:to-slate-700 text-white transition-all duration-300"
                      >
                        Publicar reseña
                      </Button>

                    </div>
                  </div>
                )}

              </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>

              
            </Card>
          )}

          {/* Productos arrendados */}
          {productosArrendados.length > 0 && (
            <Card className="glass rounded-3xl dark:bg-secondary/20">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-foreground dark:text-foreground mb-4 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Productos Arrendados
                </h2>
                <div className="space-y-4">
                  {productosArrendados.map((detalle) => {
                    const precio = toNumber(detalle.precio_unitario)
                    return (
                      <div key={detalle.id} className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                        <div className="flex gap-4">
                          {detalle.producto_url_imagen ? (
                            <img src={detalle.producto_url_imagen} alt={detalle.producto_nombre} className="w-20 h-20 rounded-lg object-cover"/>
                          ) : (
                            <div className="w-20 h-20 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                              <CalendarIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground dark:text-foreground">{detalle.producto_nombre}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                              <div>
                                <p className="text-sm font-medium text-foreground dark:text-foreground">Periodo</p>
                                <p className="text-sm text-muted-foreground dark:text-muted-foreground">{detalle.periodo_arrendamiento} ({detalle.cantidad_periodos} veces)</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground dark:text-foreground">Duración</p>
                                <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                                  {detalle.fecha_inicio_arrendamiento && format(new Date(detalle.fecha_inicio_arrendamiento), "dd/MM/yyyy", { locale: es })} - 
                                  {detalle.fecha_fin_arrendamiento && format(new Date(detalle.fecha_fin_arrendamiento), "dd/MM/yyyy", { locale: es })}
                                </p>
                              </div>
                            </div>
                            <div className="flex justify-between items-center mt-3">
                              <p className="font-bold text-blue-600 dark:text-blue-400">${(precio * detalle.cantidad).toFixed(2)} total</p>
                              <p className="text-sm text-muted-foreground dark:text-muted-foreground">Cantidad: {detalle.cantidad}</p>
                            </div>
                          </div>
                        </div>
                          <div className="p-6 border-t border-secondary/30 dark:border-secondary/50">
                  <Button
                    onClick={() => setDialogOpen(!dialogOpen)}
                    className="gap-2 rounded-2xl px-6 py-4 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 dark:from-cyan-700 dark:to-cyan-600 dark:hover:from-cyan-600 dark:hover:to-cyan-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30 transition-all duration-300 w-full"
                  >
                    <PenLineIcon className="w-5 h-5" />
                    Escribir reseña
                  </Button>

                {dialogOpen && (
                  <div className="mt-4 p-4 rounded-2xl bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm border border-cyan-200/50 dark:border-slate-700/50 transition-all duration-300">
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-foreground dark:text-foreground">Escribe tu reseña</h3>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground">Comparte tu experiencia con este producto</p>
                    </div>

                    <div className="space-y-4 pt-2">
                      {/* Selector de estrellas */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Tu calificación</label>
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map(star => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setSelectedRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              className="p-1 transition-transform hover:scale-110"
                            >
                              <StarIcon
                                className={`w-8 h-8 transition-colors ${
                                  star <= (hoverRating || selectedRating)
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-slate-300 dark:text-slate-600"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Comentario */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Tu comentario</label>
                        <Textarea
                          placeholder="Cuéntanos qué te pareció el producto..."
                          value={comentario}
                          onChange={(e) => setComentario(e.target.value)}
                          className="min-h-[120px] rounded-2xl resize-none border-slate-200 dark:border-slate-700 focus:border-cyan-500 dark:focus:border-cyan-600"
                        />
                      </div>

                      <Button
                        onClick={() => handleSubmitReview(detalle.producto_id, idVenta)} // Aquí pasamos los ids correctos
                        disabled={selectedRating === 0 || !comentario.trim()}
                        className="w-full rounded-2xl py-4 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 dark:from-cyan-700 dark:to-cyan-600 disabled:from-slate-300 disabled:to-slate-300 dark:disabled:from-slate-700 dark:disabled:to-slate-700 text-white transition-all duration-300"
                      >
                        Publicar reseña
                      </Button>

                    </div>
                  </div>
                )}

              </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>


      </div>
    </div>
  )
}
