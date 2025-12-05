// components/inventario/AgregarProductoForm.tsx
"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { toast } from "sonner"
import Cookies from "js-cookie"

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
import { Card, CardContent } from "@/components/ui/card"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ArrowLeftIcon, PlusIcon, TrashIcon, CheckIcon } from "@/components/icons"
import { Loader2 as Loader2Icon, ChevronsUpDown, Plus } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// Esquema de validación actualizado con campos de imagen para marca y categoría
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
  url_imagen: z.string().optional(),
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
  imagen_url?: string;
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
  productId?: number;
  onSuccess: () => void
  onCancel: () => void
  isEditing?: boolean;
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
  const [isCreatingMarca, setIsCreatingMarca] = useState(false)
  const [isCreatingCategoria, setIsCreatingCategoria] = useState(false)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [caracteristicas, setCaracteristicas] = useState<Caracteristica[]>([
    { id: 1, nombre: "", valor: "" }
  ])
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [categoriaLogoUrl, setCategoriaLogoUrl] = useState("")
  const [marcaLogoUrl, setMarcaLogoUrl] = useState("")
  
  // Estados para combobox
  const [openCategoria, setOpenCategoria] = useState(false)
  const [openMarca, setOpenMarca] = useState(false)
  const [newCategoriaInput, setNewCategoriaInput] = useState("")
  const [newMarcaInput, setNewMarcaInput] = useState("")

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
  const categoriaValue = form.watch("categoria")
  const marcaValue = form.watch("marca")

  // Cargar categorías y marcas desde el backend
  useEffect(() => {
    const fetchCategoriasMarcas = async () => {
      try {
        setIsLoadingCategorias(true)
        setIsLoadingMarcas(true)

        const token = Cookies.get("token")
        const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL
        const headers = token ? { Authorization: `Bearer ${token}` } : {}

        const [categoriasRes, marcasRes] = await Promise.all([
          axios.get(`${baseURL}/categorias`, { headers }),
          axios.get(`${baseURL}/marcas`, { headers })
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
          const token = Cookies.get("token")
          const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL
          const headers = token ? { Authorization: `Bearer ${token}` } : {}

          const response = await axios.get(
            `${baseURL}/productos/${productId}`,
            { headers }
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

  // Función para crear nueva categoría
  const crearNuevaCategoria = async () => {
    if (!newCategoriaInput.trim()) {
      toast.error("El nombre de la categoría es requerido")
      return
    }

    setIsCreatingCategoria(true)
    try {
      const token = Cookies.get("token")
      const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL

      const response = await axios.post(
        `${baseURL}/categorias`,
        {
          nombre: newCategoriaInput.trim(),
          descripcion: "",
          imagen_url: categoriaLogoUrl || "", // Usar la URL de imagen
          activa: true
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const nuevaCategoria = response.data.categoria
      setCategorias([...categorias, nuevaCategoria])
      form.setValue("categoria", nuevaCategoria.nombre)
      setNewCategoriaInput("")
      setCategoriaLogoUrl("") // Limpiar el campo después de crear
      setOpenCategoria(false)
      
      toast.success("Categoría creada exitosamente")
    } catch (error: any) {
      console.error("Error al crear categoría:", error)
      const errorMessage = error.response?.data?.error || "Error al crear la categoría"
      toast.error(errorMessage)
    } finally {
      setIsCreatingCategoria(false)
    }
  }

  // Función para crear nueva marca
  const crearNuevaMarca = async () => {
    if (!newMarcaInput.trim()) {
      toast.error("El nombre de la marca es requerido")
      return
    }

    setIsCreatingMarca(true)
    try {
      const token = Cookies.get("token")
      const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL

      const response = await axios.post(
        `${baseURL}/marcas`,
        {
          nombre: newMarcaInput.trim(),
          descripcion: "",
          logo_url: marcaLogoUrl || "", // Usar la URL de logo
          activa: true
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const nuevaMarca = response.data.marca
      setMarcas([...marcas, nuevaMarca])
      form.setValue("marca", nuevaMarca.nombre)
      setNewMarcaInput("")
      setMarcaLogoUrl("") // Limpiar el campo después de crear
      setOpenMarca(false)
      
      toast.success("Marca creada exitosamente")
    } catch (error: any) {
      console.error("Error al crear marca:", error)
      const errorMessage = error.response?.data?.error || "Error al crear la marca"
      toast.error(errorMessage)
    } finally {
      setIsCreatingMarca(false)
    }
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

      const token = Cookies.get("token")
      const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL

      // Preparar los datos para enviar al backend
      const productoData = {
        ...values,
        caracteristicas: caracteristicasJSON,
        categoria: values.categoria,
        marca: values.marca,
        duracion_minima_arrendamiento: values.es_arrendable ? values.duracion_minima_arrendamiento : null,
        duracion_maxima_arrendamiento: values.es_arrendable ? values.duracion_maxima_arrendamiento : null,
        peso_kg: tipoProducto === "fisico" ? values.peso_kg : null,
        dimensiones_cm: tipoProducto === "fisico" ? values.dimensiones_cm : null,
        url_imagen: values.url_imagen || null,
      }

      const headers = { Authorization: `Bearer ${token}` }
      let response;
      
      if (isEditing && productId) {
        // Modo edición: PUT
        response = await axios.put(
          `${baseURL}/productos/${productId}`,
          productoData,
          { headers }
        )
        
        if (response.status === 200) {
          toast.success("Producto actualizado exitosamente")
          onSuccess()
        }
      } else {
        // Modo agregar: POST
        response = await axios.post(
          `${baseURL}/productos/agregar`,
          productoData,
          { headers }
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
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="h-10 w-10 rounded-xl hover:bg-secondary/50 transition-all"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {isEditing ? 'Editar Producto' : 'Agregar Nuevo Producto'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isEditing 
              ? 'Actualiza la información del producto' 
              : 'Completa todos los campos para agregar un nuevo producto al inventario'}
          </p>
        </div>
      </div>

      <Card className="glass rounded-3xl border-0 shadow-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="h-[calc(90vh-120px)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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

                        {/* ComboBox para Categoría */}
                        <FormField
                          control={form.control}
                          name="categoria"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="font-medium flex items-center gap-1">
                                Categoría <span className="text-red-500">*</span>
                              </FormLabel>
                              <Popover open={openCategoria} onOpenChange={setOpenCategoria}>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      role="combobox"
                                      aria-expanded={openCategoria}
                                      className="justify-between rounded-xl border-border/50 bg-background/50 h-11 hover:bg-background/70"
                                    >
                                      {isLoadingCategorias ? (
                                        <div className="flex items-center gap-2">
                                          <Loader2Icon className="w-4 h-4 animate-spin" />
                                          <span>Cargando...</span>
                                        </div>
                                      ) : field.value ? (
                                        categorias.find(categoria => categoria.nombre === field.value)?.nombre
                                      ) : (
                                        "Selecciona una categoría"
                                      )}
                                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0 rounded-xl" align="start">
                                  <Command className="rounded-xl">
                                    <CommandInput 
                                      placeholder="Buscar categoría o crear nueva..." 
                                      className="h-9"
                                      value={newCategoriaInput}
                                      onValueChange={setNewCategoriaInput}
                                    />
                                    <CommandList>
                                      <CommandEmpty>
                                        <div className="flex flex-col gap-3 p-3">
                                          <div className="text-sm text-muted-foreground">
                                            No se encontró la categoría "{newCategoriaInput}"
                                          </div>
                                          
                                          {/* Campo para URL de imagen de categoría */}
                                          <div className="space-y-2">
                                            <label className="text-sm font-medium">URL de Imagen de Categoría (Opcional)</label>
                                            <Input
                                              placeholder="https://ejemplo.com/imagen-categoria.jpg"
                                              value={categoriaLogoUrl}
                                              onChange={(e) => setCategoriaLogoUrl(e.target.value)}
                                              className="rounded-lg h-9"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                              Ingresa la URL de la imagen para la categoría
                                            </p>
                                          </div>
                                          
                                          <Button
                                            type="button"
                                            size="sm"
                                            onClick={crearNuevaCategoria}
                                            disabled={isCreatingCategoria || !newCategoriaInput.trim()}
                                            className="justify-center gap-2"
                                          >
                                            {isCreatingCategoria ? (
                                              <Loader2Icon className="w-3 h-3 animate-spin" />
                                            ) : (
                                              <Plus className="w-3 h-3" />
                                            )}
                                            Crear categoría "{newCategoriaInput}"
                                          </Button>
                                        </div>
                                      </CommandEmpty>
                                      <CommandGroup className="max-h-60 overflow-auto">
                                        {categorias.map((categoria) => (
                                          <CommandItem
                                            key={categoria.id}
                                            value={categoria.nombre}
                                            onSelect={() => {
                                              form.setValue("categoria", categoria.nombre)
                                              setOpenCategoria(false)
                                            }}
                                            className="rounded-lg py-2 cursor-pointer"
                                          >
                                            <CheckIcon
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                field.value === categoria.nombre ? "opacity-100" : "opacity-0"
                                              )}
                                            />
                                            {categoria.nombre}
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* ComboBox para Marca */}
                        <FormField
                          control={form.control}
                          name="marca"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="font-medium flex items-center gap-1">
                                Marca <span className="text-red-500">*</span>
                              </FormLabel>
                              <Popover open={openMarca} onOpenChange={setOpenMarca}>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      role="combobox"
                                      aria-expanded={openMarca}
                                      className="justify-between rounded-xl border-border/50 bg-background/50 h-11 hover:bg-background/70"
                                    >
                                      {isLoadingMarcas ? (
                                        <div className="flex items-center gap-2">
                                          <Loader2Icon className="w-4 h-4 animate-spin" />
                                          <span>Cargando...</span>
                                        </div>
                                      ) : field.value ? (
                                        marcas.find(marca => marca.nombre === field.value)?.nombre
                                      ) : (
                                        "Selecciona una marca"
                                      )}
                                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0 rounded-xl" align="start">
                                  <Command className="rounded-xl">
                                    <CommandInput 
                                      placeholder="Buscar marca o crear nueva..." 
                                      className="h-9"
                                      value={newMarcaInput}
                                      onValueChange={setNewMarcaInput}
                                    />
                                    <CommandList>
                                      <CommandEmpty>
                                        <div className="flex flex-col gap-3 p-3">
                                          <div className="text-sm text-muted-foreground">
                                            No se encontró la marca "{newMarcaInput}"
                                          </div>
                                          
                                          {/* Campo para URL de logo de marca */}
                                          <div className="space-y-2">
                                            <label className="text-sm font-medium">URL de Logo de Marca (Opcional)</label>
                                            <Input
                                              placeholder="https://ejemplo.com/logo-marca.png"
                                              value={marcaLogoUrl}
                                              onChange={(e) => setMarcaLogoUrl(e.target.value)}
                                              className="rounded-lg h-9"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                              Ingresa la URL del logo para la marca
                                            </p>
                                          </div>
                                          
                                          <Button
                                            type="button"
                                            size="sm"
                                            onClick={crearNuevaMarca}
                                            disabled={isCreatingMarca || !newMarcaInput.trim()}
                                            className="justify-center gap-2"
                                          >
                                            {isCreatingMarca ? (
                                              <Loader2Icon className="w-3 h-3 animate-spin" />
                                            ) : (
                                              <Plus className="w-3 h-3" />
                                            )}
                                            Crear marca "{newMarcaInput}"
                                          </Button>
                                        </div>
                                      </CommandEmpty>
                                      <CommandGroup className="max-h-60 overflow-auto">
                                        {marcas.map((marca) => (
                                          <CommandItem
                                            key={marca.id}
                                            value={marca.nombre}
                                            onSelect={() => {
                                              form.setValue("marca", marca.nombre)
                                              setOpenMarca(false)
                                            }}
                                            className="rounded-lg py-2 cursor-pointer"
                                          >
                                            <CheckIcon
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                field.value === marca.nombre ? "opacity-100" : "opacity-0"
                                              )}
                                            />
                                            {marca.nombre}
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
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
                              <div className="grid grid-cols-2 gap-2">
                                {tiposProducto.map((tipo) => (
                                  <Button
                                    key={tipo.value}
                                    type="button"
                                    variant={field.value === tipo.value ? "default" : "outline"}
                                    onClick={() => field.onChange(tipo.value)}
                                    className="rounded-xl h-11"
                                  >
                                    {tipo.label}
                                  </Button>
                                ))}
                              </div>
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
                      
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="url_imagen"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium">URL de la Imagen</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="https://ejemplo.com/imagen-producto.jpg"
                                  className="rounded-xl border-border/50 bg-background/50"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription className="text-xs mt-1">
                                Ingresa la URL de la imagen del producto
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {imagePreview && (
                          <div className="mt-4">
                            <p className="text-sm font-medium mb-2">Vista previa:</p>
                            <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                                onError={() => setImagePreview(null)}
                              />
                            </div>
                          </div>
                        )}
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
                        disabled={isSubmitting}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 rounded-xl h-12 font-medium bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                        disabled={isSubmitting || isLoadingProducto || isCreatingMarca || isCreatingCategoria}
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
    </div>
  )
}