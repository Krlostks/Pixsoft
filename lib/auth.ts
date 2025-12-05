import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

export interface DecodedToken {
  id: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
  // Agrega otras propiedades según tu token
}

// Obtener token de las cookies
export const getTokenFromCookies = (): string | undefined => {
  return Cookies.get('token');
};

// Decodificar token para obtener información del usuario
export const decodeToken = (token: string): DecodedToken | null => {
  try {
    if (!token) return null;
    return jwtDecode<DecodedToken>(token);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Obtener información del usuario desde el token
export const getUserFromToken = (): DecodedToken | null => {
  const token = getTokenFromCookies();
  if (!token) return null;
  return decodeToken(token);
};

// Verificar si el usuario está autenticado (con expiración)
export const isAuthenticated = (): boolean => {
  const token = getTokenFromCookies();
  if (!token) return false;
  
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    // Verificar si el token ha expirado (exp está en segundos)
    if (decoded.exp * 1000 < Date.now()) {
      Cookies.remove('token');
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
};

// Verificar si el usuario tiene un rol específico
export const hasRole = (requiredRole: string): boolean => {
  const user = getUserFromToken();
  if (!user) return false;
  return user.role === requiredRole;
};

// Verificar si el usuario es admin
export const isAdmin = (): boolean => {
  return hasRole('admin');
};

// Verificar si el usuario es usuario regular
export const isUser = (): boolean => {
  return hasRole('user');
};

// Cerrar sesión
export const logout = (): void => {
  Cookies.remove('token');
  // Redirigir al login
  window.location.href = '/login';
};

// Obtener el rol del usuario actual
export const getCurrentUserRole = (): string | null => {
  const user = getUserFromToken();
  return user ? user.role : null;
};

// Verificar si el usuario tiene al menos uno de los roles permitidos
export const hasAnyRole = (allowedRoles: string[]): boolean => {
  const user = getUserFromToken();
  if (!user) return false;
  return allowedRoles.includes(user.role);
};