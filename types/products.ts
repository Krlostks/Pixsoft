// Producto en listado
export interface ProductListItem {
  id: number
  producto_nombre: string
  url_imagen: string | null
  precio: string
  categoria_nombre: string
  precio_descuento: string
  destacado: boolean
  activo: boolean
  stock: number | null
  promedio_calificacion: string
}

// Respuesta de la API de productos
export interface ProductsResponse {
  page: number
  limit: number
  total: number
  total_pages: number
  data: ProductListItem[]
}

// Producto detallado
export interface ProductDetail {
  id: number
  producto_nombre: string
  descripcion: string
  caracteristicas: Record<string, string | number | boolean>
  categoria_nombre: string
  marca_nombre: string
  url_imagen: string | null
  precio: string
  precio_descuento: string
  destacado: boolean
  activo: boolean
  stock: number | null
  promedio_calificacion: string
}

// Respuesta de la API de producto individual
export interface ProductDetailResponse {
  data: ProductDetail
}

// Review (se mantiene igual para futuras implementaciones)
export interface Review {
  id: number
  userId: number
  userName: string
  userAvatar?: string
  rating: number
  title: string
  comment: string
  date: string
  helpful: number
  verified: boolean
}

// Filtros de productos para enviar al backend
export interface ProductFilters {
  marca?: number
  offer?: boolean
  categoria?: number
  tipo?: "fisico" | "digital"
  page?: number
  limit?: number
}

export interface Categoria {
  id: number
  nombre: string
  descripcion: string | null
  imagen_url: string | null
  activa: boolean
}

export interface Marca {
  id: number
  nombre: string
  descripcion: string | null
  logo_url: string | null
}
