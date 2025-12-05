"use client"

import { useEffect } from "react"
import { useRequireAdmin } from "@/hooks/useAuth"

interface AdminRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export default function AdminRoute({ 
  children, 
  redirectTo = "/" 
}: AdminRouteProps) {
  const { authenticated, admin, loading } = useRequireAdmin(redirectTo)

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

  if (!authenticated || !admin) {
    return null // Redirección manejada por el hook
  }

  return <>{children}</>
}