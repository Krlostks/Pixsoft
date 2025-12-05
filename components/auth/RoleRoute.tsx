"use client"

import { useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

interface RoleRouteProps {
  children: React.ReactNode
  allowedRoles: string[]
  redirectTo?: string
}

export default function RoleRoute({ 
  children, 
  allowedRoles, 
  redirectTo = "/access-denied" 
}: RoleRouteProps) {
  const { authenticated, role, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!authenticated) {
        router.push("/login")
      } else if (role && !allowedRoles.includes(role)) {
        router.push(redirectTo)
      }
    }
  }, [authenticated, role, loading, allowedRoles, redirectTo, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  if (!authenticated || !role || !allowedRoles.includes(role)) {
    return null // Redirección manejada por el useEffect
  }

  return <>{children}</>
}