import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/api';
import { authService } from '../services/authService';
import { getStoredToken, setStoredToken, removeStoredToken } from '../lib/api';

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /**
   * Guarda a sessão devolvida por `POST /v1/auth/verify-otp` (token JWT +
   * utilizador). O pedido do OTP e a sua validação vivem em
   * `features/auth/services/loginService.ts`.
   */
  login: (token: string, user: User) => void;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadStorageData() {
      const token = getStoredToken();

      if (token) {
        try {
          const userData = await authService.getProfile();
          setUser(userData);
        } catch {
          removeStoredToken();
          setUser(null);
        }
      }

      setIsLoading(false);
    }

    loadStorageData();
  }, []);

  /**
   * Guarda a sessão autenticada: o token JWT fica no `localStorage` (para o
   * interceptor do cliente HTTP o reenviar) e o utilizador em memória.
   * É chamado pela `VerifyOtpPage` depois do `/verify-otp` ser aceite.
   */
  const login = (token: string, user: User): void => {
    setStoredToken(token);
    setUser(user);
  };

  const logout = (): void => {
    authService.logout();
    removeStoredToken();
    setUser(null);
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }

  return context;
}
