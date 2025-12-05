"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import { toast } from "sonner"
import Link from "next/link"
import { 
  ArrowLeftIcon, 
  MapPinIcon, 
  PlusIcon
} from "@/components/icons"

import AddressCard from "@/components/direcciones/AddressCard"
import AddressForm from "@/components/direcciones/AddressForm"

interface Direccion {
  id: number
  alias: string | null
  calle: string
  numero_exterior: string
  numero_interior: string | null
  colonia: string | null
  ciudad: string
  estado: string
  codigo_postal: string
  pais: string
  entre_calles: string | null
  referencia: string | null
  es_principal: boolean
  es_facturacion: boolean
}

export default function DireccionesPage() {
  const [direcciones, setDirecciones] = useState<Direccion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingDireccion, setEditingDireccion] = useState<Direccion | null>(null)

  // Verificar token
  useEffect(() => {
    const t = Cookies.get("token")
    setToken(t || null)
  }, [])

  // Obtener direcciones
  const fetchDirecciones = useCallback(async () => {
    if (!token) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await axios.get<Direccion[]>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/direcciones/`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      setDirecciones(response.data)
    } catch (error: any) {
      console.error("Error al obtener direcciones:", error)
      if (error.response?.status === 401) {
        Cookies.remove("token")
        setToken(null)
        toast.error("Sesión expirada. Por favor, inicia sesión nuevamente.")
      } else {
        toast.error("Error al cargar las direcciones")
      }
      setDirecciones([])
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchDirecciones()
  }, [fetchDirecciones])

  // Eliminar dirección
  const handleDeleteDireccion = async (id: number) => {
    if (!token) return

    if (!confirm("¿Estás seguro de que deseas eliminar esta dirección?")) {
      return
    }

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/direcciones/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      toast.success("Dirección eliminada exitosamente")
      fetchDirecciones()
    } catch (error: any) {
      console.error("Error al eliminar dirección:", error)
      const errorMessage = error.response?.data || "Error al eliminar la dirección"
      toast.error(errorMessage)
    }
  }

  // Actualizar estados después de establecer como principal/facturación
  const handleSetPrincipal = (id: number) => {
    setDirecciones(prev => 
      prev.map(dir => ({
        ...dir,
        es_principal: dir.id === id
      }))
    )
  }

  const handleSetFacturacion = (id: number) => {
    setDirecciones(prev => 
      prev.map(dir => ({
        ...dir,
        es_facturacion: dir.id === id
      }))
    )
  }

  // Manejar edición
  const handleEditDireccion = (direccion: Direccion) => {
    setEditingDireccion(direccion)
    setShowForm(true)
  }

  // Manejar éxito del formulario
  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingDireccion(null)
    fetchDirecciones()
  }

  // Manejar cancelación del formulario
  const handleFormCancel = () => {
    setShowForm(false)
    setEditingDireccion(null)
  }

  // Si no hay token, mostrar mensaje para iniciar sesión
  if (!token && !isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="pt-10 pb-20">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <Link
                href="/perfil"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors duration-300 mb-6"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span>Volver al perfil</span>
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Mis Direcciones
              </h1>
              <p className="text-muted-foreground">
                Gestiona tus direcciones de envío y facturación
              </p>
            </div>

            <div className="glass rounded-3xl p-12 text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary/50 flex items-center justify-center">
                <MapPinIcon className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Acceso requerido
              </h3>
              <p className="text-muted-foreground mb-6">
                Debes iniciar sesión para gestionar tus direcciones
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/login"
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-medium hover:bg-primary/90 transition-all duration-300"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/"
                  className="px-6 py-3 glass rounded-2xl font-medium hover:bg-secondary/50 transition-all duration-300"
                >
                  Volver al inicio
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-10 pb-20">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <Link
              href="/perfil"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors duration-300 mb-6"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Volver al perfil</span>
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Mis Direcciones
            </h1>
            <p className="text-muted-foreground">
              Gestiona tus direcciones de envío y facturación
            </p>
          </div>

          {isLoading ? (
            // Loading State
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="glass rounded-3xl p-6 animate-pulse">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <div className="h-6 bg-secondary/50 rounded w-1/3" />
                      <div className="h-8 bg-secondary/50 rounded w-16" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-secondary/50 rounded w-full" />
                      <div className="h-4 bg-secondary/50 rounded w-3/4" />
                      <div className="h-4 bg-secondary/50 rounded w-1/2" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-6 bg-secondary/50 rounded w-24" />
                      <div className="h-6 bg-secondary/50 rounded w-28" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : showForm ? (
            // Mostrar formulario
            <div className="max-w-4xl mx-auto">
              <AddressForm
                direccion={editingDireccion}
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
              />
            </div>
          ) : (
            // Mostrar direcciones existentes
            <>
              {/* Botón para agregar nueva dirección */}
              <div className="mb-8">
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-3 px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-medium hover:bg-primary/90 transition-all duration-300 hover:scale-[1.02]"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Agregar Nueva Dirección</span>
                </button>
              </div>

              {direcciones.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {direcciones.map((direccion) => (
                    <AddressCard
                      key={direccion.id}
                      direccion={direccion}
                      onEdit={handleEditDireccion}
                      onDelete={handleDeleteDireccion}
                      onSetPrincipal={handleSetPrincipal}
                      onSetFacturacion={handleSetFacturacion}
                    />
                  ))}
                </div>
              ) : (
                // Estado vacío (usuario autenticado pero sin direcciones)
                <div className="glass rounded-3xl p-12 text-center max-w-2xl mx-auto">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary/50 flex items-center justify-center">
                    <MapPinIcon className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No tienes direcciones guardadas
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Agrega tu primera dirección para poder recibir tus pedidos
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-medium hover:bg-primary/90 transition-all duration-300"
                  >
                    Agregar Mi Primera Dirección
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}