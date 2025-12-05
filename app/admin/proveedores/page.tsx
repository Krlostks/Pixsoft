"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import {
  UsersIcon,
  SearchIcon,
  FilterIcon,
  UserIcon,
  ShieldIcon,
  UserCogIcon,
  CheckIcon,
  XIcon,
  MoreVerticalIcon,
  Loader2Icon
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import CrudProveedor from "@/components/proveedores/CrudProveedor"


export interface Proveedores {
  id?: number; // Opcional al crear un nuevo proveedor, se asigna automáticamente
  nombre: string;
  telefono?: string | null;
  email?: string | null;
  direccion_contacto_id: number;
  activo?: boolean; // Por defecto true
  notas?: string | null;
  fecha_creacion?: string; // Timestamp generado por la base de datos
  fecha_actualizacion?: string; // Timestamp actualizado automáticamente
}



export default function AdminProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedores[]>([])
  const [filteredProveedores, setFilteredProveedores] = useState<Proveedores[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [changingRole, setChangingRole] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedProveedorId, setSelectedProveedorId] = useState<number | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    fetchProveedores()
  }, [])

  useEffect(() => {
    //filterUsuarios()
  }, [proveedores, searchTerm, roleFilter, statusFilter])

  const fetchProveedores = async () => {
    try {
      setLoading(true)
      const token = Cookies.get("token")
      const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL

      const response = await axios.get(`${baseURL}/proveedores`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setProveedores(response.data)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Error al cargar los usuarios")
    } finally {
      setLoading(false)
    }
  }

  /*const filterUsuarios = () => {
    let filtered = [...proveedores]

    // Aplicar búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(user => 
        //user.first_name.toLowerCase().includes(term) ||
        //user.last_name.toLowerCase().includes(term) ||
        //user.email.toLowerCase().includes(term) ||
        (user.phone && user.phone.toLowerCase().includes(term))
      )
    }

    // Aplicar filtro de rol
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    // Aplicar filtro de estado
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active"
      filtered = filtered.filter(user => user.is_active === isActive)
    }

    setFilteredProveedores(filtered)
  }*/

  const handleChangeRole = async (userId: number, newRole: string) => {
    try {
      setChangingRole(userId)
      const token = Cookies.get("token")
      const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL

      const response = await axios.post(
        `${baseURL}/usuarios/change-role`,
        { userId, newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data.message) {
        // Actualizar el usuario localmente
        setProveedores(prev => prev.map(user =>
          user.id === userId ? { ...user, role: newRole } : user
        ))

        toast.success("Rol cambiado exitosamente")
      }
    } catch (error: any) {
      console.error("Error changing role:", error)
      toast.error(error.response?.data?.message || "Error al cambiar el rol")
    } finally {
      setChangingRole(null)
    }
  }


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-900/20">
            <UsersIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestión de Proveedores</h1>
            <p className="text-muted-foreground mt-2">
              Administra los proveedores en el sistema
            </p>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <Card className="glass rounded-3xl">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por nombre, email o teléfono..."
                className="pl-10 rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-4">


              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 rounded-xl">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                className="rounded-xl"
                onClick={fetchProveedores}
              >
                Actualizar
              </Button>
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  setSelectedProveedorId(null)
                  setIsEditing(false)
                  setShowForm(true)
                }}
              >
                Agregar nuevo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Usuarios */}
      <Card className="glass rounded-3xl overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-bold text-foreground">
            {filteredProveedores.length} Usuarios
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredProveedores.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="w-12 h-12 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground mt-4">No se encontraron usuarios</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-secondary/20">
                    <th className="text-left p-4 font-medium text-muted-foreground">Nombre</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Contacto</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Estado</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Registro</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Direccion</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProveedores.map((usuario) => (
                    <tr key={usuario.id} className="border-b hover:bg-secondary/10 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-foreground">
                            {usuario.activo} {usuario.email}
                          </p>
                          <p className="text-sm text-muted-foreground">ID: {usuario.id}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-foreground">{usuario.email}</p>
                          {usuario.telefono && (
                            <p className="text-sm text-muted-foreground">{usuario.telefono}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge
                          className={`flex items-center gap-1 w-fit ${usuario.activo
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                            }`}
                        >
                          {usuario.activo ? (
                            <>
                              <CheckIcon className="w-3 h-3" />
                              Activo
                            </>
                          ) : (
                            <>
                              <XIcon className="w-3 h-3" />
                              Inactivo
                            </>
                          )}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-muted-foreground">

                        </p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-muted-foreground">

                        </p>
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="rounded-xl">
                              <MoreVerticalIcon className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              className="font-medium"
                              onClick={() => {
                                setSelectedProveedorId(usuario.id!)
                                setIsEditing(true)
                                setShowForm(true)
                              }}
                            >
                              Editar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <CrudProveedor
            proveedorId={selectedProveedorId || undefined}
            isEditing={isEditing}
            onSuccess={() => {
              setShowForm(false)
              fetchProveedores() // Recargar la lista
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

    </div>
  )
}