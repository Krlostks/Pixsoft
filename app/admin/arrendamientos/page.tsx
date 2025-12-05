"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import { 
  CalendarIcon,
  ClockIcon,
  DownloadIcon,
  FileTextIcon,
  FilterIcon,
  Loader2Icon,
  MailIcon,
  MoreVerticalIcon,
  RefreshCwIcon,
  SearchIcon,
  UserIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  FileIcon,
  EyeIcon,
  PrinterIcon,
  SendIcon,
  DollarSignIcon,
  AlertTriangleIcon
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"

interface Arrendamiento {
  id: number
  venta_id: number
  venta_detalle_id: number
  numero_orden: string
  cliente_id: number
  cliente_nombre: string
  cliente_email: string
  cliente_telefono: string
  producto_id: number
  producto_nombre: string
  producto_sku: string
  cantidad: number
  precio_unitario: number
  es_arrendamiento: boolean
  periodo_arrendamiento: 'diario' | 'semanal' | 'mensual' | 'anual'
  cantidad_periodos: number
  fecha_inicio_arrendamiento: string
  fecha_fin_arrendamiento: string
  dias_restantes: number
  estado: 'activo' | 'vencido' | 'cancelado' | 'finalizado'
  proximo_pago_fecha: string
  proximo_pago_monto: number
  total_pagado: number
  total_pendiente: number
  created_at: string
}

interface ContratoData {
  arrendamiento_id: number
  terminos_adicionales: string
  condiciones_especiales: string
}

export default function AdminArrendamientosPage() {
  const [arrendamientos, setArrendamientos] = useState<Arrendamiento[]>([])
  const [filteredArrendamientos, setFilteredArrendamientos] = useState<Arrendamiento[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [estadoFilter, setEstadoFilter] = useState<string>("all")
  const [periodoFilter, setPeriodoFilter] = useState<string>("all")
  const [generatingContract, setGeneratingContract] = useState<number | null>(null)
  const [sendingReminder, setSendingReminder] = useState<number | null>(null)
  const [contratoModalOpen, setContratoModalOpen] = useState(false)
  const [selectedArrendamiento, setSelectedArrendamiento] = useState<Arrendamiento | null>(null)
  const [contratoData, setContratoData] = useState<ContratoData>({
    arrendamiento_id: 0,
    terminos_adicionales: "",
    condiciones_especiales: ""
  })

  // Fetch arrendamientos activos
  const fetchArrendamientos = async () => {
    try {
        setLoading(true)
        const token = Cookies.get("token")
        const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL
        
        // Usa la ruta simple que procesa en JavaScript
        const response = await axios.get(`${baseURL}/arrendamientos/activos-simple`, {
        headers: { Authorization: `Bearer ${token}` }
        })
        
        setArrendamientos(response.data)
    } catch (error) {
        console.error("Error fetching arrendamientos:", error)
        toast.error("Error al cargar los arrendamientos")
    } finally {
        setLoading(false)
    }
    }

  // Filtrar arrendamientos
  useEffect(() => {
    let filtered = [...arrendamientos]

    // Búsqueda por cliente o producto
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(item => 
        item.cliente_nombre.toLowerCase().includes(term) ||
        item.cliente_email.toLowerCase().includes(term) ||
        item.producto_nombre.toLowerCase().includes(term) ||
        item.numero_orden.toLowerCase().includes(term)
      )
    }

    // Filtro por estado
    if (estadoFilter !== "all") {
      filtered = filtered.filter(item => item.estado === estadoFilter)
    }

    // Filtro por periodo
    if (periodoFilter !== "all") {
      filtered = filtered.filter(item => item.periodo_arrendamiento === periodoFilter)
    }

    setFilteredArrendamientos(filtered)
  }, [arrendamientos, searchTerm, estadoFilter, periodoFilter])

  // Generar contrato
  const handleGenerateContract = async (arrendamiento: Arrendamiento) => {
    try {
      setGeneratingContract(arrendamiento.id)
      const token = Cookies.get("token")
      const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL

      const response = await axios.post(
        `${baseURL}/arrendamientos/generar-contrato`,
        { venta_detalle_id: arrendamiento.venta_detalle_id },
        { 
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      )

      // Crear y descargar el PDF
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `contrato-arrendamiento-${arrendamiento.numero_orden}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      toast.success("Contrato generado exitosamente")
    } catch (error) {
      console.error("Error generando contrato:", error)
      toast.error("Error al generar el contrato")
    } finally {
      setGeneratingContract(null)
    }
  }

  // Enviar recordatorio
  const handleSendReminder = async (arrendamiento: Arrendamiento) => {
    try {
      setSendingReminder(arrendamiento.id)
      const token = Cookies.get("token")
      const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL

      await axios.post(
        `${baseURL}/arrendamientos/enviar-recordatorio`,
        { venta_detalle_id: arrendamiento.venta_detalle_id },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      toast.success("Recordatorio enviado al cliente")
    } catch (error) {
      console.error("Error enviando recordatorio:", error)
      toast.error("Error al enviar el recordatorio")
    } finally {
      setSendingReminder(null)
    }
  }

  // Generar contrato con términos personalizados
  const handleGenerateCustomContract = async () => {
    if (!selectedArrendamiento) return

    try {
      setGeneratingContract(selectedArrendamiento.id)
      const token = Cookies.get("token")
      const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL

      const response = await axios.post(
        `${baseURL}/arrendamientos/generar-contrato-personalizado`,
        {
          venta_detalle_id: selectedArrendamiento.venta_detalle_id,
          terminos_adicionales: contratoData.terminos_adicionales,
          condiciones_especiales: contratoData.condiciones_especiales
        },
        { 
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      )

      // Crear y descargar el PDF
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `contrato-personalizado-${selectedArrendamiento.numero_orden}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      toast.success("Contrato personalizado generado")
      setContratoModalOpen(false)
    } catch (error) {
      console.error("Error generando contrato personalizado:", error)
      toast.error("Error al generar el contrato")
    } finally {
      setGeneratingContract(null)
    }
  }

  // Abrir modal para contrato personalizado
  const openCustomContractModal = (arrendamiento: Arrendamiento) => {
    setSelectedArrendamiento(arrendamiento)
    setContratoData({
      arrendamiento_id: arrendamiento.id,
      terminos_adicionales: "",
      condiciones_especiales: ""
    })
    setContratoModalOpen(true)
  }

  // Calcular progreso del arrendamiento
  const calcularProgreso = (inicio: string, fin: string) => {
    const start = new Date(inicio).getTime()
    const end = new Date(fin).getTime()
    const now = new Date().getTime()
    
    const total = end - start
    const transcurrido = now - start
    
    if (transcurrido <= 0) return 0
    if (transcurrido >= total) return 100
    
    return Math.round((transcurrido / total) * 100)
  }

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Obtener color del estado
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'vencido': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'cancelado': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      case 'finalizado': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    }
  }

  // Obtener icono del estado
  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'activo': return <CheckCircleIcon className="w-3 h-3" />
      case 'vencido': return <AlertTriangleIcon className="w-3 h-3" />
      case 'cancelado': return <XCircleIcon className="w-3 h-3" />
      case 'finalizado': return <ClockIcon className="w-3 h-3" />
      default: return <AlertCircleIcon className="w-3 h-3" />
    }
  }

  // Calcular días restantes
  const getDiasRestantesText = (dias: number) => {
    if (dias < 0) return `Vencido hace ${Math.abs(dias)} días`
    if (dias === 0) return 'Vence hoy'
    if (dias === 1) return 'Vence mañana'
    return `${dias} días restantes`
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20">
            <FileTextIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestión de Arrendamientos</h1>
            <p className="text-muted-foreground mt-2">
              Administra los arrendamientos activos de software
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-green-50 dark:bg-green-900/20">
                <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Activos</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-4">
              {arrendamientos.filter(a => a.estado === 'activo').length}
            </p>
          </CardContent>
        </Card>

        <Card className="glass rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-900/20">
                <AlertTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Por Vencer</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-4">
              {arrendamientos.filter(a => a.dias_restantes > 0 && a.dias_restantes <= 7).length}
            </p>
          </CardContent>
        </Card>

        <Card className="glass rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-orange-50 dark:bg-orange-900/20">
                <DollarSignIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Mensual</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-4">
              {arrendamientos.filter(a => a.periodo_arrendamiento === 'mensual').length}
            </p>
          </CardContent>
        </Card>

        <Card className="glass rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-900/20">
                <CalendarIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Anual</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-4">
              {arrendamientos.filter(a => a.periodo_arrendamiento === 'anual').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Búsqueda */}
      <Card className="glass rounded-3xl">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por cliente, producto o número de orden..."
                className="pl-10 rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <FilterIcon className="w-4 h-4 text-muted-foreground" />
                <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                  <SelectTrigger className="w-32 rounded-xl">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="activo">Activos</SelectItem>
                    <SelectItem value="vencido">Vencidos</SelectItem>
                    <SelectItem value="cancelado">Cancelados</SelectItem>
                    <SelectItem value="finalizado">Finalizados</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Select value={periodoFilter} onValueChange={setPeriodoFilter}>
                <SelectTrigger className="w-32 rounded-xl">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="diario">Diario</SelectItem>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="mensual">Mensual</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                className="rounded-xl gap-2"
                onClick={fetchArrendamientos}
                disabled={loading}
              >
                <RefreshCwIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Arrendamientos */}
      <Card className="glass rounded-3xl overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-bold text-foreground">
            {filteredArrendamientos.length} Arrendamientos Activos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredArrendamientos.length === 0 ? (
            <div className="text-center py-12">
              <FileTextIcon className="w-12 h-12 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground mt-4">No se encontraron arrendamientos</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-secondary/20">
                    <th className="text-left p-4 font-medium text-muted-foreground">Cliente / Producto</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Período</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Estado / Vencimiento</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Progreso</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Próximo Pago</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredArrendamientos.map((arrendamiento) => {
                    const progreso = calcularProgreso(
                      arrendamiento.fecha_inicio_arrendamiento,
                      arrendamiento.fecha_fin_arrendamiento
                    )
                    
                    return (
                      <tr key={arrendamiento.id} className="border-b hover:bg-secondary/10 transition-colors">
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-foreground">
                              {arrendamiento.cliente_nombre}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {arrendamiento.producto_nombre} • Orden: {arrendamiento.numero_orden}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <UserIcon className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {arrendamiento.cliente_email}
                              </span>
                            </div>
                          </div>
                        </td>
                        
                        <td className="p-4">
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            {arrendamiento.periodo_arrendamiento} × {arrendamiento.cantidad_periodos}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatDate(arrendamiento.fecha_inicio_arrendamiento)} → {formatDate(arrendamiento.fecha_fin_arrendamiento)}
                          </p>
                        </td>
                        
                        <td className="p-4">
                          <Badge className={`${getEstadoColor(arrendamiento.estado)} flex items-center gap-1 w-fit mb-2`}>
                            {getEstadoIcon(arrendamiento.estado)}
                            {arrendamiento.estado.charAt(0).toUpperCase() + arrendamiento.estado.slice(1)}
                          </Badge>
                          <p className={`text-sm ${
                            arrendamiento.dias_restantes <= 7 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'
                          }`}>
                            <ClockIcon className="w-3 h-3 inline mr-1" />
                            {getDiasRestantesText(arrendamiento.dias_restantes)}
                          </p>
                        </td>
                        
                        <td className="p-4">
                          <div className="space-y-2">
                            <Progress value={progreso} className="h-2" />
                            <p className="text-sm text-muted-foreground">
                              {progreso}% completado
                            </p>
                          </div>
                        </td>
                        
                        <td className="p-4">
                          <div className="space-y-1">
                            <p className="text-foreground font-medium">
                              ${arrendamiento.proximo_pago_monto?.toFixed(2) || '0.00'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {arrendamiento.proximo_pago_fecha ? 
                                formatDate(arrendamiento.proximo_pago_fecha) : 'N/A'}
                            </p>
                          </div>
                        </td>
                        
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="rounded-xl">
                                <MoreVerticalIcon className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem 
                                className="flex items-center gap-2"
                                onClick={() => handleGenerateContract(arrendamiento)}
                                disabled={generatingContract === arrendamiento.id}
                              >
                                <FileIcon className="w-3 h-3" />
                                Generar Contrato
                                {generatingContract === arrendamiento.id && (
                                  <Loader2Icon className="w-3 h-3 animate-spin ml-auto" />
                                )}
                              </DropdownMenuItem>
                              
                              <DropdownMenuSeparator />
                              
                              <DropdownMenuItem 
                                className="flex items-center gap-2"
                                onClick={() => handleSendReminder(arrendamiento)}
                                disabled={sendingReminder === arrendamiento.id}
                              >
                                <SendIcon className="w-3 h-3" />
                                Enviar Recordatorio
                                {sendingReminder === arrendamiento.id && (
                                  <Loader2Icon className="w-3 h-3 animate-spin ml-auto" />
                                )}
                              </DropdownMenuItem>
                              
                              <DropdownMenuSeparator />
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para Contrato Personalizado */}
      <Dialog open={contratoModalOpen} onOpenChange={setContratoModalOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileTextIcon className="w-5 h-5" />
              Generar Contrato Personalizado
            </DialogTitle>
            <DialogDescription>
              Personaliza los términos del contrato para {selectedArrendamiento?.cliente_nombre}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Información del Arrendamiento</Label>
              <div className="p-3 bg-secondary/30 rounded-lg">
                <p className="font-medium">{selectedArrendamiento?.producto_nombre}</p>
                <p className="text-sm text-muted-foreground">
                  Cliente: {selectedArrendamiento?.cliente_nombre} • 
                  Período: {selectedArrendamiento?.periodo_arrendamiento} • 
                  Orden: {selectedArrendamiento?.numero_orden}
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="terminos">Términos Adicionales</Label>
              <Textarea
                id="terminos"
                placeholder="Agregue términos adicionales al contrato estándar..."
                rows={4}
                value={contratoData.terminos_adicionales}
                onChange={(e) => setContratoData(prev => ({...prev, terminos_adicionales: e.target.value}))}
              />
              <p className="text-xs text-muted-foreground">
                Estos términos se agregarán a la sección "Términos Especiales" del contrato.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="condiciones">Condiciones Especiales</Label>
              <Textarea
                id="condiciones"
                placeholder="Especifique condiciones especiales, limitaciones o restricciones..."
                rows={4}
                value={contratoData.condiciones_especiales}
                onChange={(e) => setContratoData(prev => ({...prev, condiciones_especiales: e.target.value}))}
              />
              <p className="text-xs text-muted-foreground">
                Ej: Limitaciones de uso, horarios de soporte, requisitos técnicos, etc.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setContratoModalOpen(false)}
              disabled={generatingContract === selectedArrendamiento?.id}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGenerateCustomContract}
              disabled={!selectedArrendamiento || generatingContract === selectedArrendamiento.id}
              className="gap-2"
            >
              {generatingContract === selectedArrendamiento?.id ? (
                <>
                  <Loader2Icon className="w-4 h-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <FileTextIcon className="w-4 h-4" />
                  Generar Contrato
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}