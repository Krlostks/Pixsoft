"use client"

import { Edit2Icon, MapPinIcon, Trash2Icon, HomeIcon, FileTextIcon, CheckIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import axios from "axios"
import Cookies from "js-cookie"

interface Direccion {
  id: number
  alias: string | null
  calle: string
  numero_exterior: string
  numero_interior: string | null
  colonia: string | null
  ciudad: string
  estado: string
  codigo_postal: string
  pais: string
  entre_calles: string | null
  referencia: string | null
  es_principal: boolean
  es_facturacion: boolean
}

interface AddressCardProps {
  direccion: Direccion
  onEdit: (direccion: Direccion) => void
  onDelete: (id: number) => void
  onSetPrincipal: (id: number) => void
  onSetFacturacion: (id: number) => void
  disabled?: boolean
}

export default function AddressCard({
  direccion,
  onEdit,
  onDelete,
  onSetPrincipal,
  onSetFacturacion,
  disabled = false
}: AddressCardProps) {
  const token = Cookies.get("token")

  const handleSetPrincipal = async () => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/direcciones/set-principal/${direccion.id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      toast.success("Dirección principal actualizada")
      onSetPrincipal(direccion.id)
    } catch (error) {
      console.error("Error al establecer dirección principal:", error)
      toast.error("Error al actualizar dirección principal")
    }
  }

  const handleSetFacturacion = async () => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/direcciones/set-facturacion/${direccion.id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      toast.success("Dirección de facturación actualizada")
      onSetFacturacion(direccion.id)
    } catch (error) {
      console.error("Error al establecer dirección de facturación:", error)
      toast.error("Error al actualizar dirección de facturación")
    }
  }

  return (
    <Card className="glass rounded-3xl hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <MapPinIcon className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg text-foreground">
              {direccion.alias || "Sin alias"}
            </h3>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(direccion)}
              disabled={disabled}
              className="h-8 w-8"
            >
              <Edit2Icon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(direccion.id)}
              disabled={disabled}
              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
            >
              <Trash2Icon className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2 text-sm mb-4">
          <p className="text-foreground font-medium">
            {direccion.calle} #{direccion.numero_exterior}
            {direccion.numero_interior && `, Int. ${direccion.numero_interior}`}
          </p>
          {direccion.colonia && <p className="text-foreground">{direccion.colonia}</p>}
          <p className="text-foreground">
            {direccion.ciudad}, {direccion.estado}
          </p>
          <p className="text-foreground">CP: {direccion.codigo_postal}</p>
          <p className="text-foreground">{direccion.pais}</p>
          {direccion.entre_calles && (
            <p className="text-muted-foreground">
              Entre: {direccion.entre_calles}
            </p>
          )}
          {direccion.referencia && (
            <p className="text-muted-foreground">
              Referencia: {direccion.referencia}
            </p>
          )}
        </div>

        <Separator className="my-4" />

        <div className="flex flex-wrap gap-2">
          {direccion.es_principal ? (
            <Badge className="bg-primary text-primary-foreground">
              <HomeIcon className="w-3 h-3 mr-1" />
              Principal
            </Badge>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSetPrincipal}
              disabled={disabled}
              className="h-7 text-xs"
            >
              <HomeIcon className="w-3 h-3 mr-1" />
              Establecer como principal
            </Button>
          )}

          {direccion.es_facturacion ? (
            <Badge variant="secondary">
              <FileTextIcon className="w-3 h-3 mr-1" />
              Facturación
            </Badge>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSetFacturacion}
              disabled={disabled}
              className="h-7 text-xs"
            >
              <FileTextIcon className="w-3 h-3 mr-1" />
              Establecer como facturación
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}