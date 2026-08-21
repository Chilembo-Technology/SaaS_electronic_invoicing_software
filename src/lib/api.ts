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

export const authApi: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_URL || 'http://localhost:80/api/v1/auth',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export const orgApi: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_ORGANIZATION_API_URL || 'http://localhost:80/api/v1/organizations',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
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

const handleUnauthorizedInterceptor = (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    removeStoredToken();
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }
  return Promise.reject(error);
};

authApi.interceptors.response.use((response) => response, handleUnauthorizedInterceptor);
orgApi.interceptors.response.use((response) => response, handleUnauthorizedInterceptor);
