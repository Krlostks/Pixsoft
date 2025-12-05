"use client"

import { useState, useEffect } from "react"

// Iconos
const UserIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
)

const EmailIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
  </svg>
)

const CalendarIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
  </svg>
)

const ClockIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
)

const EditIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
)

const CloseIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
)

const ImageIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
  </svg>
)

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
  const [userId] = useState(1)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editForm, setEditForm] = useState<EditFormData>({
    email: "",
    first_name: "",
    last_name: "",
    url_imagen_user: ""
  })

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    setIsLoading(true)
    try {
      setTimeout(() => {
        const demoData = {
          email: "lruckstar666@gmail.com",
          first_name: "Gabobriel",
          last_name: "Garcia",
          created_at: "2025-12-04T19:56:00Z",
          updated_at: "2025-12-05T18:49:00Z",
          last_login: "2025-12-04T19:56:00Z",
          url_imagen_user: null
        }
        setUserData(demoData)
        setEditForm({
          email: demoData.email,
          first_name: demoData.first_name,
          last_name: demoData.last_name,
          url_imagen_user: demoData.url_imagen_user || ""
        })
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Error fetching user data:", error)
      setIsLoading(false)
    }
  }

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
      setTimeout(() => {
        setUserData({
          ...userData!,
          email: editForm.email,
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          url_imagen_user: editForm.url_imagen_user || null,
          updated_at: new Date().toISOString()
        })
        setIsSaving(false)
        setIsEditModalOpen(false)
        alert("✅ Cambios guardados exitosamente")
      }, 1500)
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="glass rounded-3xl p-12 text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
            <UserIcon className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Usuario no encontrado</h3>
          <p className="text-muted-foreground">No se pudieron cargar los datos del usuario</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-10 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          
          {/* Header Card */}
          <div className="glass rounded-3xl p-8 mb-6 relative">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar con badge verde */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-primary flex items-center justify-center shadow-xl">
                  {userData.url_imagen_user ? (
                    <img 
                      src={userData.url_imagen_user} 
                      alt={`${userData.first_name} ${userData.last_name}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-16 h-16 text-primary-foreground" />
                  )}
                </div>
                <div className="absolute bottom-1 right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-background"></div>
              </div>

              {/* Info Principal */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {userData.first_name} {userData.last_name}
                </h1>
                <p className="text-primary text-lg mb-4 flex items-center gap-2 justify-center md:justify-start">
                  <EmailIcon className="w-5 h-5" />
                  {userData.email}
                </p>
                
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium flex items-center gap-2">
                    ⭐ Usuario Activo
                  </span>
                  <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium flex items-center gap-2">
                    🎯 Miembro Verificado
                  </span>
                </div>
              </div>

              {/* Botón Editar */}
              <button 
                className="absolute top-6 right-6 p-3 hover:bg-secondary rounded-2xl transition-all duration-200"
                onClick={handleEditClick}
              >
                <EditIcon className="w-5 h-5 text-foreground" />
              </button>
            </div>
          </div>

          {/* Grid de Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Información de Cuenta */}
            <div className="glass rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Información de Cuenta</h2>
              </div>
              
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <EmailIcon className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email</p>
                    <p className="text-foreground font-medium">{userData.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <UserIcon className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Nombre Completo</p>
                    <p className="text-foreground font-medium">{userData.first_name} {userData.last_name}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actividad */}
            <div className="glass rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <ClockIcon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Actividad</h2>
              </div>
              
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <CalendarIcon className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Miembro desde</p>
                    <p className="text-foreground font-medium">{formatDate(userData.created_at)}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <ClockIcon className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Último inicio de sesión</p>
                    <p className="text-foreground font-medium">{formatDate(userData.last_login)}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CalendarIcon className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Última actualización</p>
                    <p className="text-foreground font-medium">{formatDate(userData.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Modal de Edición */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !isSaving && setIsEditModalOpen(false)}
          ></div>

          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background rounded-3xl shadow-2xl">
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <EditIcon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Editar Perfil</h2>
                    <p className="text-muted-foreground text-sm">Actualiza tu información personal</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => !isSaving && setIsEditModalOpen(false)}
                  className="p-2 hover:bg-secondary rounded-xl transition-all"
                  disabled={isSaving}
                >
                  <CloseIcon className="w-6 h-6 text-muted-foreground" />
                </button>
              </div>

              {/* Preview de Foto */}
              <div className="flex flex-col items-center gap-3 mb-8 p-6 bg-secondary/30 rounded-2xl">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-primary flex items-center justify-center shadow-lg">
                  {editForm.url_imagen_user ? (
                    <img 
                      src={editForm.url_imagen_user} 
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-12 h-12 text-primary-foreground" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Vista previa de la foto</p>
              </div>

              {/* Formulario */}
              <div className="space-y-6">
                
                {/* Nombre */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                    <UserIcon className="w-4 h-4 text-primary" />
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                    className="w-full px-4 py-3 bg-secondary/50 border border-secondary rounded-2xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:outline-none transition-all"
                    placeholder="Ingresa tu nombre"
                    disabled={isSaving}
                  />
                </div>

                {/* Apellido */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                    <UserIcon className="w-4 h-4 text-primary" />
                    Apellido
                  </label>
                  <input
                    type="text"
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                    className="w-full px-4 py-3 bg-secondary/50 border border-secondary rounded-2xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:outline-none transition-all"
                    placeholder="Ingresa tu apellido"
                    disabled={isSaving}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                    <EmailIcon className="w-4 h-4 text-primary" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-4 py-3 bg-secondary/50 border border-secondary rounded-2xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:outline-none transition-all"
                    placeholder="tu@email.com"
                    disabled={isSaving}
                  />
                </div>

                {/* URL de Imagen */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    URL de Foto de Perfil
                  </label>
                  <input
                    type="url"
                    value={editForm.url_imagen_user}
                    onChange={(e) => setEditForm({ ...editForm, url_imagen_user: e.target.value })}
                    className="w-full px-4 py-3 bg-secondary/50 border border-secondary rounded-2xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:outline-none transition-all"
                    placeholder="https://ejemplo.com/foto.jpg"
                    disabled={isSaving}
                  />
                  <p className="text-xs text-muted-foreground mt-2">Deja vacío para usar el avatar predeterminado</p>
                </div>

                {/* Botones */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => !isSaving && setIsEditModalOpen(false)}
                    className="flex-1 px-6 py-3 bg-secondary hover:bg-secondary/80 rounded-2xl font-semibold text-foreground transition-all"
                    disabled={isSaving}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        Guardar Cambios
                      </>
                    )}
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}