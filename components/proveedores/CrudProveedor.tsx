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

// Esquema de validación basado en el backend de proveedores
const formSchema = z.object({
  nombre: z.string().min(1, "Nombre es requerido"),
  telefono: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  direccion_contacto_id: z.coerce.number().min(1, "ID de dirección es requerido"),
  activo: z.boolean().default(true),
  notas: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

// Interfaz del proveedor (similar a la definida en page.tsx)
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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      nombre: "",
      telefono: "",
      email: "",
      direccion_contacto_id: 0,
      activo: true,
      notas: "",
    },
  })

  // Cargar proveedor si estamos en modo edición
  useEffect(() => {
    if (isEditing && proveedorId) {
      const fetchProveedor = async () => {
        setIsLoadingProveedor(true)
        try {
          const token = Cookies.get("token")
          const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL
          
          const response = await axios.get(
            `${baseURL}/proveedores/${proveedorId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          )

          const proveedor = response.data

          // Establecer valores del formulario
          form.reset({
            nombre: proveedor.nombre || "",
            telefono: proveedor.telefono || "",
            email: proveedor.email || "",
            direccion_contacto_id: proveedor.direccion_contacto_id || 0,
            activo: proveedor.activo ?? true,
            notas: proveedor.notas || "",
          })

        } catch (error) {
          console.error("Error al cargar proveedor:", error)
          toast.error("Error al cargar los datos del proveedor")
        } finally {
          setIsLoadingProveedor(false)
        }
      }

      fetchProveedor()
    }
  }, [isEditing, proveedorId, form])

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)

    try {
      const token = Cookies.get("token")
      const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL

      // Preparar los datos para enviar al backend
      const proveedorData = {
        nombre: values.nombre,
        telefono: values.telefono || null,
        email: values.email || null,
        direccion_contacto_id: values.direccion_contacto_id,
        activo: values.activo,
        notas: values.notas || null,
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
    <Card className="glass rounded-3xl max-w-4xl mx-auto border-0 shadow-2xl overflow-hidden">
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
                {/* Información Básica */}
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-3 bg-primary rounded-full" />
                      <h3 className="text-lg md:text-xl font-semibold text-foreground">Información del Proveedor</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="nombre"
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
                        name="telefono"
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
                        name="email"
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

                      <FormField
                        control={form.control}
                        name="direccion_contacto_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium flex items-center gap-1">
                              ID de Dirección <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                min="1"
                                placeholder="1" 
                                className="rounded-xl border-border/50 bg-background/50 h-11"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription className="text-xs mt-1">
                              ID de la dirección de contacto en el sistema
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator className="bg-border/30" />

                  {/* Notas */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-3 bg-primary rounded-full" />
                      <h3 className="text-lg md:text-xl font-semibold text-foreground">Notas Adicionales</h3>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="notas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Notas</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Información adicional sobre el proveedor..."
                              className="min-h-[100px] rounded-xl border-border/50 bg-background/50 resize-none"
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
                  </div>

                  <Separator className="bg-border/30" />

                  {/* Estado */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-3 bg-primary rounded-full" />
                      <h3 className="text-lg md:text-xl font-semibold text-foreground">Estado</h3>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="activo"
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

                {/* Botones */}
                <div className="sticky bottom-0 pt-6 pb-2 bg-background/80 backdrop-blur-sm border-t">
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