import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { getCookie, setCookie, deleteCookie } from '../utils/cookies';
import { User } from '../services/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = getCookie('authToken');
      console.log('🔑 useAuth - Verificando token:', token ? 'Token encontrado' : 'No hay token');
      
      if (token) {
        // Validar token con el backend
        const { valid, user } = await authService.validateToken(token);
        console.log('🔍 useAuth - Validación del token:', { valid, user });
        
        if (valid && user) {
          console.log('✅ useAuth - Token válido, usuario:', user);
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          console.log('❌ useAuth - Token inválido');
          // Token inválido, limpiar cookie
          deleteCookie('authToken');
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else {
        console.log('⚠️ useAuth - No hay token en cookies');
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('❌ useAuth - Error verificando autenticación:', error);
      deleteCookie('authToken');
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const register = async (fullName: string, email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await authService.register({ fullName, email, password });
      
      // Guardar token en cookie
      setCookie('authToken', response.token, 7);
      
      setAuthState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
      
      return response.user;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await authService.login({ email, password });
      
      // Guardar token en cookie
      setCookie('authToken', response.token, 7);
      
      setAuthState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
      
      return response.user;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = () => {
    deleteCookie('authToken');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const hasAccess = (): boolean => {
    const user = authState.user;
    if (!user) {
      return false;
    }

    // Admins y superadmins siempre tienen acceso, sin importar el plan
    if (user.role === 'admin' || user.role === 'superadmin') {
      return true;
    }

    // Si no hay fechas de plan definidas, se considera usuario free
    if (!user.planStartDate || !user.planEndDate) {
      return false;
    }

    // Verificar si el plan está activo (fecha actual entre start y end)
    const now = new Date();
    const startDate = new Date(user.planStartDate);
    const endDate = new Date(user.planEndDate);
    return now >= startDate && now <= endDate;
  };

  const isAdmin = (): boolean => {
    const user = authState.user;
    return user?.role === 'admin' || user?.role === 'superadmin' || false;
  };

  const isSuperAdmin = (): boolean => {
    const user = authState.user;
    return user?.role === 'superadmin' || false;
  };

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    hasAccess,
    isAdmin,
    isSuperAdmin,
    register,
    login,
    logout,
  };
}
