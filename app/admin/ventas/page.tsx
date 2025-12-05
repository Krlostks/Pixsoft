"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import { 
  ShoppingCartIcon,
  SearchIcon,
  FilterIcon,
  DollarSignIcon,
  PackageIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarIcon,
  DownloadIcon,
  EyeIcon,
  MoreVerticalIcon,
  Loader2Icon,
  BarChartIcon,
  TrendingUpIcon,
  UsersIcon,
  PersonStanding
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { toast } from "sonner"

interface Venta {
  id: number
  numero_orden: string
  cliente_id: number
  cliente_nombre: string
  cliente_apellido: string
  cliente_email: string
  subtotal: number
  descuento: number
  envio: number
  iva: number
  total: number
  metodo_pago: string
  estado_pago: string
  estado_orden: string
  notas: string | null
  fecha_creacion: string
  fecha_actualizacion: string
}

interface VentaDetalle {
  id: number
  producto_nombre: string
  producto_sku: string
  cantidad: number
  precio_unitario: number
  descuento_unitario: number
  es_arrendamiento: boolean
  periodo_arrendamiento: string | null
  cantidad_periodos: number | null
}

interface Estadisticas {
  resumen: {
    total_ventas: number
    ingresos_totales: number
    ticket_promedio: number
    clientes_unicos: number
  }
  porEstado: Array<{ estado_orden: string, cantidad: number, total: number }>
  porMes: Array<{ mes: string, cantidad: number, total: number }>
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function AdminVentasPage() {
  const [ventas, setVentas] = useState<Venta[]>([])
  const [filteredVentas, setFilteredVentas] = useState<Venta[]>([])
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingEstadisticas, setLoadingEstadisticas] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    estado_orden: "all",
    estado_pago: "all",
    metodo_pago: "all",
    fecha_inicio: "",
    fecha_fin: ""
  })
  const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null)
  const [ventaDetalles, setVentaDetalles] = useState<VentaDetalle[]>([])
  const [loadingDetalles, setLoadingDetalles] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null)

  const estadoOrdenOptions = [
    { value: "pendiente", label: "Pendiente", color: "bg-yellow-100 text-yellow-800", icon: ClockIcon },
    { value: "procesando", label: "Procesando", color: "bg-blue-100 text-blue-800", icon: PackageIcon },
    { value: "enviado", label: "Enviado", color: "bg-purple-100 text-purple-800", icon: TruckIcon },
    { value: "entregado", label: "Entregado", color: "bg-green-100 text-green-800", icon: CheckCircleIcon },
    { value: "cancelado", label: "Cancelado", color: "bg-red-100 text-red-800", icon: XCircleIcon }
  ]

  const estadoPagoOptions = [
    { value: "pendiente", label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
    { value: "pagado", label: "Pagado", color: "bg-green-100 text-green-800" },
    { value: "rechazado", label: "Rechazado", color: "bg-red-100 text-red-800" },
    { value: "reembolsado", label: "Reembolsado", color: "bg-gray-100 text-gray-800" }
  ]

  const metodoPagoOptions = [
    { value: "tarjeta_credito", label: "Tarjeta Crédito" },
    { value: "tarjeta_debito", label: "Tarjeta Débito" },
    { value: "paypal", label: "PayPal" },
    { value: "transferencia", label: "Transferencia" },
    { value: "efectivo", label: "Efectivo" }
  ]

  useEffect(() => {
    fetchVentas()
    fetchEstadisticas()
  }, [])

  useEffect(() => {
    filterVentas()
  }, [ventas, searchTerm, filters])

  const fetchVentas = async () => {
    try {
      setLoading(true)
      const token = Cookies.get("token")
      const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL
      
      const response = await axios.get(`${baseURL}/ventas/admin`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          limit: 15
        }
      })
      
      if (response.data.success) {
        setVentas(response.data.ventas)
      }
    } catch (error) {
      console.error("Error fetching ventas:", error)
      toast.error("Error al cargar las ventas")
    } finally {
      setLoading(false)
    }
  }

  const fetchEstadisticas = async () => {
    try {
      setLoadingEstadisticas(true)
      const token = Cookies.get("token")
      const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL
      
      const response = await axios.get(`${baseURL}/ventas/estadisticas/resumen`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        setEstadisticas(response.data)
      }
    } catch (error) {
      console.error("Error fetching estadísticas:", error)
    } finally {
      setLoadingEstadisticas(false)
    }
  }

  const fetchVentaDetalles = async (ventaId: number) => {
    try {
      setLoadingDetalles(true)
      const token = Cookies.get("token")
      const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL
      
      const response = await axios.get(`${baseURL}/ventas/${ventaId}/detalles`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        setVentaDetalles(response.data.detalles)
      }
    } catch (error) {
      console.error("Error fetching detalles:", error)
      toast.error("Error al cargar los detalles de la venta")
    } finally {
      setLoadingDetalles(false)
    }
  }

  const filterVentas = () => {
    let filtered = [...ventas]

    // Aplicar búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(venta => 
        venta.numero_orden.toLowerCase().includes(term) ||
        venta.cliente_nombre?.toLowerCase().includes(term) ||
        venta.cliente_apellido?.toLowerCase().includes(term) ||
        venta.cliente_email?.toLowerCase().includes(term)
      )
    }

    // Aplicar filtros
    if (filters.estado_orden !== "all") {
      filtered = filtered.filter(venta => venta.estado_orden === filters.estado_orden)
    }

    if (filters.estado_pago !== "all") {
      filtered = filtered.filter(venta => venta.estado_pago === filters.estado_pago)
    }

    if (filters.metodo_pago !== "all") {
      filtered = filtered.filter(venta => venta.metodo_pago === filters.metodo_pago)
    }

    if (filters.fecha_inicio) {
      const fechaInicio = new Date(filters.fecha_inicio)
      filtered = filtered.filter(venta => new Date(venta.fecha_creacion) >= fechaInicio)
    }

    if (filters.fecha_fin) {
      const fechaFin = new Date(filters.fecha_fin)
      fechaFin.setHours(23, 59, 59, 999)
      filtered = filtered.filter(venta => new Date(venta.fecha_creacion) <= fechaFin)
    }

    setFilteredVentas(filtered)
  }

  const handleUpdateStatus = async (ventaId: number, field: 'estado_orden' | 'estado_pago', value: string) => {
    try {
      setUpdatingStatus(ventaId)
      const token = Cookies.get("token")
      const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL

      const data = field === 'estado_orden' 
        ? { estado_orden: value }
        : { estado_pago: value }

      const response = await axios.put(
        `${baseURL}/ventas/${ventaId}/estado/admin`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data.success) {
        // Actualizar la venta localmente
        setVentas(prev => prev.map(venta => 
          venta.id === ventaId ? { ...venta, [field]: value } : venta
        ))

        toast.success("Estado actualizado exitosamente")
      }
    } catch (error: any) {
      console.error("Error updating status:", error)
      toast.error(error.response?.data?.message || "Error al actualizar el estado")
    } finally {
      setUpdatingStatus(null)
    }
  }

  const getEstadoBadge = (estado: string, type: 'orden' | 'pago') => {
    const options = type === 'orden' ? estadoOrdenOptions : estadoPagoOptions
    const option = options.find(opt => opt.value === estado) || options[0]
    const Icon = 'icon' in option ? option.icon : ClockIcon
    
    return (
      <Badge className={`${option.color} flex items-center gap-1`}>
        {'icon' in option && <PersonStanding className="w-3 h-3" />}
        {option.label}
      </Badge>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleViewDetails = (venta: Venta) => {
    setSelectedVenta(venta)
    fetchVentaDetalles(venta.id)
  }

  const exportToCSV = () => {
    const headers = ["ID", "Orden", "Cliente", "Total", "Estado Orden", "Estado Pago", "Fecha"]
    const csvContent = [
      headers.join(","),
      ...filteredVentas.map(v => [
        v.id,
        v.numero_orden,
        `${v.cliente_nombre} ${v.cliente_apellido}`,
        v.total,
        v.estado_orden,
        v.estado_pago,
        v.fecha_creacion
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ventas_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20">
            <ShoppingCartIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestión de Ventas</h1>
            <p className="text-muted-foreground mt-2">
              Administra y monitorea todas las ventas del sistema
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      {!loadingEstadisticas && estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20">
                  <ShoppingCartIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Ventas Totales</span>
              </div>
              <p className="text-2xl font-bold text-foreground mt-4">
                {estadisticas.resumen.total_ventas}
              </p>
            </CardContent>
          </Card>

          <Card className="glass rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-green-50 dark:bg-green-900/20">
                  <DollarSignIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Ingresos Totales</span>
              </div>
              <p className="text-2xl font-bold text-foreground mt-4">
                {formatCurrency(estadisticas.resumen.ingresos_totales)}
              </p>
            </CardContent>
          </Card>

          <Card className="glass rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-900/20">
                  <TrendingUpIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Ticket Promedio</span>
              </div>
              <p className="text-2xl font-bold text-foreground mt-4">
                {formatCurrency(estadisticas.resumen.ticket_promedio)}
              </p>
            </CardContent>
          </Card>

          <Card className="glass rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-orange-50 dark:bg-orange-900/20">
                  <UsersIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Clientes Únicos</span>
              </div>
              <p className="text-2xl font-bold text-foreground mt-4">
                {estadisticas.resumen.clientes_unicos}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráficos */}
      {!loadingEstadisticas && estadisticas && (
        <div className="grid grid-cols-1 gap-8">
          <Card className="glass rounded-3xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground">
                Ventas por Mes (Últimos 6 meses)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={estadisticas.porMes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="mes" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { month: 'short' })}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(Number(value)), 'Ingresos']}
                    labelFormatter={(label) => `Mes: ${new Date(label).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`}
                  />
                  <Bar dataKey="total" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros y Búsqueda */}
      <Card className="glass rounded-3xl">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row gap-4 md:items-center">
              <div className="flex-1 relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por orden, cliente o email..."
                  className="pl-10 rounded-xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Button 
                variant="outline" 
                className="rounded-xl flex items-center gap-2"
                onClick={exportToCSV}
              >
                <DownloadIcon className="w-4 h-4" />
                Exportar CSV
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="flex items-center gap-2">
                <FilterIcon className="w-4 h-4 text-muted-foreground" />
                <Select 
                  value={filters.estado_orden} 
                  onValueChange={(value) => setFilters({...filters, estado_orden: value})}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Estado Orden" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    {estadoOrdenOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Select 
                value={filters.estado_pago} 
                onValueChange={(value) => setFilters({...filters, estado_pago: value})}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Estado Pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los pagos</SelectItem>
                  {estadoPagoOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={filters.metodo_pago} 
                onValueChange={(value) => setFilters({...filters, metodo_pago: value})}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Método Pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los métodos</SelectItem>
                  {metodoPagoOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="date"
                placeholder="Fecha inicio"
                className="rounded-xl"
                value={filters.fecha_inicio}
                onChange={(e) => setFilters({...filters, fecha_inicio: e.target.value})}
              />

              <Input
                type="date"
                placeholder="Fecha fin"
                className="rounded-xl"
                value={filters.fecha_fin}
                onChange={(e) => setFilters({...filters, fecha_fin: e.target.value})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Ventas */}
      <Card className="glass rounded-3xl overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-foreground">
              {filteredVentas.length} Ventas
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-xl"
              onClick={fetchVentas}
            >
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredVentas.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCartIcon className="w-12 h-12 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground mt-4">No se encontraron ventas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/20">
                    <TableHead className="font-medium">Orden</TableHead>
                    <TableHead className="font-medium">Cliente</TableHead>
                    <TableHead className="font-medium">Total</TableHead>
                    <TableHead className="font-medium">Estado Orden</TableHead>
                    <TableHead className="font-medium">Estado Pago</TableHead>
                    <TableHead className="font-medium">Método</TableHead>
                    <TableHead className="font-medium">Fecha</TableHead>
                    <TableHead className="font-medium text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVentas.map((venta) => (
                    <TableRow key={venta.id} className="hover:bg-secondary/10">
                      <TableCell className="font-medium">
                        {venta.numero_orden}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {venta.cliente_nombre} {venta.cliente_apellido}
                          </p>
                          <p className="text-sm text-muted-foreground">{venta.cliente_email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold">
                        {formatCurrency(venta.total)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <div className="cursor-pointer">
                              {getEstadoBadge(venta.estado_orden, 'orden')}
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            {estadoOrdenOptions.map((option) => (
                              <DropdownMenuItem 
                                key={option.value}
                                onClick={() => handleUpdateStatus(venta.id, 'estado_orden', option.value)}
                                disabled={updatingStatus === venta.id || venta.estado_orden === option.value}
                              >
                                <option.icon className="w-4 h-4 mr-2" />
                                {option.label}
                                {updatingStatus === venta.id && (
                                  <Loader2Icon className="w-3 h-3 animate-spin ml-auto" />
                                )}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <div className="cursor-pointer">
                              {getEstadoBadge(venta.estado_pago, 'pago')}
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            {estadoPagoOptions.map((option) => (
                              <DropdownMenuItem 
                                key={option.value}
                                onClick={() => handleUpdateStatus(venta.id, 'estado_pago', option.value)}
                                disabled={updatingStatus === venta.id || venta.estado_pago === option.value}
                              >
                                {option.label}
                                {updatingStatus === venta.id && (
                                  <Loader2Icon className="w-3 h-3 animate-spin ml-auto" />
                                )}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {metodoPagoOptions.find(m => m.value === venta.metodo_pago)?.label || venta.metodo_pago}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(venta.fecha_creacion)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="rounded-xl"
                              onClick={() => handleViewDetails(venta)}
                            >
                              <EyeIcon className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Detalles de la Venta #{venta.numero_orden}</DialogTitle>
                            </DialogHeader>
                            
                            {selectedVenta && (
                              <div className="space-y-6">
                                {/* Información de la venta */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-lg">Información del Cliente</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                      <p><strong>Nombre:</strong> {selectedVenta.cliente_nombre} {selectedVenta.cliente_apellido}</p>
                                      <p><strong>Email:</strong> {selectedVenta.cliente_email}</p>
                                      <p><strong>ID Cliente:</strong> {selectedVenta.cliente_id}</p>
                                    </CardContent>
                                  </Card>

                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-lg">Información de Pago</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                      <p><strong>Método:</strong> {metodoPagoOptions.find(m => m.value === selectedVenta.metodo_pago)?.label}</p>
                                      <p><strong>Estado Pago:</strong> {getEstadoBadge(selectedVenta.estado_pago, 'pago')}</p>
                                      <p><strong>Estado Orden:</strong> {getEstadoBadge(selectedVenta.estado_orden, 'orden')}</p>
                                    </CardContent>
                                  </Card>
                                </div>

                                {/* Resumen financiero */}
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Resumen Financiero</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="grid grid-cols-3 gap-4">
                                      <div>
                                        <p className="text-sm text-muted-foreground">Subtotal</p>
                                        <p className="text-md font-bold">{formatCurrency(selectedVenta.subtotal)}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Envío</p>
                                        <p className="text-md font-bold">{formatCurrency(selectedVenta.envio)}</p>
                                      </div>
                                      <div className="col-span-2 md:col-span-4 border-t pt-4 mt-4">
                                        <p className="text-sm text-muted-foreground">Total</p>
                                        <p className="text-lg font-bold text-primary">{formatCurrency(selectedVenta.total)}</p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                {/* Detalles de productos */}
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Productos</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    {loadingDetalles ? (
                                      <div className="flex justify-center py-8">
                                        <Loader2Icon className="w-8 h-8 animate-spin" />
                                      </div>
                                    ) : ventaDetalles.length === 0 ? (
                                      <p className="text-muted-foreground text-center py-8">No hay productos en esta venta</p>
                                    ) : (
                                      <div className="space-y-4">
                                        {ventaDetalles.map((detalle) => (
                                          <div key={detalle.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div>
                                              <p className="font-medium">{detalle.producto_nombre}</p>
                                              <p className="text-sm text-muted-foreground">SKU: {detalle.producto_sku}</p>
                                              {detalle.es_arrendamiento && (
                                                <Badge variant="outline" className="mt-1">
                                                  Arrendamiento: {detalle.periodo_arrendamiento}
                                                </Badge>
                                              )}
                                            </div>
                                            <div className="text-right">
                                              <p className="font-bold">{formatCurrency(detalle.precio_unitario)} x {detalle.cantidad}</p>
                                              <p className="text-lg font-bold">
                                                {formatCurrency(detalle.precio_unitario * detalle.cantidad)}
                                              </p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}