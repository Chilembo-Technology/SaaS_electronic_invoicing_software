import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

export const TOKEN_KEY = '@Chilembo:token';
export const LEGACY_TOKEN_KEY = '@SaaS:token';

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
};

export const setStoredToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(LEGACY_TOKEN_KEY, token);
};

export const removeStoredToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
};

/**
 * Cliente HTTP central da aplicação.
 *
 * Ambas as instâncias partilham a MESMA raiz da API (`/api`) porque as rotas do
 * backend já estão versionadas do lado do servidor:
 *   - auth_service:         /api/v1/auth/*   e  /api/v1/users/*
 *   - organization_service: /api/v1/company/*
 *
 * A raiz é relativa (`/api`) para passar pelo proxy reverso (nginx em Docker) e
 * pelo `server.proxy` do Vite em desenvolvimento — evita CORS e funciona com um
 * único `.env`. Em `.env.example` estão documentadas as alternativas absolutas
 * (ligação directa a http://localhost:8001/api e http://localhost:8002/api).
 */
const DEFAULT_API_ROOT = '/api';

/** Tempo máximo (ms) por pedido — evita pedidos "pendurados" e dá erro de rede tratável. */
const REQUEST_TIMEOUT = 20000;

export const authApi: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_URL || DEFAULT_API_ROOT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: REQUEST_TIMEOUT,
});

export const orgApi: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_ORGANIZATION_API_URL || DEFAULT_API_ROOT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: REQUEST_TIMEOUT,
});

const attachAuthTokenInterceptor = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const token = getStoredToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

authApi.interceptors.request.use(attachAuthTokenInterceptor, (error) => Promise.reject(error));
orgApi.interceptors.request.use(attachAuthTokenInterceptor, (error) => Promise.reject(error));

/**
 * Endpoints públicos do fluxo de entrada: um 401 aqui é regra de negócio
 * (código OTP inválido/expirado, credenciais inválidas) e é tratado pelo próprio
 * formulário — nunca deve limpar a sessão nem recarregar a página para `/login`.
 */
const PUBLIC_AUTH_ENDPOINTS = ['/v1/auth/login', '/v1/auth/verify-otp'];

const handleUnauthorizedInterceptor = (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    const requestUrl = error.config?.url ?? '';
    const isPublicAuthEndpoint = PUBLIC_AUTH_ENDPOINTS.some((endpoint) =>
      requestUrl.includes(endpoint),
    );

    if (isPublicAuthEndpoint) {
      return Promise.reject(error);
    }

    removeStoredToken();
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }
  return Promise.reject(error);
};

authApi.interceptors.response.use((response) => response, handleUnauthorizedInterceptor);
orgApi.interceptors.response.use((response) => response, handleUnauthorizedInterceptor);
