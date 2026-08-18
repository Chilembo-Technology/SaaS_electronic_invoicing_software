import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthLoginCredentials } from '../types/api';
import { authService } from '../services/authService';

const TOKEN_KEY = '@SaaS:token';

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: AuthLoginCredentials) => Promise<void>;
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
      const token = localStorage.getItem(TOKEN_KEY);

      if (token) {
        try {
          const userData = await authService.getProfile();
          setUser(userData);
        } catch {
          localStorage.removeItem(TOKEN_KEY);
          setUser(null);
        }
      }

      setIsLoading(false);
    }

    loadStorageData();
  }, []);

  const login = async (credentials: AuthLoginCredentials): Promise<void> => {
    const response = await authService.login(credentials);
    localStorage.setItem(TOKEN_KEY, response.token);
    setUser(response.user);
  };

  const logout = (): void => {
    localStorage.removeItem(TOKEN_KEY);
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
