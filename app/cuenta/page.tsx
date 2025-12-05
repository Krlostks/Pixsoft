"use client"

import { useState, useEffect } from "react"
import Cookies from "js-cookie"
import axios from "axios"
import { User, Mail, Clock, Calendar, Edit2, X, Image } from "lucide-react"


// --- Iconos (resumidos para no repetir todo) ---
const UserIcon = ({ className = "w-6 h-6" }) => <svg />
const EmailIcon = ({ className = "w-5 h-5" }) => <svg />
const CalendarIcon = ({ className = "w-5 h-5" }) => <svg />
const ClockIcon = ({ className = "w-5 h-5" }) => <svg />
const EditIcon = ({ className = "w-5 h-5" }) => <svg />
const CloseIcon = ({ className = "w-6 h-6" }) => <svg />
const ImageIcon = ({ className = "w-5 h-5" }) => <svg />

interface UserData {
  email: string
  first_name: string
  last_name: string
  created_at: string
  updated_at: string
  last_login: string
  url_imagen_user: string | null
}

interface EditFormData {
  email: string
  first_name: string
  last_name: string
  url_imagen_user: string
}

export default function UserProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editForm, setEditForm] = useState<EditFormData>({
    email: "",
    first_name: "",
    last_name: "",
    url_imagen_user: ""
  })

  const fetchUserData = async () => {
    setIsLoading(true)
    try {
      const token = Cookies.get("token")
      if (!token) throw new Error("No se encontró token de usuario")

      // Llamamos al endpoint que obtiene al usuario desde el token
      const res = await axios.get("http://localhost:8080/api/usuarios/cuenta", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data: UserData = res.data.data
      setUserData(data)
      setEditForm({
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        url_imagen_user: data.url_imagen_user || ""
      })
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching user data:", error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [])

  const handleEditClick = () => {
    if (userData) {
      setEditForm({
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        url_imagen_user: userData.url_imagen_user || ""
      })
    }
    setIsEditModalOpen(true)
  }

  const handleSaveChanges = async () => {
    setIsSaving(true)
    try {
      const token = Cookies.get("token")
      if (!token) throw new Error("No se encontró token de usuario")

      // Guardar cambios en el backend usando el token
      const res = await axios.put(
        "http://localhost:8080/api/usuarios/actualizar",
        editForm,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      setUserData(res.data.data || {
        ...userData!,
        ...editForm,
        updated_at: new Date().toISOString()
      })
      setIsSaving(false)
      setIsEditModalOpen(false)
      alert("✅ Cambios guardados exitosamente")
    } catch (error) {
      console.error("Error saving changes:", error)
      setIsSaving(false)
      alert("❌ Error al guardar los cambios")
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("es-MX", { 
      year: "numeric", 
      month: "long", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  if (isLoading) return <p>Cargando perfil...</p>
  if (!userData) return <p>Usuario no encontrado</p>

return (
    <div className="min-h-screen bg-background">
      <main className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          
          {/* Header Card */}
          <div className="relative mb-8 glass rounded-3xl p-8 shadow-xl">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
              
              {/* Avatar */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-primary shadow-2xl ring-4 ring-border/50">
                  {userData.url_imagen_user ? (
                    <img 
                      src={userData.url_imagen_user} 
                      alt={`${userData.first_name} ${userData.last_name}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-16 h-16 text-primary-foreground" strokeWidth={1.5} />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-9 h-9 bg-green-500 rounded-full border-4 border-background shadow-lg"></div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-3">
                  {userData.first_name} {userData.last_name}
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground text-lg mb-6 justify-center lg:justify-start">
                  <Mail className="w-5 h-5" strokeWidth={2} />
                  <span className="font-medium">{userData.email}</span>
                </div>
                
                <div className="flex flex-wrap gap-2.5 justify-center lg:justify-start">
                  <span className="px-5 py-2 bg-primary/10 border border-primary/20 text-primary rounded-full text-sm font-semibold">
                    ⭐ Usuario Activo
                  </span>
                  <span className="px-5 py-2 bg-primary/10 border border-primary/20 text-primary rounded-full text-sm font-semibold">
                    🎯 Miembro Verificado
                  </span>
                </div>
              </div>

              {/* Edit Button */}
              <button 
                onClick={handleEditClick}
                className="absolute top-6 right-6 group/btn p-3 glass hover:bg-secondary rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Edit2 className="w-5 h-5 text-foreground group-hover/btn:text-primary transition-colors" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            
            {/* Account Info */}
            <div className="glass rounded-3xl p-7 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-7">
                <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="w-7 h-7 text-primary-foreground" strokeWidth={2} />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Información de Cuenta</h2>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-secondary/30 border border-border/30 transition-all duration-200 hover:bg-secondary/50">
                  <div className="mt-1 p-2 bg-primary/10 rounded-xl">
                    <Mail className="w-5 h-5 text-primary" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">Email</p>
                    <p className="text-foreground font-medium text-base">{userData.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-secondary/30 border border-border/30 transition-all duration-200 hover:bg-secondary/50">
                  <div className="mt-1 p-2 bg-primary/10 rounded-xl">
                    <User className="w-5 h-5 text-primary" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">Nombre Completo</p>
                    <p className="text-foreground font-medium text-base">{userData.first_name} {userData.last_name}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity */}
            <div className="glass rounded-3xl p-7 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-7">
                <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                  <Clock className="w-7 h-7 text-primary-foreground" strokeWidth={2} />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Actividad</h2>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-secondary/30 border border-border/30 transition-all duration-200 hover:bg-secondary/50">
                  <div className="mt-1 p-2 bg-primary/10 rounded-xl">
                    <Calendar className="w-5 h-5 text-primary" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">Miembro desde</p>
                    <p className="text-foreground font-medium text-sm">{formatDate(userData.created_at)}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-secondary/30 border border-border/30 transition-all duration-200 hover:bg-secondary/50">
                  <div className="mt-1 p-2 bg-primary/10 rounded-xl">
                    <Clock className="w-5 h-5 text-primary" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">Último inicio de sesión</p>
                    <p className="text-foreground font-medium text-sm">{formatDate(userData.last_login)}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-secondary/30 border border-border/30 transition-all duration-200 hover:bg-secondary/50">
                  <div className="mt-1 p-2 bg-primary/10 rounded-xl">
                    <Calendar className="w-5 h-5 text-primary" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">Última actualización</p>
                    <p className="text-foreground font-medium text-sm">{formatDate(userData.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !isSaving && setIsEditModalOpen(false)}
          ></div>

          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8">
              
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                    <Edit2 className="w-7 h-7 text-primary-foreground" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-foreground">Editar Perfil</h2>
                    <p className="text-muted-foreground text-sm font-medium mt-1">Actualiza tu información personal</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => !isSaving && setIsEditModalOpen(false)}
                  className="p-3 bg-secondary/50 hover:bg-secondary rounded-2xl transition-all duration-200 shadow-sm hover:shadow-md"
                  disabled={isSaving}
                >
                  <X className="w-6 h-6 text-foreground" strokeWidth={2} />
                </button>
              </div> 

              {/* Photo Preview */}
              <div className="flex flex-col items-center gap-4 mb-8 p-6 bg-secondary/30 border border-border/30 rounded-2xl">
                <div className="w-28 h-28 rounded-full overflow-hidden bg-primary shadow-xl ring-4 ring-border/50">
                  {editForm.url_imagen_user ? (
                    <img 
                      src={editForm.url_imagen_user} 
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-14 h-14 text-primary-foreground" strokeWidth={1.5} />
                    </div>
                  )}
                </div>
             
              </div>

              {/* Form */}
              <div className="space-y-5">
                
                {/* First Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
                    <User className="w-4 h-4 text-primary" strokeWidth={2.5} />
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                    className="w-full px-5 py-3.5 bg-secondary/50 border-2 border-border hover:border-primary/50 focus:border-primary rounded-2xl text-foreground placeholder:text-muted-foreground font-medium focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all duration-200"
                    placeholder="Ingresa tu nombre"
                    disabled={isSaving}
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
                    <User className="w-4 h-4 text-primary" strokeWidth={2.5} />
                    Apellido
                  </label>
                  <input
                    type="text"
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                    className="w-full px-5 py-3.5 bg-secondary/50 border-2 border-border hover:border-primary/50 focus:border-primary rounded-2xl text-foreground placeholder:text-muted-foreground font-medium focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all duration-200"
                    placeholder="Ingresa tu apellido"
                    disabled={isSaving}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
                    <Mail className="w-4 h-4 text-primary" strokeWidth={2.5} />
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-5 py-3.5 bg-secondary/50 border-2 border-border hover:border-primary/50 focus:border-primary rounded-2xl text-foreground placeholder:text-muted-foreground font-medium focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all duration-200"
                    placeholder="tu@email.com"
                    disabled={isSaving}
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-6">
                  <button
                    onClick={() => !isSaving && setIsEditModalOpen(false)}
                    className="flex-1 px-6 py-4 glass border border-border/30 rounded-2xl font-bold text-foreground transition-all duration-200 shadow-sm hover:shadow-md hover:bg-secondary/50"
                    disabled={isSaving}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="flex-1 px-6 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-5 h-5 border-3 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <span>Guardar Cambios</span>
                    )}
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};