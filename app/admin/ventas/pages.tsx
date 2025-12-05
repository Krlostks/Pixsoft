"use client"

import { useState } from "react"
import { 
  SearchIcon, 
  FilterIcon, 
  DownloadIcon, 
  EyeIcon,
  FileTextIcon,
  CalendarIcon,
  DollarSignIcon,
  TrendingUpIcon,
  UsersIcon
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// Datos de ejemplo
const ventasData = [
  { id: 'ORD-001', cliente: 'Juan Pérez', total: 1250, metodo: 'tarjeta', estado: 'entregado', fecha: '2024-06-05' },
  { id: 'ORD-002', cliente: 'María López', total: 890, metodo: 'paypal', estado: 'enviado', fecha: '2024-06-04' },
  { id: 'ORD-003', cliente: 'Carlos Ruiz', total: 2100, metodo: 'transferencia', estado: 'procesando', fecha: '2024-06-03' },
  { id: 'ORD-004', cliente: 'Ana García', total: 540, metodo: 'efectivo', estado: 'pendiente', fecha: '2024-06-02' },
  { id: 'ORD-005', cliente: 'Pedro Martínez', total: 1760, metodo: 'tarjeta', estado: 'entregado', fecha: '2024-06-01' },
  { id: 'ORD-006', cliente: 'Laura Sánchez', total: 3200, metodo: 'paypal', estado: 'entregado', fecha: '2024-05-30' },
  { id: 'ORD-007', cliente: 'Miguel Torres', total: 950, metodo: 'tarjeta', estado: 'cancelado', fecha: '2024-05-29' },
  { id: 'ORD-008', cliente: 'Sofía Ramírez', total: 1450, metodo: 'transferencia', estado: 'enviado', fecha: '2024-05-28' },
]

export default function VentasAdminPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [dateFilter, setDateFilter] = useState("todos")

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'entregado': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'enviado': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'procesando': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'pendiente': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
      case 'cancelado': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getMetodoPago = (metodo: string) => {
    switch (metodo) {
      case 'tarjeta': return 'Tarjeta'
      case 'paypal': return 'PayPal'
      case 'transferencia': return 'Transferencia'
      case 'efectivo': return 'Efectivo'
      default: return metodo
    }
  }

  const filteredVentas = ventasData.filter(venta => {
    const matchesSearch = venta.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         venta.cliente.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'todos' || venta.estado === statusFilter
    // Aquí podrías añadir más filtros si los necesitas
    return matchesSearch && matchesStatus
  })

  const stats = [
    { title: "Ventas Totales", value: "$12,540", icon: DollarSignIcon, color: "text-green-600" },
    { title: "Pedidos Este Mes", value: "48", icon: FileTextIcon, color: "text-blue-600" },
    { title: "Tasa de Conversión", value: "3.8%", icon: TrendingUpIcon, color: "text-purple-600" },
    { title: "Clientes Nuevos", value: "15", icon: UsersIcon, color: "text-orange-600" },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ventas</h1>
          <p className="text-muted-foreground mt-2">
            Gestión y seguimiento de todas las ventas
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl gap-2">
            <DownloadIcon className="w-4 h-4" />
            Exportar
          </Button>
          <Button className="rounded-xl gap-2">
            <FileTextIcon className="w-4 h-4" />
            Nuevo Reporte
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="glass rounded-3xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground mt-1">{stat.title}</p>
                  </div>
                  <div className={`p-3 rounded-2xl bg-secondary/20`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filtros */}
      <Card className="glass rounded-3xl">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por ID o cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] rounded-xl">
                  <SelectValue placeholder="Estado" />
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

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[150px] rounded-xl">
                  <SelectValue placeholder="Fecha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas las fechas</SelectItem>
                  <SelectItem value="hoy">Hoy</SelectItem>
                  <SelectItem value="semana">Esta semana</SelectItem>
                  <SelectItem value="mes">Este mes</SelectItem>
                  <SelectItem value="trimestre">Este trimestre</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="rounded-xl gap-2">
                <FilterIcon className="w-4 h-4" />
                Más filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de ventas */}
      <Card className="glass rounded-3xl overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-foreground">
            Historial de Ventas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader className="bg-secondary/20">
                <TableRow>
                  <TableHead className="font-semibold">ID Pedido</TableHead>
                  <TableHead className="font-semibold">Cliente</TableHead>
                  <TableHead className="font-semibold">Total</TableHead>
                  <TableHead className="font-semibold">Método Pago</TableHead>
                  <TableHead className="font-semibold">Estado</TableHead>
                  <TableHead className="font-semibold">Fecha</TableHead>
                  <TableHead className="font-semibold text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVentas.map((venta) => (
                  <TableRow key={venta.id} className="hover:bg-secondary/10">
                    <TableCell className="font-medium">{venta.id}</TableCell>
                    <TableCell>{venta.cliente}</TableCell>
                    <TableCell className="font-bold">${venta.total}</TableCell>
                    <TableCell>{getMetodoPago(venta.metodo)}</TableCell>
                    <TableCell>
                      <Badge className={`${getEstadoColor(venta.estado)}`}>
                        {venta.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(venta.fecha), "dd/MM/yyyy", { locale: es })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="rounded-xl">
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredVentas.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/20 flex items-center justify-center">
                <SearchIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No se encontraron ventas
              </h3>
              <p className="text-muted-foreground">
                Intenta con otros filtros de búsqueda
              </p>
            </div>
          )}

          {/* Paginación */}
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              Mostrando {filteredVentas.length} de {ventasData.length} ventas
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-xl" disabled>
                Anterior
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl bg-primary text-primary-foreground">
                1
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl">
                2
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl">
                3
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl">
                Siguiente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}