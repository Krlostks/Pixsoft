"use client"

import { 
  TrendingUpIcon, 
  ShoppingCartIcon, 
  UsersIcon, 
  DollarSignIcon,
  CalendarIcon,
  PackageIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// Datos de ejemplo para las gráficas
const ventasData = [
  { mes: 'Ene', ventas: 45000, pedidos: 120 },
  { mes: 'Feb', ventas: 52000, pedidos: 135 },
  { mes: 'Mar', ventas: 48000, pedidos: 110 },
  { mes: 'Abr', ventas: 61000, pedidos: 150 },
  { mes: 'May', ventas: 55000, pedidos: 140 },
  { mes: 'Jun', ventas: 72000, pedidos: 180 },
]

const ingresosData = [
  { fecha: '01/06', ingresos: 2300 },
  { fecha: '02/06', ingresos: 1800 },
  { fecha: '03/06', ingresos: 2900 },
  { fecha: '04/06', ingresos: 2500 },
  { fecha: '05/06', ingresos: 3200 },
  { fecha: '06/06', ingresos: 2800 },
  { fecha: '07/06', ingresos: 3500 },
]

const categoriaData = [
  { name: 'Electrónica', value: 35, color: '#3b82f6' },
  { name: 'Hogar', value: 25, color: '#10b981' },
  { name: 'Ropa', value: 20, color: '#8b5cf6' },
  { name: 'Deportes', value: 15, color: '#f59e0b' },
  { name: 'Otros', value: 5, color: '#ef4444' },
]

const pedidosRecientes = [
  { id: 'ORD-001', cliente: 'Juan Pérez', total: 1250, estado: 'entregado', fecha: '2024-06-05' },
  { id: 'ORD-002', cliente: 'María López', total: 890, estado: 'enviado', fecha: '2024-06-04' },
  { id: 'ORD-003', cliente: 'Carlos Ruiz', total: 2100, estado: 'procesando', fecha: '2024-06-03' },
  { id: 'ORD-004', cliente: 'Ana García', total: 540, estado: 'pendiente', fecha: '2024-06-02' },
  { id: 'ORD-005', cliente: 'Pedro Martínez', total: 1760, estado: 'entregado', fecha: '2024-06-01' },
]

const productosBajoStock = [
  { id: 1, nombre: 'Laptop Dell XPS 13', stock: 3, stock_minimo: 10 },
  { id: 2, nombre: 'Mouse Inalámbrico Logitech', stock: 5, stock_minimo: 15 },
  { id: 3, nombre: 'Teclado Mecánico RGB', stock: 8, stock_minimo: 12 },
  { id: 4, nombre: 'Monitor 27" 4K', stock: 2, stock_minimo: 5 },
]

export default function AdminDashboardPage() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const stats = [
    {
      title: "Ventas Totales",
      value: "$72,500",
      change: "+12.5%",
      trend: "up",
      icon: DollarSignIcon,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20"
    },
    {
      title: "Pedidos",
      value: "180",
      change: "+8.2%",
      trend: "up",
      icon: ShoppingCartIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      title: "Usuarios Nuevos",
      value: "45",
      change: "+15.3%",
      trend: "up",
      icon: UsersIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
      title: "Arrendamientos Activos",
      value: "28",
      change: "+5.7%",
      trend: "up",
      icon: CalendarIcon,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20"
    },
  ]

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'entregado': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'enviado': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'procesando': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'pendiente': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Resumen general y métricas del sistema
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="glass rounded-3xl hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-2xl ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="flex items-center gap-1">
                    {stat.trend === 'up' ? (
                      <ArrowUpIcon className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowDownIcon className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Gráficas y Métricas */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Gráfica principal */}
        <div className="lg:col-span-2">
          <Card className="glass rounded-3xl h-full">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground">
                Ventas Mensuales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {isClient && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ventasData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis 
                        dataKey="mes" 
                        stroke="var(--muted-foreground)"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="var(--muted-foreground)"
                        fontSize={12}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--background)',
                          borderColor: 'var(--border)',
                          borderRadius: '12px',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value) => [`$${value}`, 'Ventas']}
                      />
                      <Bar 
                        dataKey="ventas" 
                        fill="var(--primary)" 
                        radius={[4, 4, 0, 0]}
                        name="Ventas"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Métricas rápidas */}
        <div className="space-y-6">
          <Card className="glass rounded-3xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-foreground">
                Ingresos Semanales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                {isClient && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ingresosData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis 
                        dataKey="fecha" 
                        stroke="var(--muted-foreground)"
                        fontSize={10}
                      />
                      <YAxis 
                        stroke="var(--muted-foreground)"
                        fontSize={10}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--background)',
                          borderColor: 'var(--border)',
                          borderRadius: '12px'
                        }}
                        formatter={(value) => [`$${value}`, 'Ingresos']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="ingresos" 
                        stroke="var(--primary)" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass rounded-3xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-foreground">
                Ventas por Categoría
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                {isClient && (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoriaData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoriaData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--background)',
                          borderColor: 'var(--border)',
                          borderRadius: '12px'
                        }}
                        formatter={(value) => [`${value}%`, 'Porcentaje']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tablas de información */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Pedidos Recientes */}
        <Card className="glass rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold text-foreground">
              Pedidos Recientes
            </CardTitle>
            <Button variant="ghost" size="sm" className="rounded-xl">
              Ver todos
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pedidosRecientes.map((pedido) => (
                <div 
                  key={pedido.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/20 transition-colors"
                >
                  <div>
                    <p className="font-medium text-foreground">{pedido.id}</p>
                    <p className="text-sm text-muted-foreground">{pedido.cliente}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">${pedido.total}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${getEstadoColor(pedido.estado)}`}>
                      {pedido.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Productos Bajo Stock */}
        <Card className="glass rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold text-foreground">
              Productos Bajo Stock
            </CardTitle>
            <Button variant="ghost" size="sm" className="rounded-xl">
              Reabastecer
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productosBajoStock.map((producto) => (
                <div 
                  key={producto.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                      <PackageIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{producto.nombre}</p>
                      <p className="text-sm text-muted-foreground">
                        Stock mínimo: {producto.stock_minimo}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${producto.stock < 5 ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}`}>
                      {producto.stock} unidades
                    </p>
                    <p className="text-xs text-muted-foreground">Restantes</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs con más información */}
      <Tabs defaultValue="resumen" className="space-y-6">
        <TabsList className="glass rounded-2xl p-1">
          <TabsTrigger 
            value="resumen" 
            className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Resumen del Día
          </TabsTrigger>
          <TabsTrigger 
            value="metricas" 
            className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Métricas Avanzadas
          </TabsTrigger>
          <TabsTrigger 
            value="alertas" 
            className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Alertas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="space-y-4">
          <Card className="glass rounded-3xl">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">24</p>
                  <p className="text-sm text-muted-foreground">Pedidos Hoy</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">$8,450</p>
                  <p className="text-sm text-muted-foreground">Ingresos Hoy</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">12</p>
                  <p className="text-sm text-muted-foreground">Usuarios Nuevos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">94%</p>
                  <p className="text-sm text-muted-foreground">Satisfacción</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metricas" className="space-y-4">
          <Card className="glass rounded-3xl">
            <CardContent className="p-6">
              <p className="text-muted-foreground">Métricas avanzadas en desarrollo...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alertas" className="space-y-4">
          <Card className="glass rounded-3xl">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20">
                  <div className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-800 flex items-center justify-center">
                    <span className="text-yellow-600 dark:text-yellow-400 text-sm">!</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">3 productos con stock crítico</p>
                    <p className="text-sm text-muted-foreground">Requieren atención inmediata</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 text-sm">$</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Meta de ventas alcanzada al 85%</p>
                    <p className="text-sm text-muted-foreground">Faltan $4,500 para la meta mensual</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}