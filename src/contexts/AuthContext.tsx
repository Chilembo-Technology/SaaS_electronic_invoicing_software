import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { User } from '../types/api';
import { authService } from '../services/authService';
import { getStoredToken, setStoredToken, removeStoredToken } from '../lib/api';
import { clearPendingLogin } from '../features/auth/utils/otpSession';

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
  /**
   * Termina a sessão: avisa o backend (`POST /v1/auth/logout`), limpa o estado
   * local e volta a `/login`. É síncrono para quem chama (a espera pelo backend
   * acontece por dentro) — ver `isLoggingOut` para o feedback visual.
   */
  logout: () => void;
  /** `true` enquanto o logout está em curso (a sidebar mostra "A sair..."). */
  isLoggingOut: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  /** Trava de reentrada: impede um segundo logout enquanto o primeiro decorre. */
  const logoutInFlight = useRef<boolean>(false);

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

  /**
   * Fecha a sessão no backend e, em QUALQUER desfecho (sucesso, 401, 500 ou falha
   * de rede), limpa a sessão local e volta a `/login`.
   *
   * Porquê na ordem actual:
   *   1. o pedido é feito ANTES de `removeStoredToken()` — o token tem de existir
   *      quando o header `Authorization` é montado (ver `authService.logout`);
   *   2. a limpeza vive no `finally`, para que um backend inacessível nunca deixe
   *      o utilizador preso numa sessão que já não serve;
   *   3. `window.location` (e não o router) porque o `AuthProvider` vive ACIMA do
   *      `RouterProvider` — não há `useNavigate()` neste nível — e uma recarga
   *      total garante que nenhum estado autenticado sobrevive em memória.
   */
  const finishSession = async (): Promise<void> => {
    try {
      // 1) Avisa o backend (que invalida o JWT) enquanto o token ainda existe.
      await authService.logout();
    } catch {
      // Rede, 401 ou 500: o serviço já engole estes erros, mas o logout local
      // nunca pode depender do backend (o `finally` abaixo corre na mesma).
    } finally {
      // 2) Limpeza local — acontece SEMPRE, mesmo que o backend falhe.
      removeStoredToken();
      // Sessão de OTP pendente (`sessionStorage`) — não deve sobreviver ao logout.
      clearPendingLogin();
      setUser(null);
      setIsLoggingOut(false);
      logoutInFlight.current = false;

      // 3) Recarga total para `/login`: nenhum estado autenticado sobrevive.
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  };

  /** Ligado ao botão "Sair da Conta" da sidebar (ver `Layout`). */
  const logout = (): void => {
    if (logoutInFlight.current) return;

    logoutInFlight.current = true;
    setIsLoggingOut(true);
    void finishSession();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        isLoggingOut,
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
