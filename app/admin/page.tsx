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
import axios from "axios"
import Cookies from "js-cookie"

export default function AdminDashboardPage() {
  const [isClient, setIsClient] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [ventasData, setVentasData] = useState([])
  const [ingresosData, setIngresosData] = useState([])
  const [categoriaData, setCategoriaData] = useState([])
  const [pedidosRecientes, setPedidosRecientes] = useState([])
  const [productosBajoStock, setProductosBajoStock] = useState([])
  const [resumenDia, setResumenDia] = useState<any>(null)
  const [alertas, setAlertas] = useState([])

  useEffect(() => {
    setIsClient(true)
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    const token = Cookies.get("token")
    const config = { headers: { Authorization: `Bearer ${token}` } }
    const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL

    try {
      const [
        resumenRes,
        ventasRes,
        ingresosRes,
        categoriaRes,
        pedidosRes,
        stockRes,
        diaRes,
        alertasRes
      ] = await Promise.all([
        axios.get(`${baseURL}/dashboard/resumen`, config),
        axios.get(`${baseURL}/dashboard/ventas-mensuales`, config),
        axios.get(`${baseURL}/dashboard/ingresos-semanales`, config),
        axios.get(`${baseURL}/dashboard/ventas-por-categoria`, config),
        axios.get(`${baseURL}/dashboard/pedidos-recientes?limite=5`, config),
        axios.get(`${baseURL}/dashboard/productos-bajo-stock?limite=4`, config),
        axios.get(`${baseURL}/dashboard/resumen-dia`, config),
        axios.get(`${baseURL}/dashboard/alertas`, config)
      ])

      if (resumenRes.data.success) setStats(resumenRes.data.stats)
      if (ventasRes.data.success) setVentasData(ventasRes.data.data)
      if (ingresosRes.data.success) setIngresosData(ingresosRes.data.data)
      if (categoriaRes.data.success) setCategoriaData(categoriaRes.data.data)
      if (pedidosRes.data.success) setPedidosRecientes(pedidosRes.data.data)
      if (stockRes.data.success) setProductosBajoStock(stockRes.data.data)
      if (diaRes.data.success) setResumenDia(diaRes.data.data)
      if (alertasRes.data.success) setAlertas(alertasRes.data.alertas)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    }
  }

  const statsConfig = [
    {
      title: "Pedidos",
      key: "pedidos",
      icon: ShoppingCartIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      title: "Usuarios Nuevos",
      key: "usuarios_nuevos",
      icon: UsersIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
      title: "Arrendamientos Activos",
      key: "arrendamientos_activos",
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
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Resumen general y métricas del sistema
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsConfig.map((config, index) => {
          const Icon = config.icon
          const statData = stats?.[config.key]
          return (
            <Card key={index} className="glass rounded-3xl hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-2xl ${config.bgColor}`}>
                    <Icon className={`w-6 h-6 ${config.color}`} />
                  </div>
                  {statData && (
                    <div className="flex items-center gap-1">
                      {statData.trend === 'up' ? (
                        <ArrowUpIcon className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowDownIcon className="w-4 h-4 text-red-600" />
                      )}
                      <span className={`text-sm font-medium ${statData.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {statData.change > 0 ? '+' : ''}{statData.change}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-foreground">
                    {''}{statData?.value || '0'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{config.title}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="glass rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold text-foreground">
              Pedidos Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pedidosRecientes.map((pedido: any) => (
                <div 
                  key={pedido.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/20 transition-colors"
                >
                  <div>
                    <p className="font-medium text-foreground">{pedido.id_orden}</p>
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
              {productosBajoStock.map((producto: any) => (
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

      <Tabs defaultValue="resumen" className="space-y-6">
        <TabsList className="glass rounded-2xl p-1">
          <TabsTrigger 
            value="resumen" 
            className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Resumen del Día
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{resumenDia?.pedidos_hoy || 0}</p>
                  <p className="text-sm text-muted-foreground">Pedidos Hoy</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">${resumenDia?.ingresos_hoy || 0}</p>
                  <p className="text-sm text-muted-foreground">Ingresos Hoy</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{resumenDia?.usuarios_nuevos || 0}</p>
                  <p className="text-sm text-muted-foreground">Usuarios Nuevos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alertas" className="space-y-4">
          <Card className="glass rounded-3xl">
            <CardContent className="p-6">
              <div className="space-y-3">
                {alertas.map((alerta: any, index: number) => (
                  <div 
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      alerta.tipo === 'warning' 
                        ? 'bg-yellow-50 dark:bg-yellow-900/20' 
                        : 'bg-blue-50 dark:bg-blue-900/20'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      alerta.tipo === 'warning'
                        ? 'bg-yellow-100 dark:bg-yellow-800'
                        : 'bg-blue-100 dark:bg-blue-800'
                    }`}>
                      <span className={`text-sm ${
                        alerta.tipo === 'warning'
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-blue-600 dark:text-blue-400'
                      }`}>
                        {alerta.tipo === 'warning' ? '!' : '$'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{alerta.titulo}</p>
                      <p className="text-sm text-muted-foreground">{alerta.descripcion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
