"use client"

import { useState, useEffect, useCallback } from "react"
import { Footer } from "@/components/footer"
import { ProductFiltersComponent } from "@/components/product-filter"
import { ProductGridCard } from "@/components/product-grid-card"
import { Pagination } from "@/components/pagination"
import { GridIcon, ListIcon, ChevronDownIcon } from "@/components/icons"
import type { ProductFilters, ProductsResponse, ProductListItem } from "@/types/products"
import axios from "axios"
import { toast } from "sonner"

const ITEMS_PER_PAGE = 12

const sortOptions = [
  { value: "newest", label: "Más recientes" },
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
  { value: "rating", label: "Mejor valorados" },
]

export default function ProductsPage() {
  const [filters, setFilters] = useState<ProductFilters>({ page: 1, limit: ITEMS_PER_PAGE })
  const [isInitialized, setIsInitialized] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortOpen, setSortOpen] = useState(false)
  const [sortBy, setSortBy] = useState("newest")

  const [products, setProducts] = useState<ProductListItem[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.append("page", String(filters.page || 1))
      params.append("limit", String(filters.limit || ITEMS_PER_PAGE))

      if (filters.marca !== undefined) params.append("marca", String(filters.marca))
      if (filters.categoria !== undefined) params.append("categoria", String(filters.categoria))
      if (filters.tipo) params.append("tipo", filters.tipo)
      if (filters.offer) params.append("offer", "true")

      console.log("Fetching products with params:", params.toString())

      const response = await axios.get<ProductsResponse>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/productos/?${params.toString()}`,
      )

      const productosData = response.data.data

      switch (sortBy) {
        case "price-asc":
          productosData.sort((a, b) => Number.parseFloat(a.precio_descuento) - Number.parseFloat(b.precio_descuento))
          break
        case "price-desc":
          productosData.sort((a, b) => Number.parseFloat(b.precio_descuento) - Number.parseFloat(a.precio_descuento))
          break
        case "rating":
          productosData.sort(
            (a, b) => Number.parseFloat(b.promedio_calificacion) - Number.parseFloat(a.promedio_calificacion),
          )
          break
        case "newest":
        default:
          productosData.sort((a, b) => b.id - a.id)
      }

      setProducts(productosData)
      setTotalPages(response.data.total_pages)
      setTotal(response.data.total)
    } catch (error) {
      console.error("Error fetching products:", error)
      toast.error("Error al cargar los productos")
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }, [filters, sortBy])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const categoriaParam = params.get('categoria')
    const marcaParam = params.get('marca')
    const tipoParam = params.get('tipo')
    const offerParam = params.get('offer')

    const newFilters: ProductFilters = { page: 1, limit: ITEMS_PER_PAGE }

    if (categoriaParam) {
      newFilters.categoria = Number(categoriaParam)
    }
    if (marcaParam) {
      newFilters.marca = Number(marcaParam)
    }
    if (tipoParam) {
      newFilters.tipo = tipoParam as "fisico" | "digital"
    }
    if (offerParam == 'true') {
      newFilters.offer = true
    }

    setFilters(newFilters)
    setIsInitialized(true)
  }, [])

  useEffect(() => {
    if (isInitialized) {
      fetchProducts()
    }
  }, [fetchProducts, isInitialized])

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    setSortOpen(false)
  }


  return (
    <div className="min-h-screen bg-background">
      <main className="pt-10 pb-20 w-full">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Todos los Productos</h1>
            <p className="text-muted-foreground">{isLoading ? "Cargando..." : `${total} productos encontrados`}</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <ProductFiltersComponent filters={filters} onFiltersChange={setFilters} />

            {/* Products Grid */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  {/* Mobile Filter Button is inside ProductFiltersComponent */}
                </div>

                <div className="flex items-center gap-3">
                  {/* Sort Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setSortOpen(!sortOpen)}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 glass rounded-xl sm:rounded-2xl text-sm font-medium text-foreground hover:bg-secondary/50 transition-all duration-300"
                    >
                      <span className="hidden sm:inline">Ordenar:</span>
                      <span className="text-primary">{sortOptions.find((o) => o.value === sortBy)?.label}</span>
                      <ChevronDownIcon
                        className={`w-4 h-4 transition-transform duration-200 ${sortOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {sortOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setSortOpen(false)} />
                        <div className="absolute right-0 top-full mt-2 w-56 glass-strong rounded-2xl p-2 z-50 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                          {sortOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => handleSortChange(option.value)}
                              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${sortBy === option.value
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-foreground hover:bg-secondary/50"
                                }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* View Mode Toggle - AHORA VISIBLE EN MÓVIL TAMBIÉN */}
                  <div className="flex items-center glass rounded-xl sm:rounded-2xl p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-200 ${viewMode === "grid"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                      title="Vista de mosaico"
                    >
                      <GridIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-200 ${viewMode === "list"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                      title="Vista de lista"
                    >
                      <ListIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {isLoading ? (
                <div className={`grid gap-4 sm:gap-6 ${viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1"
                  }`}>
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="glass rounded-2xl sm:rounded-3xl overflow-hidden animate-pulse">
                      <div className="aspect-square bg-secondary/50" />
                      <div className="p-4 sm:p-5 space-y-3">
                        <div className="h-3 bg-secondary/50 rounded w-1/3" />
                        <div className="h-4 bg-secondary/50 rounded w-full" />
                        <div className="h-4 bg-secondary/50 rounded w-2/3" />
                        <div className="h-6 bg-secondary/50 rounded w-1/2 mt-4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length > 0 ? (
                <>
                  <div className="w-full">
                    <div
                      className={`grid gap-4 sm:gap-6 ${viewMode === "grid"
                        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                        : "grid-cols-1"
                        } w-full max-w-7xl mx-auto`}
                    >
                      {products.map((product) => (
                        <ProductGridCard key={product.id} product={product} viewMode={viewMode} />
                      ))}
                    </div>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-12">
                      <Pagination
                        currentPage={filters.page || 1}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="glass rounded-3xl p-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary/50 flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">No se encontraron productos</h3>
                  <p className="text-muted-foreground mb-6">Intenta ajustar los filtros para encontrar lo que buscas</p>
                  <button
                    onClick={() => {setFilters({ page: 1, limit: ITEMS_PER_PAGE }); window.history.replaceState({}, '', window.location.pathname)}}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-medium hover:bg-primary/90 transition-all duration-300"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}