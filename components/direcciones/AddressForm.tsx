"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import Cookies from "js-cookie"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeftIcon } from "@/components/icons"

const estadosMexico = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche",
  "Chiapas", "Chihuahua", "Ciudad de México", "Coahuila", "Colima", "Durango",
  "Estado de México", "Guanajuato", "Guerrero", "Hidalgo", "Jalisco",
  "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca", "Puebla",
  "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa", "Sonora",
  "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
]

const formSchema = z.object({
  alias: z.string(),
  calle: z.string().min(1, "La calle es requerida"),
  numero_exterior: z.string().min(1, "El número exterior es requerido"),
  numero_interior: z.string(),
  colonia: z.string(),
  ciudad: z.string().min(1, "La ciudad es requerida"),
  estado: z.string().min(1, "El estado es requerido"),
  codigo_postal: z.string().min(5, "Código postal mínimo 5 dígitos").max(5, "Código postal máximo 5 dígitos"),
  pais: z.string(),
  entre_calles: z.string(),
  referencia: z.string(),
  es_principal: z.boolean(),
  es_facturacion: z.boolean()
})

interface Direccion {
  id?: number
  alias?: string | null
  calle: string
  numero_exterior: string
  numero_interior?: string | null
  colonia?: string | null
  ciudad: string
  estado: string
  codigo_postal: string
  pais?: string
  entre_calles?: string | null
  referencia?: string | null
  es_principal?: boolean
  es_facturacion?: boolean
}

interface AddressFormProps {
  direccion?: Direccion | null
  onSuccess: () => void
  onCancel: () => void
}

export default function AddressForm({ direccion, onSuccess, onCancel }: AddressFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      alias: direccion?.alias || "",
      calle: direccion?.calle || "",
      numero_exterior: direccion?.numero_exterior || "",
      numero_interior: direccion?.numero_interior || "",
      colonia: direccion?.colonia || "",
      ciudad: direccion?.ciudad || "",
      estado: direccion?.estado || "",
      codigo_postal: direccion?.codigo_postal || "",
      pais: direccion?.pais || "México",
      entre_calles: direccion?.entre_calles || "",
      referencia: direccion?.referencia || "",
      es_principal: direccion?.es_principal || false,
      es_facturacion: direccion?.es_facturacion || false
    }
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const token = Cookies.get("token")
    if (!token) {
      toast.error("Debes iniciar sesión para continuar")
      return
    }

    setIsSubmitting(true)

    try {
      if (direccion?.id) {
        // Actualizar dirección existente
        await axios.put(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/direcciones/${direccion.id}`,
          values,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        toast.success("Dirección actualizada exitosamente")
      } else {
        // Crear nueva dirección
        await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/direcciones/`,
          values,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        toast.success("Dirección agregada exitosamente")
      }
      onSuccess()
    } catch (error: any) {
      console.error("Error al guardar dirección:", error)
      const errorMessage = error.response?.data || "Error al guardar la dirección"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="glass rounded-3xl">
      <CardHeader>
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="h-8 w-8"
          >
            <ArrowLeftIcon className="w-4 h-4" />
          </Button>
          <CardTitle className="text-2xl font-bold">
            {direccion ? "Editar Dirección" : "Agregar Nueva Dirección"}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna izquierda */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="alias"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alias (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Casa, Oficina, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="calle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calle *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre de la calle" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="numero_exterior"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número Exterior *</FormLabel>
                        <FormControl>
                          <Input placeholder="123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="numero_interior"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número Interior (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="45" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="colonia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Colonia (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre de la colonia" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Columna derecha */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ciudad"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ciudad *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ciudad" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="codigo_postal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código Postal *</FormLabel>
                        <FormControl>
                          <Input placeholder="12345" {...field} maxLength={5} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado *</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="">Selecciona un estado</option>
                          {estadosMexico.map((estado) => (
                            <option key={estado} value={estado}>
                              {estado}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="entre_calles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entre calles (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Calle 1 y Calle 2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="referencia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Referencias (opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ej: Casa color blanco, portón negro" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <FormField
                control={form.control}
                name="es_principal"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Establecer como dirección principal</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Esta será tu dirección de entrega predeterminada
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="es_facturacion"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Usar para facturación</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Esta será tu dirección fiscal
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Guardando..." : direccion ? "Actualizar" : "Agregar Dirección"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}