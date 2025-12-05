// components/SearchResults.tsx
import { useState, useEffect } from 'react'
import { XIcon } from 'lucide-react'
import axios from 'axios'
import { ProductListItem } from '@/types/products'
import Link from 'next/link'

interface SearchResultsProps {
  query: string
  isActive: boolean
  onClose: () => void
  className?: string
}

export default function SearchResults({ 
  query, 
  isActive, 
  onClose, 
  className = '' 
}: SearchResultsProps) {
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query || query.length < 2 || !isActive) {
      setProducts([])
      return
    }

    setLoading(true)
    axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/productos`, {
      params: { searchQuery: query, limit: 8 }
    })
    .then(response => {
      setProducts(response.data.data)
      setLoading(false)
    })
    .catch(() => {
      setProducts([])
      setLoading(false)
    })
  }, [query, isActive])

  if (!isActive) return null

  return (
    <div className={`absolute left-0 right-0 md:left-auto md:right-0 md:w-full md:max-w-2xl top-full bg-background border border-border/50 rounded-2xl shadow-2xl z-50 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {loading ? 'Buscando...' : `${products.length} resultados`}
        </span>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-muted rounded-lg transition-colors"
        >
          <XIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Results */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary/80 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Buscando productos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No se encontraron productos</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/productos/${product.id}`}
                className="p-4 hover:bg-muted transition-colors flex gap-4 items-center group"
              >
                <div className="w-16 h-16 bg-muted rounded-xl flex-shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                  <img 
                    src={product.url_imagen || '/placeholder-product.jpg'} 
                    alt={product.producto_nombre}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {product.producto_nombre}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {product.categoria_nombre}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-lg">
                      ${product.precio_descuento || product.precio}
                    </span>
                    {product.precio_descuento && product.precio_descuento !== product.precio && (
                      <span className="text-xs text-muted-foreground line-through">
                        ${product.precio}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
