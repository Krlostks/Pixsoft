"use client"

import { PackageIcon, CreditCardIcon, TruckIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"

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

interface OrderCardProps {
    pedido: Pedido
    onCancel?: (id: number) => void
}

export default function OrderCard({ pedido, onCancel }: OrderCardProps) {
    const getEstadoOrdenColor = (estado: string) => {
        switch (estado) {
            case 'pendiente': return 'bg-yellow-100 text-yellow-800'
            case 'procesando': return 'bg-blue-100 text-blue-800'
            case 'enviado': return 'bg-purple-100 text-purple-800'
            case 'entregado': return 'bg-green-100 text-green-800'
            case 'cancelado': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getEstadoPagoColor = (estado: string) => {
        switch (estado) {
            case 'pendiente': return 'bg-yellow-100 text-yellow-800'
            case 'pagado': return 'bg-green-100 text-green-800'
            case 'rechazado': return 'bg-red-100 text-red-800'
            case 'reembolsado': return 'bg-gray-100 text-gray-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getMetodoPagoTexto = (metodo: string) => {
        switch (metodo) {
            case 'tarjeta_credito': return 'Tarjeta de Crédito'
            case 'tarjeta_debito': return 'Tarjeta de Débito'
            case 'paypal': return 'PayPal'
            case 'transferencia': return 'Transferencia'
            case 'efectivo': return 'Efectivo'
            default: return metodo
        }
    }

    const getEstadoOrdenIcon = (estado: string) => {
        switch (estado) {
            case 'pendiente': return <ClockIcon className="w-4 h-4" />
            case 'procesando': return <PackageIcon className="w-4 h-4" />
            case 'enviado': return <TruckIcon className="w-4 h-4" />
            case 'entregado': return <CheckCircleIcon className="w-4 h-4" />
            case 'cancelado': return <XCircleIcon className="w-4 h-4" />
            default: return <PackageIcon className="w-4 h-4" />
        }
    }

    const fechaFormateada = format(new Date(pedido.fecha_creacion), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es })

    const productosCount = pedido.detalles.reduce((sum, detalle) => sum + detalle.cantidad, 0)

    // Convertir valores numéricos de string a number si es necesario
    const total = typeof pedido.total === 'string' ? parseFloat(pedido.total) : pedido.total
    const precioUnitario = (detalle: DetallePedido) => {
        return typeof detalle.precio_unitario === 'string' ? parseFloat(detalle.precio_unitario) : detalle.precio_unitario
    }

    return (
        <Card className="glass rounded-3xl hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
                {/* Encabezado del pedido */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h3 className="font-bold text-lg text-foreground">{pedido.numero_orden}</h3>
                        <p className="text-sm text-muted-foreground">{fechaFormateada}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <div className="inline-flex items-center rounded-md border px-1 py-0.5 text-xs font-semibold transition-colors">
                            <span className="mr-1">Entrega</span>
                            <Badge className={`ml-1 ${getEstadoOrdenColor(pedido.estado_orden)} flex items-center gap-1`}>
                                {getEstadoOrdenIcon(pedido.estado_orden)}
                                {pedido.estado_orden}
                            </Badge>
                        </div>
                        <div className="inline-flex items-center rounded-md border px-1 py-0.5 text-xs font-semibold transition-colors">
                            <span className="mr-1">Pago</span>
                            <Badge className={`ml-1 ${getEstadoPagoColor(pedido.estado_pago)}`}>
                                {pedido.estado_pago}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Información del pedido */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <PackageIcon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">Productos</span>
                        </div>
                        <p className="text-lg font-semibold">{productosCount}</p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <CreditCardIcon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">Método de Pago</span>
                        </div>
                        <p className="text-sm">{getMetodoPagoTexto(pedido.metodo_pago)}</p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">Total</span>
                        </div>
                        <p className="text-2xl font-bold text-primary">${total.toFixed(2)}</p>
                    </div>
                </div>

                {/* Acciones */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/30">
                    <Link
                        href={`/pedidos/${pedido.id}`}
                        className="flex-1"
                    >
                        <Button variant="outline" className="w-full">
                            Ver Detalles Completos
                        </Button>
                    </Link>

                    {pedido.estado_orden !== 'cancelado' &&
                        pedido.estado_orden !== 'entregado' &&
                        onCancel && (
                            <Button
                                variant="outline"
                                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => onCancel(pedido.id)}
                            >
                                Cancelar Pedido
                            </Button>
                        )}
                </div>
            </CardContent>
        </Card>
    )
}