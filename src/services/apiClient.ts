import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const TOKEN_KEY = '@SaaS:token';

export const authApiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const orgApiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_ORGANIZATION_API_URL || 'http://localhost:8001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

const attachAuthTokenInterceptor = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

authApiClient.interceptors.request.use(attachAuthTokenInterceptor, (error) => Promise.reject(error));
orgApiClient.interceptors.request.use(attachAuthTokenInterceptor, (error) => Promise.reject(error));

const handleUnauthorizedInterceptor = (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }
  return Promise.reject(error);
};

authApiClient.interceptors.response.use((response) => response, handleUnauthorizedInterceptor);
orgApiClient.interceptors.response.use((response) => response, handleUnauthorizedInterceptor);
