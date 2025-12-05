import { useState, useEffect, useCallback } from 'react';
import { 
  getUserFromToken, 
  isAuthenticated, 
  isAdmin, 
  getCurrentUserRole,
  hasRole,
  hasAnyRole 
} from '@/lib/auth';

export const useAuth = () => {
  const [user, setUser] = useState(getUserFromToken());
  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const [admin, setAdmin] = useState(isAdmin());
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(() => {
    const userData = getUserFromToken();
    setUser(userData);
    setAuthenticated(isAuthenticated());
    setAdmin(isAdmin());
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
    
    // Escuchar cambios en las cookies (opcional)
    const interval = setInterval(checkAuth, 5000);
    
    return () => clearInterval(interval);
  }, [checkAuth]);

  return {
    user,
    authenticated,
    admin,
    loading,
    role: getCurrentUserRole(),
    hasRole,
    hasAnyRole,
    checkAuth,
  };
};

// Hook para proteger rutas que requieren autenticación
export const useRequireAuth = (redirectTo = '/login') => {
  const { authenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !authenticated) {
      window.location.href = redirectTo;
    }
  }, [authenticated, loading, redirectTo]);

  return { authenticated, loading };
};

// Hook para proteger rutas que requieren admin
export const useRequireAdmin = (redirectTo = '/access-denied') => {
  const { authenticated, admin, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!authenticated) {
        window.location.href = '/login';
      } else if (!admin) {
        window.location.href = redirectTo;
      }
    }
  }, [authenticated, admin, loading, redirectTo]);

  return { authenticated, admin, loading };
};