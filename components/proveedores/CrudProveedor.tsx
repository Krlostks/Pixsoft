// components/proveedores/CrudProveedor.tsx
"use client"

import { useState, useEffect } from "react"
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeftIcon } from "@/components/icons"
import { Loader2 as Loader2Icon } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Esquema de validación para proveedor (sin direccion_contacto_id)
const proveedorSchema = z.object({
  nombre: z.string().min(1, "Nombre es requerido"),
  telefono: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  activo: z.boolean().default(true),
  notas: z.string().optional(),
})

// Esquema de validación para dirección basado en direcciones.js
const direccionSchema = z.object({
  alias: z.string().optional(),
  calle: z.string().min(1, "Calle es requerida"),
  numero_exterior: z.string().min(1, "Número exterior es requerido"),
  numero_interior: z.string().optional(),
  colonia: z.string().optional(),
  ciudad: z.string().min(1, "Ciudad es requerida"),
  estado: z.string().min(1, "Estado es requerido"),
  codigo_postal: z.string().min(1, "Código postal es requerido"),
  pais: z.string().default("México"),
  entre_calles: z.string().optional(),
  referencia: z.string().optional()
})

// Combinar ambos esquemas
const formSchema = z.object({
  proveedor: proveedorSchema,
  direccion: direccionSchema,
})

type FormValues = z.infer<typeof formSchema>

// Interfaz del proveedor
export interface Proveedor {
  id?: number;
  nombre: string;
  telefono?: string | null;
  email?: string | null;
  direccion_contacto_id: number;
  activo?: boolean;
  notas?: string | null;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

// Interfaz de dirección
export interface Direccion {
  id?: number;
  alias?: string;
  calle: string;
  numero_exterior: string;
  numero_interior?: string;
  colonia?: string;
  ciudad: string;
  estado: string;
  codigo_postal: string;
  pais?: string;
  entre_calles?: string;
  referencia?: string;
  es_principal?: boolean;
  es_facturacion?: boolean;
}

interface CrudProveedorProps {
  proveedorId?: number; // Para modo edición
  onSuccess: () => void
  onCancel: () => void
  isEditing?: boolean;
}

export default function CrudProveedor({ 
  proveedorId, 
  onSuccess, 
  onCancel, 
  isEditing = false 
}: CrudProveedorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingProveedor, setIsLoadingProveedor] = useState(false)
  const [estadosMexico, setEstadosMexico] = useState<string[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      proveedor: {
        nombre: "",
        telefono: "",
        email: "",
        activo: true,
        notas: "",
      },
      direccion: {
        alias: "",
        calle: "",
        numero_exterior: "",
        numero_interior: "",
        colonia: "",
        ciudad: "",
        estado: "",
        codigo_postal: "",
        pais: "México",
        entre_calles: "",
        referencia: ""
      },
    },
  })

  // Lista de estados de México
  useEffect(() => {
    const estados = [
      "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", 
      "Chiapas", "Chihuahua", "Ciudad de México", "Coahuila", "Colima", 
      "Durango", "Estado de México", "Guanajuato", "Guerrero", "Hidalgo", 
      "Jalisco", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca", 
      "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa", 
      "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
    ]
    setEstadosMexico(estados)
  }, [])

  // Cargar proveedor y su dirección si estamos en modo edición
  useEffect(() => {
    if (isEditing && proveedorId) {
      const fetchProveedorYDireccion = async () => {
        setIsLoadingProveedor(true)
        try {
          const token = Cookies.get("token")
          const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL
          
          // 1. Obtener el proveedor
          const proveedorResponse = await axios.get(
            `${baseURL}/proveedores/${proveedorId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          )

          const proveedor = proveedorResponse.data

          // 2. Si tiene direccion_contacto_id, obtener la dirección
          let direccionData = {
            alias: "",
            calle: "",
            numero_exterior: "",
            numero_interior: "",
            colonia: "",
            ciudad: "",
            estado: "",
            codigo_postal: "",
            pais: "México",
            entre_calles: "",
            referencia: "",
            es_principal: false,
            es_facturacion: false,
          }

          if (proveedor.direccion_contacto_id) {
            try {
              const direccionResponse = await axios.get(
                `${baseURL}/direcciones/direccion/${proveedor.direccion_contacto_id}`,
                { headers: { Authorization: `Bearer ${token}` } }
              )
              
              const direccion = direccionResponse.data
              direccionData = {
                alias: direccion.alias || "",
                calle: direccion.calle || "",
                numero_exterior: direccion.numero_exterior || "",
                numero_interior: direccion.numero_interior || "",
                colonia: direccion.colonia || "",
                ciudad: direccion.ciudad || "",
                estado: direccion.estado || "",
                codigo_postal: direccion.codigo_postal || "",
                pais: direccion.pais || "México",
                entre_calles: direccion.entre_calles || "",
                referencia: direccion.referencia || "",
                es_principal: direccion.es_principal || false,
                es_facturacion: direccion.es_facturacion || false,
              }
            } catch (direccionError) {
              console.warn("Error al cargar dirección del proveedor:", direccionError)
              toast.warning("No se pudo cargar la dirección del proveedor")
            }
          }

          // Establecer valores del formulario
          form.reset({
            proveedor: {
              nombre: proveedor.nombre || "",
              telefono: proveedor.telefono || "",
              email: proveedor.email || "",
              activo: proveedor.activo ?? true,
              notas: proveedor.notas || "",
            },
            direccion: direccionData,
          })

        } catch (error) {
          console.error("Error al cargar proveedor:", error)
          toast.error("Error al cargar los datos del proveedor")
        } finally {
          setIsLoadingProveedor(false)
        }
      }

      fetchProveedorYDireccion()
    }
  }, [isEditing, proveedorId, form])

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)

    try {
      const token = Cookies.get("token")
      const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL

      // 1. Primero crear/actualizar la dirección
      let direccionId: number

      if (isEditing && proveedorId) {
        // En modo edición, obtener el direccion_contacto_id del proveedor
        const proveedorResponse = await axios.get(
          `${baseURL}/proveedores/${proveedorId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        
        const proveedorExistente = proveedorResponse.data
        
        if (proveedorExistente.direccion_contacto_id) {
          // Actualizar dirección existente
          const direccionResponse = await axios.put(
            `${baseURL}/direcciones/${proveedorExistente.direccion_contacto_id}`,
            values.direccion,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          direccionId = proveedorExistente.direccion_contacto_id
        } else {
          // Crear nueva dirección
          const direccionResponse = await axios.post(
            `${baseURL}/direcciones`,
            values.direccion,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          direccionId = direccionResponse.data.direccion.id
        }
      } else {
        // En modo creación, siempre crear nueva dirección
        const direccionResponse = await axios.post(
          `${baseURL}/direcciones`,
          values.direccion,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        direccionId = direccionResponse.data.direccion.id
      }

      // 2. Preparar los datos del proveedor con el ID de dirección
      const proveedorData = {
        nombre: values.proveedor.nombre,
        telefono: values.proveedor.telefono || null,
        email: values.proveedor.email || null,
        direccion_contacto_id: direccionId,
        activo: values.proveedor.activo,
        notas: values.proveedor.notas || null,
      }

      let response;
      
      if (isEditing && proveedorId) {
        // Modo edición: PUT
        response = await axios.put(
          `${baseURL}/proveedores/${proveedorId}`,
          proveedorData,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        
        if (response.status === 200) {
          toast.success("Proveedor actualizado exitosamente")
          onSuccess()
        }
      } else {
        // Modo agregar: POST
        response = await axios.post(
          `${baseURL}/proveedores`,
          proveedorData,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        
        if (response.status === 201) {
          toast.success("Proveedor agregado exitosamente")
          form.reset()
          onSuccess()
        }
      }
    } catch (error: any) {
      console.error(`Error al ${isEditing ? 'actualizar' : 'agregar'} proveedor:`, error)
      const errorMessage = error.response?.data?.error || error.response?.data?.message || `Error al ${isEditing ? 'actualizar' : 'agregar'} el proveedor`
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingProveedor) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2Icon className="w-8 h-8 animate-spin" />
        <span className="ml-2">Cargando proveedor...</span>
      </div>
    )
  }

  return (
    <Card className="glass rounded-3xl max-w-5xl mx-auto border-0 shadow-2xl overflow-hidden">
      <CardHeader className="border-b bg-gradient-to-r from-background to-secondary/10 p-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="h-10 w-10 rounded-xl hover:bg-secondary/50 transition-all"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <CardTitle className="text-2xl md:text-3xl font-bold text-foreground">
              {isEditing ? 'Editar Proveedor' : 'Agregar Nuevo Proveedor'}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {isEditing 
                ? 'Actualiza la información del proveedor' 
                : 'Completa todos los campos para agregar un nuevo proveedor'}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="h-[calc(90vh-180px)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Sección 1: Información del Proveedor */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-3 bg-primary rounded-full" />
                      <h3 className="text-lg md:text-xl font-semibold text-foreground">
                        Información del Proveedor
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="proveedor.nombre"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel className="font-medium flex items-center gap-1">
                              Nombre del Proveedor <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Nombre de la empresa o proveedor" 
                                className="rounded-xl border-border/50 bg-background/50 h-11"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="proveedor.telefono"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">Teléfono</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="+1234567890" 
                                className="rounded-xl border-border/50 bg-background/50 h-11"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="proveedor.email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">Email</FormLabel>
                            <FormControl>
                              <Input 
                                type="email"
                                placeholder="proveedor@ejemplo.com" 
                                className="rounded-xl border-border/50 bg-background/50 h-11"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="proveedor.notas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Notas</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Información adicional sobre el proveedor..."
                              className="min-h-[80px] rounded-xl border-border/50 bg-background/50 resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-xs mt-1">
                            Información adicional, términos especiales, o notas internas
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="proveedor.activo"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4 bg-secondary/10 border-border/30">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base font-medium">
                              Proveedor Activo
                            </FormLabel>
                            <p className="text-sm text-muted-foreground">
                              El proveedor estará disponible para operaciones
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-primary h-6 w-11"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator className="bg-border/30" />

                {/* Sección 2: Dirección de Contacto */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-3 bg-blue-500 rounded-full" />
                      <h3 className="text-lg md:text-xl font-semibold text-foreground">
                        Dirección de Contacto
                      </h3>
                    </div>
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="direccion.alias"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">Alias (Opcional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Ej: Oficina principal, Sucursal norte" 
                                className="rounded-xl border-border/50 bg-background/50 h-11"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription className="text-xs mt-1">
                              Nombre para identificar fácilmente esta dirección
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="direccion.calle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium flex items-center gap-1">
                                Calle <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Av. Principal" 
                                  className="rounded-xl border-border/50 bg-background/50 h-11"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="direccion.numero_exterior"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium flex items-center gap-1">
                                Número Exterior <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="123" 
                                  className="rounded-xl border-border/50 bg-background/50 h-11"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="direccion.numero_interior"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium">Número Interior</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="A" 
                                  className="rounded-xl border-border/50 bg-background/50 h-11"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="direccion.colonia"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">Colonia</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Centro" 
                                className="rounded-xl border-border/50 bg-background/50 h-11"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="direccion.ciudad"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium flex items-center gap-1">
                                Ciudad <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Ciudad de México" 
                                  className="rounded-xl border-border/50 bg-background/50 h-11"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="direccion.estado"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium flex items-center gap-1">
                                Estado <span className="text-red-500">*</span>
                              </FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="rounded-xl border-border/50 bg-background/50 h-11">
                                    <SelectValue placeholder="Selecciona un estado" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-xl max-h-60">
                                  {estadosMexico.map((estado) => (
                                    <SelectItem 
                                      key={estado} 
                                      value={estado}
                                      className="rounded-lg py-2"
                                    >
                                      {estado}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="direccion.codigo_postal"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium flex items-center gap-1">
                                Código Postal <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="01000" 
                                  className="rounded-xl border-border/50 bg-background/50 h-11"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="direccion.entre_calles"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium">Entre Calles</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Ej: Entre Calle A y Calle B" 
                                  className="rounded-xl border-border/50 bg-background/50 h-11"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="direccion.referencia"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium">Referencia</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Ej: Frente al parque" 
                                  className="rounded-xl border-border/50 bg-background/50 h-11"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="direccion.pais"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">País</FormLabel>
                            <FormControl>
                              <Input 
                                value="México"
                                readOnly
                                className="rounded-xl border-border/50 bg-secondary/20 h-11"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="bottom-0 pt-6 pb-2 border-t">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onCancel}
                      className="flex-1 rounded-xl h-12 font-medium border-border/50 hover:bg-secondary/50 transition-all"
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 rounded-xl h-12 font-medium bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                      disabled={isSubmitting || isLoadingProveedor}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                          {isEditing ? 'Guardando...' : 'Agregando...'}
                        </>
                      ) : (
                        isEditing ? 'Guardar Cambios' : 'Agregar Proveedor'
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}