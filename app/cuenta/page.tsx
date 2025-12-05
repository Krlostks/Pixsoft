"use client"

import { useState, useEffect } from "react"
import Cookies from "js-cookie"
import axios from "axios"

// Iconos (simplificados como SVGs)
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

interface UserData {
  email: string
  first_name: string
  last_name: string
  created_at: string
  updated_at: string
  last_login: string
  url_imagen_user: string | null
}

export default function UserProfilePage() {
   const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const token = Cookies.get("token")

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    setIsLoading(true)

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/usuarios/detalles_usuario`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (!response.data.data) {
        console.error("Error desde backend:")
        setUserData(null)
        setIsLoading(false)
        return
      }

      setUserData(response.data.data)
      setIsLoading(false)

    } catch (error) {
      console.error("Error al obtener el usuario:", error)
      setUserData(null)
      setIsLoading(false)
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
        <div className="glass-strong rounded-3xl p-12 text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary/50 flex items-center justify-center">
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
          
          {/* Header con foto de perfil */}
          <div className="glass-strong rounded-3xl p-8 md:p-12 mb-8 relative overflow-hidden">
            {/* Decoración de fondo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
            
            <div className="relative flex flex-col md:flex-row items-center gap-8">
              {/* Foto de perfil circular */}
              <div className="relative group">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden ring-4 ring-primary/30 group-hover:ring-primary/50 transition-all duration-300 shadow-xl">
                  {userData.url_imagen_user ? (
                    <img 
                      src={userData.url_imagen_user} 
                      alt={`${userData.first_name} ${userData.last_name}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                      <UserIcon className="w-16 h-16 md:w-20 md:h-20 text-primary-foreground" />
                    </div>
                  )}
                </div>
                
                {/* Badge de estado online */}
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full ring-4 ring-background shadow-lg"></div>
              </div>

              {/* Info principal */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {userData.first_name} {userData.last_name}
                </h1>
                <p className="text-primary text-lg mb-4 flex items-center gap-2 justify-center md:justify-start">
                  <EmailIcon className="w-5 h-5" />
                  {userData.email}
                </p>
                
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <span className="px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-medium">
                    ⭐ Usuario Activo
                  </span>
                  <span className="px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-medium">
                    🎯 Miembro Verificado
                  </span>
                </div>
              </div>

              {/* Botón de editar */}
              <button 
                className="absolute top-6 right-6 p-3 glass rounded-2xl transition-all duration-300 group hover:bg-secondary/50"
                onClick={() => alert("Función de edición en desarrollo")}
              >
                <EditIcon className="w-5 h-5 text-foreground group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>

          {/* Grid de información */}
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Información de cuenta */}
            <div className="glass rounded-3xl p-6 md:p-8 hover:scale-[1.02] transition-all duration-300">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center shadow-lg">
                  <UserIcon className="w-5 h-5 text-primary-foreground" />
                </div>
                Información de Cuenta
              </h2>
              
              <div className="space-y-4">
                <InfoRow 
                  icon={<EmailIcon />}
                  label="Email"
                  value={userData.email}
                />
                
                <InfoRow 
                  icon={<UserIcon />}
                  label="Nombre Completo"
                  value={`${userData.first_name} ${userData.last_name}`}
                />
              </div>
            </div>

            {/* Actividad */}
            <div className="glass rounded-3xl p-6 md:p-8 hover:scale-[1.02] transition-all duration-300">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center shadow-lg">
                  <ClockIcon className="w-5 h-5 text-primary-foreground" />
                </div>
                Actividad
              </h2>
              
              <div className="space-y-4">
                <InfoRow 
                  icon={<CalendarIcon />}
                  label="Miembro desde"
                  value={formatDate(userData.created_at)}
                />
                
                <InfoRow 
                  icon={<ClockIcon />}
                  label="Último inicio de sesión"
                  value={formatDate(userData.last_login)}
                />
                
                <InfoRow 
                  icon={<CalendarIcon />}
                  label="Última actualización"
                  value={formatDate(userData.updated_at)}
                />
              </div>
            </div>

            {/* Estadísticas */}
            <div className="glass rounded-3xl p-6 md:p-8 hover:scale-[1.02] transition-all duration-300 md:col-span-2">
              <h2 className="text-xl font-bold text-foreground mb-6">Estadísticas de Usuario</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard 
                  icon="🛒"
                  value="12"
                  label="Compras Totales"
                />
                <StatCard 
                  icon="⭐"
                  value="4.8"
                  label="Calificación"
                />
                <StatCard 
                  icon="❤️"
                  value="24"
                  label="Favoritos"
                />
                <StatCard 
                  icon="🎁"
                  value="850"
                  label="Puntos"
                />
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  )
}

// Componente para filas de información
function InfoRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl bg-secondary/50 hover:bg-secondary transition-all duration-300">
      <div className="text-primary mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-muted-foreground text-sm mb-1">{label}</p>
        <p className="text-foreground font-medium break-words">{value}</p>
      </div>
    </div>
  )
}

// Componente para tarjetas de estadísticas
function StatCard({ icon, value, label }: { 
  icon: string, 
  value: string, 
  label: string
}) {
  return (
    <div className="glass-strong rounded-2xl p-6 text-center hover:scale-105 transition-all duration-300">
      <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
        {icon}
      </div>
      <p className="text-2xl font-bold text-foreground mb-1">{value}</p>
      <p className="text-muted-foreground text-sm">{label}</p>
    </div>
  )
}