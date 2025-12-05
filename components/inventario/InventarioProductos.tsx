// components/inventario/InventarioProductos.tsx
"use client"

import { useState, useEffect } from "react"
import {
    SearchIcon,
    PlusIcon,
    PackageIcon,
    FilterIcon,
    EditIcon,
    TrashIcon,
    AlertCircleIcon,
    DollarSignIcon,
    Loader2Icon,
    ChevronLeftIcon,
    ChevronRightIcon
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
import { toast } from "sonner"
import axios from "axios"
import AgregarProductoForm from "@/components/inventario/AgregarProductoForm"
import { ProductListItem } from "@/types/products"

// Estadísticas del inventario
interface InventoryStats {
    totalProductos: number
    bajoStock: number
    agotados: number
    valorTotal: number
}

// Categorías para filtros
interface Categoria {
    id: number
    nombre: string
}

export default function InventarioProductos() {
    const [productos, setProductos] = useState<ProductListItem[]>([])
    const [stats, setStats] = useState<InventoryStats>({
        totalProductos: 0,
        bajoStock: 0,
        agotados: 0,
        valorTotal: 0
    })
    const [categorias, setCategorias] = useState<Categoria[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingStats, setLoadingStats] = useState(true)
    const [loadingCategorias, setLoadingCategorias] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [categoryFilter, setCategoryFilter] = useState("todas")
    const [statusFilter, setStatusFilter] = useState("todos")
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const [limit] = useState(10)

    // Cargar productos
    const fetchProductos = async (filters?: any) => {
        setLoading(true)
        try {
            const params: any = {
                page,
                limit,
                ...filters
            }

            // Aplicar filtros
            if (categoryFilter !== "todas") {
                params.categoria = categoryFilter
            }

            if (searchTerm) {
                params.searchQuery = searchTerm
            }

            // Filtro de estado (activo/inactivo)
            if (statusFilter === "activo") {
                params.activo = true
            } else if (statusFilter === "inactivo") {
                params.activo = false
            }

            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/productos`,
                { params }
            )

            if (response.data && response.data.data) {
                setProductos(response.data.data)
                setTotalPages(response.data.total_pages)
                setTotalItems(response.data.total)
            }
        } catch (error) {
            console.error("Error al cargar productos:", error)
            toast.error("Error al cargar los productos")
        } finally {
            setLoading(false)
        }
    }

    // Cargar estadísticas
    const fetchStats = async () => {
        setLoadingStats(true)
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/productos/inventario/estadisticas`
            )

            if (response.data) {
                setStats(response.data)
            }
        } catch (error) {
            console.error("Error al cargar estadísticas:", error)
            // Si el endpoint no existe, calcular localmente
            await calculateStatsLocally()
        } finally {
            setLoadingStats(false)
        }
    }

    // Calcular estadísticas localmente si no hay endpoint
    const calculateStatsLocally = async () => {
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/productos`,
                { params: { limit: 1000 } }
            )

            if (response.data && response.data.data) {
                const productos = response.data.data
                const totalProductos = productos.length
                const bajoStock = productos.filter((p: ProductListItem) => 
                    (p.stock || 0) < 10 && (p.stock || 0) > 0
                ).length
                const agotados = productos.filter((p: ProductListItem) => 
                    (p.stock || 0) === 0
                ).length
                const valorTotal = productos.reduce((sum: number, p: ProductListItem) => 
                    sum + (parseFloat(p.precio) * (p.stock || 0)), 0
                )

                setStats({
                    totalProductos,
                    bajoStock,
                    agotados,
                    valorTotal
                })
            }
        } catch (error) {
            console.error("Error calculando estadísticas:", error)
        }
    }

    // Cargar categorías
    const fetchCategorias = async () => {
        setLoadingCategorias(true)
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/categorias`
            )

            if (response.data) {
                setCategorias(response.data)
            }
        } catch (error) {
            console.error("Error al cargar categorías:", error)
        } finally {
            setLoadingCategorias(false)
        }
    }

    // Eliminar producto
    const handleDeleteProduct = async (id: number) => {
        if (!confirm("¿Estás seguro de eliminar este producto?")) return

        try {
            await axios.delete(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/productos/${id}`
            )

            toast.success("Producto eliminado exitosamente")
            // Recargar productos y estadísticas
            fetchProductos()
            fetchStats()
        } catch (error) {
            console.error("Error al eliminar producto:", error)
            toast.error("Error al eliminar el producto")
        }
    }

    // Efecto inicial
    useEffect(() => {
        fetchProductos()
        fetchStats()
        fetchCategorias()
    }, [page])

    // Efecto para filtros (con debounce)
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProductos()
        }, 500)

        return () => clearTimeout(timer)
    }, [searchTerm, categoryFilter, statusFilter])

    const getEstadoColor = (producto: ProductListItem) => {
        if (producto.stock === 0) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        if ((producto.stock || 0) < 10) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
        if (!producto.activo) return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    }

    const getEstadoText = (producto: ProductListItem) => {
        if (!producto.activo) return 'Inactivo'
        if (producto.stock === 0) return 'Agotado'
        if ((producto.stock || 0) < 10) return 'Bajo Stock'
        return 'Disponible'
    }

    const handleSuccess = () => {
        fetchProductos()
        fetchStats()
        toast.success("Operación completada exitosamente")
    }

    // Formatear precio
    const formatPrice = (price: string) => {
        return parseFloat(price).toLocaleString('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 2
        })
    }

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
                        <DialogContent className="glass rounded-3xl max-w-4xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl backdrop-blur-sm bg-background/95">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold">Nuevo Producto</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                                <AgregarProductoForm
                                    onSuccess={handleSuccess}
                                    onCancel={() => {
                                        document.querySelectorAll('[data-state="open"]').forEach(el => {
                                            if (el instanceof HTMLElement) el.click()
                                        })
                                    }}
                                />
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
                                {loadingStats ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2Icon className="w-4 h-4 animate-spin" />
                                        <span className="text-sm">Cargando...</span>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-2xl font-bold text-foreground">
                                            {stats.totalProductos.toLocaleString()}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">Productos Totales</p>
                                    </>
                                )}
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
                                {loadingStats ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2Icon className="w-4 h-4 animate-spin" />
                                        <span className="text-sm">Cargando...</span>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-2xl font-bold text-foreground">
                                            {stats.bajoStock.toLocaleString()}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">Bajo Stock</p>
                                    </>
                                )}
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
                                {loadingStats ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2Icon className="w-4 h-4 animate-spin" />
                                        <span className="text-sm">Cargando...</span>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-2xl font-bold text-foreground">
                                            {stats.agotados.toLocaleString()}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">Agotados</p>
                                    </>
                                )}
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
                                {loadingStats ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2Icon className="w-4 h-4 animate-spin" />
                                        <span className="text-sm">Cargando...</span>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-2xl font-bold text-foreground">
                                            ${stats.valorTotal.toLocaleString('es-MX', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">Valor Total</p>
                                    </>
                                )}
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
                                    placeholder="Buscar por nombre o descripción..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 rounded-xl"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="w-[180px] rounded-xl">
                                    {loadingCategorias ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2Icon className="w-4 h-4 animate-spin" />
                                            <span>Cargando...</span>
                                        </div>
                                    ) : (
                                        <SelectValue placeholder="Categoría" />
                                    )}
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todas">Todas las categorías</SelectItem>
                                    {categorias.map((categoria) => (
                                        <SelectItem key={categoria.id} value={categoria.id.toString()}>
                                            {categoria.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[150px] rounded-xl">
                                    <SelectValue placeholder="Estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos</SelectItem>
                                    <SelectItem value="activo">Activos</SelectItem>
                                    <SelectItem value="inactivo">Inactivos</SelectItem>
                                    <SelectItem value="bajo_stock">Bajo Stock</SelectItem>
                                    <SelectItem value="agotado">Agotados</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabla de productos */}
            <Card className="glass rounded-3xl overflow-hidden">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <CardTitle className="text-xl font-bold text-foreground">
                            Productos del Inventario
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl"
                                onClick={() => setPage(1)}
                            >
                                Refrescar
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2Icon className="w-8 h-8 animate-spin" />
                        </div>
                    ) : productos.length === 0 ? (
                        <div className="text-center py-12">
                            <PackageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                No hay productos
                            </h3>
                            <p className="text-muted-foreground">
                                {searchTerm || categoryFilter !== "todas" || statusFilter !== "todos"
                                    ? "No se encontraron productos con los filtros aplicados"
                                    : "Comienza agregando un nuevo producto"}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="rounded-xl border border-border overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-secondary/20">
                                        <TableRow>
                                            <TableHead className="font-semibold">ID</TableHead>
                                            <TableHead className="font-semibold">Producto</TableHead>
                                            <TableHead className="font-semibold">Categoría</TableHead>
                                            <TableHead className="font-semibold">Precio</TableHead>
                                            <TableHead className="font-semibold">Stock</TableHead>
                                            <TableHead className="font-semibold">Estado</TableHead>
                                            <TableHead className="font-semibold text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {productos.map((producto) => (
                                            <TableRow key={producto.id} className="hover:bg-secondary/10">
                                                <TableCell className="font-medium">{producto.id}</TableCell>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-3">
                                                        {producto.url_imagen ? (
                                                            <img 
                                                                src={producto.url_imagen} 
                                                                alt={producto.producto_nombre}
                                                                className="w-10 h-10 rounded-lg object-cover bg-secondary"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                                                                <PackageIcon className="w-5 h-5 text-muted-foreground" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="font-medium">{producto.producto_nombre}</div>
                                                            {producto.destacado && (
                                                                <Badge className="mt-1 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 text-xs">
                                                                    Destacado
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{producto.categoria_nombre}</TableCell>
                                                <TableCell className="font-bold">
                                                    <div className="flex flex-col">
                                                        <span>{formatPrice(producto.precio)}</span>
                                                        {producto.precio_descuento && parseFloat(producto.precio_descuento) < parseFloat(producto.precio) && (
                                                            <span className="text-xs text-red-600 dark:text-red-400 line-through">
                                                                {formatPrice(producto.precio_descuento)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={producto.stock === 0 
                                                        ? 'text-red-600 dark:text-red-400 font-bold' 
                                                        : (producto.stock || 0) < 10 
                                                            ? 'text-yellow-600 dark:text-yellow-400 font-bold' 
                                                            : 'text-foreground'
                                                    }>
                                                        {producto.stock || 0} unidades
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={`${getEstadoColor(producto)}`}>
                                                        {getEstadoText(producto)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="rounded-xl">
                                                                    <EditIcon className="w-4 h-4" />
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="glass rounded-3xl max-w-4xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl backdrop-blur-sm bg-background/95">
                                                                <DialogHeader>
                                                                    <DialogTitle className="text-2xl font-bold">
                                                                        Editar Producto
                                                                    </DialogTitle>
                                                                </DialogHeader>
                                                                <div className="py-4">
                                                                    <AgregarProductoForm
                                                                        productId={producto.id}
                                                                        onSuccess={handleSuccess}
                                                                        onCancel={() => {
                                                                            document.querySelectorAll('[data-state="open"]').forEach(el => {
                                                                                if (el instanceof HTMLElement) el.click()
                                                                            })
                                                                        }}
                                                                    />
                                                                </div>
                                                            </DialogContent>
                                                        </Dialog>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => handleDeleteProduct(producto.id)}
                                                            disabled={loading}
                                                        >
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
                            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                                <p className="text-sm text-muted-foreground">
                                    Mostrando {productos.length} de {totalItems.toLocaleString()} productos
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="rounded-xl gap-2" 
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1 || loading}
                                    >
                                        <ChevronLeftIcon className="w-4 h-4" />
                                        Anterior
                                    </Button>
                                    <span className="px-3 text-sm">
                                        Página <span className="font-semibold">{page}</span> de <span className="font-semibold">{totalPages}</span>
                                    </span>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="rounded-xl gap-2"
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages || loading}
                                    >
                                        Siguiente
                                        <ChevronRightIcon className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}