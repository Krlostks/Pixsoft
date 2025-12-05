"use client"

import { useState } from "react"
import { 
  SearchIcon, 
  PlusIcon, 
  PackageIcon, 
  FilterIcon,
  EditIcon,
  TrashIcon,
  AlertCircleIcon,
  DollarSignIcon
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// Datos de ejemplo
const productosData = [
  { id: 1, sku: 'SKU-001', nombre: 'Laptop Dell XPS 13', categoria: 'Electrónica', precio: 25999, stock: 12, estado: 'activo' },
  { id: 2, sku: 'SKU-002', nombre: 'Mouse Inalámbrico Logitech', categoria: 'Electrónica', precio: 899, stock: 45, estado: 'activo' },
  { id: 3, sku: 'SKU-003', nombre: 'Teclado Mecánico RGB', categoria: 'Electrónica', precio: 1499, stock: 8, estado: 'bajo_stock' },
  { id: 4, sku: 'SKU-004', nombre: 'Monitor 27" 4K', categoria: 'Electrónica', precio: 8999, stock: 3, estado: 'bajo_stock' },
  { id: 5, sku: 'SKU-005', nombre: 'Silla Gamer Ergonómica', categoria: 'Hogar', precio: 4599, stock: 15, estado: 'activo' },
  { id: 6, sku: 'SKU-006', nombre: 'Audífonos Sony WH-1000XM4', categoria: 'Electrónica', precio: 6999, stock: 22, estado: 'activo' },
  { id: 7, sku: 'SKU-007', nombre: 'Tablet Samsung Galaxy Tab S8', categoria: 'Electrónica', precio: 12999, stock: 0, estado: 'agotado' },
  { id: 8, sku: 'SKU-008', nombre: 'Smart Watch Apple Watch Series 8', categoria: 'Electrónica', precio: 8999, stock: 18, estado: 'activo' },
]

export default function InventarioAdminPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("todas")
  const [statusFilter, setStatusFilter] = useState("todos")

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'bajo_stock': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'agotado': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEstadoText = (estado: string) => {
    switch (estado) {
      case 'activo': return 'Activo'
      case 'bajo_stock': return 'Bajo Stock'
      case 'agotado': return 'Agotado'
      default: return estado
    }
  }

  const filteredProductos = productosData.filter(producto => {
    const matchesSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         producto.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'todas' || producto.categoria === categoryFilter
    const matchesStatus = statusFilter === 'todos' || producto.estado === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const categorias = [...new Set(productosData.map(p => p.categoria))]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventario</h1>
          <p className="text-muted-foreground mt-2">
            Gestión de productos y stock
          </p>
        </div>
        <div className="flex gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="rounded-xl gap-2">
                <PlusIcon className="w-4 h-4" />
                Nuevo Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="glass rounded-3xl max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Nuevo Producto</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-muted-foreground">Formulario para nuevo producto...</p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">123</p>
                <p className="text-sm text-muted-foreground mt-1">Productos Totales</p>
              </div>
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20">
                <PackageIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">8</p>
                <p className="text-sm text-muted-foreground mt-1">Bajo Stock</p>
              </div>
              <div className="p-3 rounded-2xl bg-yellow-50 dark:bg-yellow-900/20">
                <AlertCircleIcon className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">5</p>
                <p className="text-sm text-muted-foreground mt-1">Agotados</p>
              </div>
              <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-900/20">
                <AlertCircleIcon className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">$456,789</p>
                <p className="text-sm text-muted-foreground mt-1">Valor Total</p>
              </div>
              <div className="p-3 rounded-2xl bg-green-50 dark:bg-green-900/20">
                <DollarSignIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="glass rounded-3xl">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por SKU o nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px] rounded-xl">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las categorías</SelectItem>
                  {categorias.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] rounded-xl">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="bajo_stock">Bajo Stock</SelectItem>
                  <SelectItem value="agotado">Agotado</SelectItem>
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

      {/* Tabla de productos */}
      <Card className="glass rounded-3xl overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-foreground">
            Productos del Inventario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader className="bg-secondary/20">
                <TableRow>
                  <TableHead className="font-semibold">SKU</TableHead>
                  <TableHead className="font-semibold">Nombre</TableHead>
                  <TableHead className="font-semibold">Categoría</TableHead>
                  <TableHead className="font-semibold">Precio</TableHead>
                  <TableHead className="font-semibold">Stock</TableHead>
                  <TableHead className="font-semibold">Estado</TableHead>
                  <TableHead className="font-semibold text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProductos.map((producto) => (
                  <TableRow key={producto.id} className="hover:bg-secondary/10">
                    <TableCell className="font-medium">{producto.sku}</TableCell>
                    <TableCell className="font-medium">{producto.nombre}</TableCell>
                    <TableCell>{producto.categoria}</TableCell>
                    <TableCell className="font-bold">${producto.precio}</TableCell>
                    <TableCell>
                      <span className={producto.stock < 10 ? 'text-red-600 dark:text-red-400 font-bold' : 'text-foreground'}>
                        {producto.stock} unidades
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getEstadoColor(producto.estado)}`}>
                        {getEstadoText(producto.estado)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="rounded-xl">
                          <EditIcon className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50">
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              Mostrando {filteredProductos.length} de {productosData.length} productos
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