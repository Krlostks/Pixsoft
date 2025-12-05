"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ChevronDownIcon, XMarkIcon, FilterIcon } from "./icons"
import type { ProductFilters, Categoria, Marca } from "@/types/products"

interface ProductFiltersProps {
  filters: ProductFilters
  onFiltersChange: (filters: ProductFilters) => void
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

const tipos = [
  { value: "fisico", label: "Producto Físico" },
  { value: "digital", label: "Licencia Digital" },
]

export function ProductFiltersComponent({ filters, onFiltersChange }: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>(["marca", "categoria", "tipo"])

  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [loadingCategorias, setLoadingCategorias] = useState(true)
  const [loadingMarcas, setLoadingMarcas] = useState(true)

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/categorias/`, {
          credentials: "include",
        })
        if (response.ok) {
          const data: Categoria[] = await response.json()
          // Solo mostrar categorías activas
          setCategorias(data.filter((cat) => cat.activa))
        }
      } catch (error) {
        console.error("Error fetching categorias:", error)
      } finally {
        setLoadingCategorias(false)
      }
    }
    fetchCategorias()
  }, [])

  useEffect(() => {
    const fetchMarcas = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/marcas/`, {
          credentials: "include",
        })
        if (response.ok) {
          const data: Marca[] = await response.json()
          setMarcas(data)
        }
      } catch (error) {
        console.error("Error fetching marcas:", error)
      } finally {
        setLoadingMarcas(false)
      }
    }
    fetchMarcas()
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const categoriaParam = params.get('categoria')
    const marcaParam = params.get('marca')
    const tipoParam = params.get('tipo')

    if (categoriaParam) {
      updateFilter('categoria', Number(categoriaParam))
    }
    if (marcaParam) {
      updateFilter('marca', Number(marcaParam))
    }
    if (tipoParam) {
      updateFilter('tipo', tipoParam)
    }
  }, [])


  const toggleSection = (section: string) => {
    setExpandedSections((prev) => (prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]))
  }

  const updateFilter = (key: keyof ProductFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value, page: 1 })
  }

  const clearFilters = () => {
    onFiltersChange({ page: 1, limit: 12 })
  }

  // Cambiar a verificar por IDs (números)
  const hasActiveFilters = filters.marca !== undefined || filters.categoria !== undefined || filters.tipo !== undefined

  return (
    <>
      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden flex items-center gap-2 px-4 py-2.5 glass rounded-2xl text-sm font-medium text-foreground hover:bg-secondary/50 transition-all duration-300"
      >
        <FilterIcon className="w-5 h-5" />
        Filtros
        {hasActiveFilters && <span className="w-2 h-2 bg-primary rounded-full" />}
      </button>

      {/* Mobile Filter Overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
        <div
          className={`absolute right-0 top-0 h-full w-80 max-w-full glass-strong p-6 transition-transform duration-300 overflow-y-auto ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Filtros</h3>
            <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl hover:bg-secondary/50 transition-colors">
              <XMarkIcon className="w-5 h-5 text-foreground" />
            </button>
          </div>
          <FilterContent
            filters={filters}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
            updateFilter={updateFilter}
            clearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
            categorias={categorias}
            marcas={marcas}
            loadingCategorias={loadingCategorias}
            loadingMarcas={loadingMarcas}
          />
        </div>
      </div>

      {/* Desktop Filters */}
      <div className="hidden lg:block w-64 shrink-0">
        <div className="glass rounded-3xl p-6 sticky top-24">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Filtros</h3>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-sm text-primary hover:text-primary/80 transition-colors">
                Limpiar
              </button>
            )}
          </div>
          <FilterContent
            filters={filters}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
            updateFilter={updateFilter}
            clearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
            categorias={categorias}
            marcas={marcas}
            loadingCategorias={loadingCategorias}
            loadingMarcas={loadingMarcas}
          />
        </div>
      </div>
    </>
  )
}

function FilterSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3 animate-pulse">
          <div className="w-5 h-5 rounded-lg bg-muted" />
          <div className="h-4 w-24 rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}

function FilterContent({
  filters,
  expandedSections,
  toggleSection,
  updateFilter,
  clearFilters,
  hasActiveFilters,
  categorias,
  marcas,
  loadingCategorias,
  loadingMarcas,
}: {
  filters: ProductFilters
  expandedSections: string[]
  toggleSection: (section: string) => void
  updateFilter: (key: keyof ProductFilters, value: any) => void
  clearFilters: () => void
  hasActiveFilters: boolean
  categorias: Categoria[]
  marcas: Marca[]
  loadingCategorias: boolean
  loadingMarcas: boolean
}) {
  return (
    <div className="space-y-6">
      {/* Marca Filter - Ahora filtra por ID */}
      <FilterSection
        title="Marca"
        isExpanded={expandedSections.includes("marca")}
        onToggle={() => toggleSection("marca")}
      >
        {loadingMarcas ? (
          <FilterSkeleton />
        ) : marcas.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay marcas disponibles</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto ">
            {marcas.map((marca) => (
              <label key={marca.id} className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => updateFilter("marca", filters.marca === marca.id ? undefined : marca.id)}
                  className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                    filters.marca === marca.id
                      ? "bg-primary border-primary"
                      : "border-muted-foreground/30 group-hover:border-primary/50"
                  }`}
                >
                  {filters.marca === marca.id && (
                    <svg
                      className="w-3 h-3 text-primary-foreground"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span
                  className={`text-sm transition-colors ${
                    filters.marca === marca.id ? "text-foreground font-medium" : "text-muted-foreground"
                  }`}
                  onClick={() => updateFilter("marca", filters.marca === marca.id ? undefined : marca.id)}
                >
                  {marca.nombre}
                </span>
              </label>
            ))}
          </div>
        )}
      </FilterSection>

      {/* Categoria Filter - Ahora filtra por ID */}
      <FilterSection
        title="Categoría"
        isExpanded={expandedSections.includes("categoria")}
        onToggle={() => toggleSection("categoria")}
      >
        {loadingCategorias ? (
          <FilterSkeleton />
        ) : categorias.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay categorías disponibles</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {categorias.map((categoria) => (
              <label key={categoria.id} className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() =>
                    updateFilter("categoria", filters.categoria === categoria.id ? undefined : categoria.id)
                  }
                  className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                    filters.categoria === categoria.id
                      ? "bg-primary border-primary"
                      : "border-muted-foreground/30 group-hover:border-primary/50"
                  }`}
                >
                  {filters.categoria === categoria.id && (
                    <svg
                      className="w-3 h-3 text-primary-foreground"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span
                  className={`text-sm transition-colors ${
                    filters.categoria === categoria.id ? "text-foreground font-medium" : "text-muted-foreground"
                  }`}
                  onClick={() =>
                    updateFilter("categoria", filters.categoria === categoria.id ? undefined : categoria.id)
                  }
                >
                  {categoria.nombre}
                </span>
              </label>
            ))}
          </div>
        )}
      </FilterSection>

      {/* Tipo Filter - Se mantiene igual */}
      <FilterSection title="Tipo" isExpanded={expandedSections.includes("tipo")} onToggle={() => toggleSection("tipo")}>
        <div className="space-y-2">
          {tipos.map((tipo) => (
            <label key={tipo.value} className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => updateFilter("tipo", filters.tipo === tipo.value ? undefined : tipo.value)}
                className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                  filters.tipo === tipo.value
                    ? "bg-primary border-primary"
                    : "border-muted-foreground/30 group-hover:border-primary/50"
                }`}
              >
                {filters.tipo === tipo.value && (
                  <svg
                    className="w-3 h-3 text-primary-foreground"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span
                className={`text-sm transition-colors ${
                  filters.tipo === tipo.value ? "text-foreground font-medium" : "text-muted-foreground"
                }`}
                onClick={() => updateFilter("tipo", filters.tipo === tipo.value ? undefined : tipo.value)}
              >
                {tipo.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Mobile Clear Button */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="lg:hidden w-full py-3 glass rounded-2xl text-sm font-medium text-foreground hover:bg-secondary/50 transition-all duration-300"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  )
}

function FilterSection({
  title,
  isExpanded,
  onToggle,
  children,
}: {
  title: string
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border-b border-border/50 pb-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
      >
        {title}
        <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? "max-h-96 opacity-100 mt-3" : "max-h-0 opacity-0"
        }`}
      >
        {children}
      </div>
    </div>
  )
}