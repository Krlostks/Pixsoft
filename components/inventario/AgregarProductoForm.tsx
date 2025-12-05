// components/inventario/AgregarProductoForm.tsx
"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { toast } from "sonner"
import Image from "next/image"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeftIcon, PlusIcon, TrashIcon } from "@/components/icons"
import { Loader2 as Loader2Icon, ImageIcon, Upload as UploadIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator"

// Esquema de validación actualizado con url_imagen
const formSchema = z.object({
  sku: z.string().min(1, "SKU es requerido"),
  nombre: z.string().min(1, "Nombre es requerido"),
  descripcion: z.string().min(1, "Descripción es requerida"),
  categoria: z.string().min(1, "Categoría es requerida"),
  marca: z.string().min(1, "Marca es requerida"),
  precio: z.coerce.number().min(0, "Precio debe ser mayor o igual a 0"),
  precio_descuento: z.coerce.number().min(0, "Precio de descuento debe ser mayor o igual a 0").optional(),
  costo: z.coerce.number().min(0, "Costo debe ser mayor o igual a 0"),
  tipo: z.enum(["fisico", "digital"]).default("fisico"),
  es_arrendable: z.boolean().default(false),
  duracion_minima_arrendamiento: z.coerce.number().min(0, "Duración mínima debe ser mayor o igual a 0").optional(),
  duracion_maxima_arrendamiento: z.coerce.number().min(0, "Duración máxima debe ser mayor o igual a 0").optional(),
  peso_kg: z.coerce.number().min(0, "Peso debe ser mayor o igual a 0").optional(),
  dimensiones_cm: z.string().optional(),
  url_imagen: z.string().optional(), // Nuevo campo
  activo: z.boolean().default(true),
  destacado: z.boolean().default(false),
  stock: z.coerce.number().min(0, "Stock debe ser mayor o igual a 0"),
})

type FormValues = z.infer<typeof formSchema>

// Tipos de producto
const tiposProducto = [
  { value: "fisico", label: "Físico" },
  { value: "digital", label: "Digital" },
]

// Tipo para las características dinámicas
interface Caracteristica {
  id: number;
  nombre: string;
  valor: string;
}

// Tipo para categorías y marcas del backend
interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  activa: boolean;
}

interface Marca {
  id: number;
  nombre: string;
  descripcion?: string;
  logo_url?: string;
  activa: boolean;
}

interface AgregarProductoFormProps {
  productId?: number; // Nuevo: para modo edición
  onSuccess: () => void
  onCancel: () => void
  isEditing?: boolean; // Nuevo: para saber si estamos editando
}

export default function AgregarProductoForm({ 
  productId, 
  onSuccess, 
  onCancel, 
  isEditing = false 
}: AgregarProductoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingCategorias, setIsLoadingCategorias] = useState(false)
  const [isLoadingMarcas, setIsLoadingMarcas] = useState(false)
  const [isLoadingProducto, setIsLoadingProducto] = useState(false)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [caracteristicas, setCaracteristicas] = useState<Caracteristica[]>([
    { id: 1, nombre: "", valor: "" }
  ])
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      sku: "",
      nombre: "",
      descripcion: "",
      categoria: "",
      marca: "",
      precio: 0,
      precio_descuento: 0,
      costo: 0,
      tipo: "fisico",
      es_arrendable: false,
      duracion_minima_arrendamiento: 0,
      duracion_maxima_arrendamiento: 0,
      peso_kg: 0,
      dimensiones_cm: "",
      url_imagen: "",
      activo: true,
      destacado: false,
      stock: 0,
    },
  })

  const esArrendable = form.watch("es_arrendable")
  const tipoProducto = form.watch("tipo")
  const urlImagen = form.watch("url_imagen")

  // Cargar categorías y marcas desde el backend
  useEffect(() => {
    const fetchCategoriasMarcas = async () => {
      try {
        setIsLoadingCategorias(true)
        setIsLoadingMarcas(true)

        const [categoriasRes, marcasRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/categorias`),
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/marcas`)
        ])

        setCategorias(categoriasRes.data)
        setMarcas(marcasRes.data)
      } catch (error) {
        console.error("Error al cargar datos:", error)
        toast.error("Error al cargar categorías y marcas")
      } finally {
        setIsLoadingCategorias(false)
        setIsLoadingMarcas(false)
      }
    }

    fetchCategoriasMarcas()
  }, [])

  // Cargar producto si estamos en modo edición
  useEffect(() => {
    if (isEditing && productId) {
      const fetchProducto = async () => {
        setIsLoadingProducto(true)
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/productos/${productId}`
          )

          const producto = response.data.data

          // Convertir características de JSON a array
          if (producto.caracteristicas && typeof producto.caracteristicas === 'object') {
            const caracteristicasArray = Object.entries(producto.caracteristicas).map(([nombre, valor], index) => ({
              id: index + 1,
              nombre,
              valor: String(valor)
            }))
            
            if (caracteristicasArray.length > 0) {
              setCaracteristicas(caracteristicasArray)
            } else {
              setCaracteristicas([{ id: 1, nombre: "", valor: "" }])
            }
          }

          // Establecer imagen preview si existe
          if (producto.url_imagen) {
            setImagePreview(producto.url_imagen)
          }

          // Establecer valores del formulario
          form.reset({
            sku: producto.sku || "",
            nombre: producto.nombre || producto.producto_nombre || "",
            descripcion: producto.descripcion || "",
            categoria: producto.categoria_nombre || "",
            marca: producto.marca_nombre || "",
            precio: parseFloat(producto.precio) || 0,
            precio_descuento: producto.precio_descuento ? parseFloat(producto.precio_descuento) : 0,
            costo: producto.costo || 0,
            tipo: producto.tipo || "fisico",
            es_arrendable: producto.es_arrendable || false,
            duracion_minima_arrendamiento: producto.duracion_minima_arrendamiento || 0,
            duracion_maxima_arrendamiento: producto.duracion_maxima_arrendamiento || 0,
            peso_kg: producto.peso_kg || 0,
            dimensiones_cm: producto.dimensiones_cm || "",
            url_imagen: producto.url_imagen || "",
            activo: producto.activo ?? true,
            destacado: producto.destacado ?? false,
            stock: producto.stock || 0,
          })

        } catch (error) {
          console.error("Error al cargar producto:", error)
          toast.error("Error al cargar los datos del producto")
        } finally {
          setIsLoadingProducto(false)
        }
      }

      fetchProducto()
    }
  }, [isEditing, productId, form])

  // Actualizar imagePreview cuando cambie url_imagen
  useEffect(() => {
    if (urlImagen) {
      setImagePreview(urlImagen)
    } else {
      setImagePreview(null)
    }
  }, [urlImagen])

  // Función para subir imagen
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      toast.error("Solo se permiten imágenes (JPEG, PNG, WebP, GIF)")
      return
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no debe exceder los 5MB")
      return
    }

    setIsUploadingImage(true)
    try {
      // Crear FormData
      const formData = new FormData()
      formData.append('imagen', file)

      // Subir imagen al backend
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/upload`, // Asegúrate de tener este endpoint
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      if (response.data && response.data.url) {
        // Actualizar campo en el formulario
        form.setValue('url_imagen', response.data.url)
        setImagePreview(response.data.url)
        toast.success("Imagen subida exitosamente")
      }
    } catch (error: any) {
      console.error("Error al subir imagen:", error)
      
      // Si no hay endpoint de subida, usar una URL placeholder o base64
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        form.setValue('url_imagen', base64String)
        setImagePreview(base64String)
        toast.success("Imagen cargada localmente")
      }
      reader.readAsDataURL(file)
      
      // toast.error(error.response?.data?.message || "Error al subir la imagen")
    } finally {
      setIsUploadingImage(false)
    }
  }

  // Función para eliminar imagen
  const handleRemoveImage = () => {
    form.setValue('url_imagen', '')
    setImagePreview(null)
    toast.info("Imagen eliminada")
  }

  // Función para agregar un nuevo campo de característica
  const agregarCaracteristica = () => {
    const nuevoId = caracteristicas.length > 0 
      ? Math.max(...caracteristicas.map(c => c.id)) + 1 
      : 1
    setCaracteristicas([...caracteristicas, { id: nuevoId, nombre: "", valor: "" }])
  }

  // Función para eliminar un campo de característica
  const eliminarCaracteristica = (id: number) => {
    if (caracteristicas.length > 1) {
      setCaracteristicas(caracteristicas.filter(c => c.id !== id))
    } else {
      // Si solo queda uno, lo limpiamos pero no lo eliminamos
      setCaracteristicas([{ id: 1, nombre: "", valor: "" }])
    }
  }

  // Función para actualizar una característica
  const actualizarCaracteristica = (id: number, campo: keyof Caracteristica, valor: string) => {
    setCaracteristicas(caracteristicas.map(c => 
      c.id === id ? { ...c, [campo]: valor } : c
    ))
  }

  // Función para convertir características a JSON
  const convertirCaracteristicasAJSON = (): Record<string, string> => {
    const json: Record<string, string> = {}
    caracteristicas.forEach(c => {
      if (c.nombre.trim() && c.valor.trim()) {
        json[c.nombre.trim()] = c.valor.trim()
      }
    })
    return json
  }

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)

    try {
      // Convertir características a JSON
      const caracteristicasJSON = convertirCaracteristicasAJSON()

      // Preparar los datos para enviar al backend
      const productoData = {
        ...values,
        caracteristicas: caracteristicasJSON,
        categoria: values.categoria, // Enviar nombre para que backend busque o cree
        marca: values.marca, // Enviar nombre para que backend busque o cree
        // Si no es arrendable, enviar null para las duraciones
        duracion_minima_arrendamiento: values.es_arrendable ? values.duracion_minima_arrendamiento : null,
        duracion_maxima_arrendamiento: values.es_arrendable ? values.duracion_maxima_arrendamiento : null,
        // Si no es físico, enviar null para peso y dimensiones
        peso_kg: tipoProducto === "fisico" ? values.peso_kg : null,
        dimensiones_cm: tipoProducto === "fisico" ? values.dimensiones_cm : null,
        // Asegurar que url_imagen sea null si está vacío
        url_imagen: values.url_imagen || null,
      }

      let response;
      
      if (isEditing && productId) {
        // Modo edición: PUT
        response = await axios.put(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/productos/${productId}`,
          productoData
        )
        
        if (response.status === 200) {
          toast.success("Producto actualizado exitosamente")
          onSuccess()
        }
      } else {
        // Modo agregar: POST
        response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/productos/agregar`,
          productoData
        )
        
        if (response.status === 201) {
          toast.success("Producto agregado exitosamente")
          // Resetear características
          setCaracteristicas([{ id: 1, nombre: "", valor: "" }])
          setImagePreview(null)
          form.reset()
          onSuccess()
        }
      }
    } catch (error: any) {
      console.error(`Error al ${isEditing ? 'actualizar' : 'agregar'} producto:`, error)
      const errorMessage = error.response?.data?.message || error.response?.data?.error || `Error al ${isEditing ? 'actualizar' : 'agregar'} el producto`
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingProducto) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2Icon className="w-8 h-8 animate-spin" />
        <span className="ml-2">Cargando producto...</span>
      </div>
    )
  }

  return (
    <Card className="glass rounded-3xl max-w-6xl mx-auto border-0 shadow-2xl overflow-hidden">
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
              {isEditing ? 'Editar Producto' : 'Agregar Nuevo Producto'}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {isEditing 
                ? 'Actualiza la información del producto' 
                : 'Completa todos los campos para agregar un nuevo producto al inventario'}
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
                      <h3 className="text-lg md:text-xl font-semibold text-foreground">Información Básica</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="sku"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium flex items-center gap-1">
                              SKU <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="SKU-001" 
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
                        name="nombre"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel className="font-medium flex items-center gap-1">
                              Nombre del Producto <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Laptop Dell XPS 13" 
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
                        name="categoria"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium flex items-center gap-1">
                              Categoría <span className="text-red-500">*</span>
                            </FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="rounded-xl border-border/50 bg-background/50 h-11">
                                  {isLoadingCategorias ? (
                                    <div className="flex items-center gap-2">
                                      <Loader2Icon className="w-4 h-4 animate-spin" />
                                      <span>Cargando...</span>
                                    </div>
                                  ) : (
                                    <SelectValue placeholder="Selecciona una categoría" />
                                  )}
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-xl max-h-60">
                                {categorias.map((categoria) => (
                                  <SelectItem 
                                    key={categoria.id} 
                                    value={categoria.nombre}
                                    className="rounded-lg py-2"
                                  >
                                    {categoria.nombre}
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
                        name="marca"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium flex items-center gap-1">
                              Marca <span className="text-red-500">*</span>
                            </FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="rounded-xl border-border/50 bg-background/50 h-11">
                                  {isLoadingMarcas ? (
                                    <div className="flex items-center gap-2">
                                      <Loader2Icon className="w-4 h-4 animate-spin" />
                                      <span>Cargando...</span>
                                    </div>
                                  ) : (
                                    <SelectValue placeholder="Selecciona una marca" />
                                  )}
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-xl max-h-60">
                                {marcas.map((marca) => (
                                  <SelectItem 
                                    key={marca.id} 
                                    value={marca.nombre}
                                    className="rounded-lg py-2"
                                  >
                                    {marca.nombre}
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
                        name="tipo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium flex items-center gap-1">
                              Tipo de Producto <span className="text-red-500">*</span>
                            </FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="rounded-xl border-border/50 bg-background/50 h-11">
                                  <SelectValue placeholder="Selecciona un tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-xl">
                                {tiposProducto.map((tipo) => (
                                  <SelectItem key={tipo.value} value={tipo.value} className="rounded-lg py-2">
                                    {tipo.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator className="bg-border/30" />

                  {/* Imagen del Producto */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-3 bg-primary rounded-full" />
                      <h3 className="text-lg md:text-xl font-semibold text-foreground">Imagen del Producto</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Vista previa de la imagen */}
                      <div className="lg:col-span-1">
                        <div className="space-y-3">
                          <FormLabel className="font-medium">Vista Previa</FormLabel>
                          <div className="border-2 border-dashed border-border/50 rounded-2xl p-6 bg-background/50 flex flex-col items-center justify-center min-h-[200px]">
                            {imagePreview ? (
                              <div className="relative w-full h-full">
                                <div className="relative w-full h-48 rounded-lg overflow-hidden">
                                  <img 
                                    src={imagePreview} 
                                    alt="Vista previa" 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={handleRemoveImage}
                                  className="absolute -top-2 -right-2 rounded-full w-8 h-8"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="text-center">
                                <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                <p className="text-sm text-muted-foreground">
                                  Sin imagen seleccionada
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Campos de imagen */}
                      <div className="lg:col-span-2 space-y-4">
                        <FormField
                          control={form.control}
                          name="url_imagen"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium">URL de la Imagen</FormLabel>
                              <FormControl>
                                <div className="space-y-3">
                                  <Input
                                    placeholder="https://ejemplo.com/imagen.jpg"
                                    className="rounded-xl border-border/50 bg-background/50"
                                    {...field}
                                  />
                                  <div className="text-sm text-muted-foreground">
                                    Ingresa la URL de la imagen o súbela desde tu computadora
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Subir archivo */}
                        <div className="space-y-3">
                          <FormLabel className="font-medium">Subir Imagen</FormLabel>
                          <div className="border-2 border-dashed border-primary/30 rounded-xl p-6 bg-primary/5 transition-all hover:bg-primary/10">
                            <div className="text-center">
                              <UploadIcon className="w-10 h-10 text-primary mx-auto mb-3" />
                              <p className="text-sm text-muted-foreground mb-3">
                                Arrastra y suelta una imagen o haz clic para seleccionar
                              </p>
                              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="rounded-xl gap-2"
                                  onClick={() => document.getElementById('file-upload')?.click()}
                                  disabled={isUploadingImage}
                                >
                                  {isUploadingImage ? (
                                    <>
                                      <Loader2Icon className="w-4 h-4 animate-spin" />
                                      Subiendo...
                                    </>
                                  ) : (
                                    <>
                                      <UploadIcon className="w-4 h-4" />
                                      Seleccionar Archivo
                                    </>
                                  )}
                                </Button>
                                <input
                                  id="file-upload"
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp,image/gif"
                                  className="hidden"
                                  onChange={handleImageUpload}
                                  disabled={isUploadingImage}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={handleRemoveImage}
                                  disabled={!imagePreview || isUploadingImage}
                                >
                                  Eliminar Imagen
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground mt-3">
                                Formatos soportados: JPEG, PNG, WebP, GIF • Máx. 5MB
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-border/30" />

                  {/* Descripción */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-3 bg-primary rounded-full" />
                      <h3 className="text-lg md:text-xl font-semibold text-foreground">Descripción</h3>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="descripcion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium flex items-center gap-1">
                            Descripción <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe las características principales, beneficios y especificaciones del producto..."
                              className="min-h-[120px] rounded-xl border-border/50 bg-background/50 resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator className="bg-border/30" />

                  {/* Características Dinámicas */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-1 w-3 bg-primary rounded-full" />
                        <h3 className="text-lg md:text-xl font-semibold text-foreground">Características</h3>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={agregarCaracteristica}
                        className="rounded-xl gap-2 border-primary/20 hover:bg-primary/10 hover:text-primary"
                      >
                        <PlusIcon className="w-4 h-4" />
                        Agregar
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {caracteristicas.map((caracteristica, index) => (
                        <div 
                          key={caracteristica.id} 
                          className="flex flex-col sm:flex-row items-start gap-3 p-4 bg-secondary/10 rounded-xl border border-border/30"
                        >
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Nombre {index === 0 && <span className="text-red-500">*</span>}
                              </label>
                              <Input
                                placeholder="Ej: Color, Tamaño, Material"
                                value={caracteristica.nombre}
                                onChange={(e) => actualizarCaracteristica(caracteristica.id, 'nombre', e.target.value)}
                                className="rounded-lg border-border/50 bg-background h-10"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Valor {index === 0 && <span className="text-red-500">*</span>}
                              </label>
                              <Input
                                placeholder="Ej: Negro, Grande, Algodón"
                                value={caracteristica.valor}
                                onChange={(e) => actualizarCaracteristica(caracteristica.id, 'valor', e.target.value)}
                                className="rounded-lg border-border/50 bg-background h-10"
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => eliminarCaracteristica(caracteristica.id)}
                            className="h-10 w-10 rounded-lg mt-2 sm:mt-6 hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
                            disabled={caracteristicas.length === 1 && !caracteristica.nombre && !caracteristica.valor}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      Las características se convertirán automáticamente a formato JSON al guardar
                    </p>
                  </div>

                  <Separator className="bg-border/30" />

                  {/* Precios y Costos */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-3 bg-primary rounded-full" />
                      <h3 className="text-lg md:text-xl font-semibold text-foreground">Precios y Costos</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="precio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium flex items-center gap-1">
                              Precio de Venta <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                  $
                                </span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  className="pl-8 rounded-xl border-border/50 bg-background/50 h-11"
                                  placeholder="0.00"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="precio_descuento"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">Precio con Descuento</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                  $
                                </span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  className="pl-8 rounded-xl border-border/50 bg-background/50 h-11"
                                  placeholder="0.00"
                                  value={field.value || 0}
                                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="costo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium flex items-center gap-1">
                              Costo <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                  $
                                </span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  className="pl-8 rounded-xl border-border/50 bg-background/50 h-11"
                                  placeholder="0.00"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator className="bg-border/30" />

                  {/* Stock e Inventario */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-3 bg-primary rounded-full" />
                      <h3 className="text-lg md:text-xl font-semibold text-foreground">Stock e Inventario</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="stock"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium flex items-center gap-1">
                              Stock <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                className="rounded-xl border-border/50 bg-background/50 h-11"
                                placeholder="0"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {tipoProducto === "fisico" && (
                        <>
                          <FormField
                            control={form.control}
                            name="peso_kg"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-medium">Peso (kg)</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      className="pr-10 rounded-xl border-border/50 bg-background/50 h-11"
                                      placeholder="0.00"
                                      value={field.value || 0}
                                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                    />
                                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                      kg
                                    </span>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="dimensiones_cm"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-medium">Dimensiones (cm)</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      placeholder="30x20x15"
                                      className="pr-10 rounded-xl border-border/50 bg-background/50 h-11"
                                      {...field}
                                    />
                                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                      cm
                                    </span>
                                  </div>
                                </FormControl>
                                <FormDescription className="text-xs mt-1">
                                  Formato: largo x ancho x alto
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}
                    </div>
                  </div>

                  <Separator className="bg-border/30" />

                  {/* Arrendamiento (Opcional) */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-3 bg-primary rounded-full" />
                      <h3 className="text-lg md:text-xl font-semibold text-foreground">Arrendamiento</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="es_arrendable"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4 bg-secondary/10 border-border/30">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base font-medium">
                                ¿Es arrendable?
                              </FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Permitir que este producto sea arrendado
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

                      {esArrendable && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-0 sm:ml-4 p-4 border rounded-xl bg-secondary/5 border-border/20">
                          <FormField
                            control={form.control}
                            name="duracion_minima_arrendamiento"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-medium">Duración Mínima (días)</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      type="number"
                                      min="0"
                                      className="pr-10 rounded-xl border-border/50 bg-background/50 h-10"
                                      placeholder="0"
                                      value={field.value || 0}
                                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                    />
                                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                      días
                                    </span>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="duracion_maxima_arrendamiento"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-medium">Duración Máxima (días)</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      type="number"
                                      min="0"
                                      className="pr-10 rounded-xl border-border/50 bg-background/50 h-10"
                                      placeholder="0"
                                      value={field.value || 0}
                                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                    />
                                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                      días
                                    </span>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator className="bg-border/30" />

                  {/* Estado y Configuración */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-3 bg-primary rounded-full" />
                      <h3 className="text-lg md:text-xl font-semibold text-foreground">Estado y Configuración</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="activo"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4 bg-secondary/10 border-border/30">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base font-medium">
                                Producto Activo
                              </FormLabel>
                              <p className="text-sm text-muted-foreground">
                                El producto será visible para los clientes
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

                      <FormField
                        control={form.control}
                        name="destacado"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4 bg-secondary/10 border-border/30">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base font-medium">
                                Producto Destacado
                              </FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Aparecerá en secciones especiales
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
                </div>

                {/* Botones */}
                <div className="sticky bottom-0 pt-6 pb-2 bg-background/80 backdrop-blur-sm border-t">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onCancel}
                      className="flex-1 rounded-xl h-12 font-medium border-border/50 hover:bg-secondary/50 transition-all"
                      disabled={isSubmitting || isUploadingImage}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 rounded-xl h-12 font-medium bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                      disabled={isSubmitting || isLoadingProducto || isUploadingImage}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                          {isEditing ? 'Guardando...' : 'Agregando...'}
                        </>
                      ) : (
                        isEditing ? 'Guardar Cambios' : 'Agregar Producto'
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