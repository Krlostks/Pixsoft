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

interface Usuario {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string | null
  role: string
  is_active: boolean
  created_at: string
}

interface RoleOption {
  value: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [changingRole, setChangingRole] = useState<number | null>(null)

  const roleOptions: RoleOption[] = [
    { value: "admin", label: "Administrador", icon: ShieldIcon, color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" },
    { value: "cliente", label: "Cliente", icon: UserIcon, color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
    { value: "vendedor", label: "Vendedor", icon: UserCogIcon, color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
  ]

  useEffect(() => {
    fetchUsuarios()
  }, [])

  useEffect(() => {
    filterUsuarios()
  }, [usuarios, searchTerm, roleFilter, statusFilter])

  const fetchUsuarios = async () => {
    try {
      setLoading(true)
      const token = Cookies.get("token")
      const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL
      
      const response = await axios.get(`${baseURL}/usuarios`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setUsuarios(response.data)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Error al cargar los usuarios")
    } finally {
      setLoading(false)
    }
  }

  const filterUsuarios = () => {
    let filtered = [...usuarios]

    // Aplicar búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(user => 
        user.first_name.toLowerCase().includes(term) ||
        user.last_name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
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

    setFilteredUsuarios(filtered)
  }

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
        setUsuarios(prev => prev.map(user => 
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

  const getRoleBadge = (role: string) => {
    const roleOption = roleOptions.find(r => r.value === role) || roleOptions[1]
    const Icon = roleOption.icon
    
    return (
      <Badge className={`${roleOption.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {roleOption.label}
      </Badge>
    )
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
            <h1 className="text-3xl font-bold text-foreground">Gestión de Usuarios</h1>
            <p className="text-muted-foreground mt-2">
              Administra los usuarios y sus roles en el sistema
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
              <div className="flex items-center gap-2">
                <FilterIcon className="w-4 h-4 text-muted-foreground" />
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-32 rounded-xl">
                    <SelectValue placeholder="Rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los roles</SelectItem>
                    {roleOptions.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex items-center gap-2">
                          <role.icon className="w-3 h-3" />
                          {role.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
                onClick={fetchUsuarios}
              >
                Actualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Usuarios */}
      <Card className="glass rounded-3xl overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-bold text-foreground">
            {filteredUsuarios.length} Usuarios
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredUsuarios.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="w-12 h-12 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground mt-4">No se encontraron usuarios</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-secondary/20">
                    <th className="text-left p-4 font-medium text-muted-foreground">Usuario</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Contacto</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Rol</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Estado</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Registro</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsuarios.map((usuario) => (
                    <tr key={usuario.id} className="border-b hover:bg-secondary/10 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-foreground">
                            {usuario.first_name} {usuario.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">ID: {usuario.id}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-foreground">{usuario.email}</p>
                          {usuario.phone && (
                            <p className="text-sm text-muted-foreground">{usuario.phone}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {getRoleBadge(usuario.role)}
                      </td>
                      <td className="p-4">
                        <Badge 
                          className={`flex items-center gap-1 w-fit ${
                            usuario.is_active 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          }`}
                        >
                          {usuario.is_active ? (
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
                          {formatDate(usuario.created_at)}
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
                            <DropdownMenuItem className="font-medium">
                              Cambiar Rol:
                            </DropdownMenuItem>
                            {roleOptions.map((role) => (
                              <DropdownMenuItem 
                                key={role.value}
                                onClick={() => handleChangeRole(usuario.id, role.value)}
                                disabled={changingRole === usuario.id || usuario.role === role.value}
                                className="flex items-center gap-2"
                              >
                                <role.icon className="w-3 h-3" />
                                {role.label}
                                {changingRole === usuario.id && (
                                  <Loader2Icon className="w-3 h-3 animate-spin ml-auto" />
                                )}
                              </DropdownMenuItem>
                            ))}
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

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20">
                <UserIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Clientes</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-4">
              {usuarios.filter(u => u.role === 'cliente').length}
            </p>
          </CardContent>
        </Card>

        <Card className="glass rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-900/20">
                <ShieldIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Administradores</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-4">
              {usuarios.filter(u => u.role === 'admin').length}
            </p>
          </CardContent>
        </Card>

        <Card className="glass rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-green-50 dark:bg-green-900/20">
                <UserCogIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Vendedores</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-4">
              {usuarios.filter(u => u.role === 'vendedor').length}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}