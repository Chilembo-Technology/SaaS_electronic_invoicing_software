import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthLoginCredentials } from '../types/api';
import { authService } from '../services/authService';
import { getStoredToken, setStoredToken, removeStoredToken } from '../lib/api';

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

  const login = async (credentials: AuthLoginCredentials): Promise<void> => {
    const response = await authService.login(credentials);
    if (response.token) {
      setStoredToken(response.token);
    }
    if (response.user) {
      setUser(response.user);
    } else {
      try {
        const userData = await authService.getProfile();
        setUser(userData);
      } catch {
        setUser(null);
      }
    }
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
