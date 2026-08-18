import { authApiClient } from './apiClient';
import { User, AuthLoginCredentials, AuthLoginResponse } from '../types/api';

export const authService = {
  async login(credentials: AuthLoginCredentials): Promise<AuthLoginResponse> {
    const response = await authApiClient.post<AuthLoginResponse>('/auth/login', credentials);
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await authApiClient.get<User>('/user/me');
    return response.data;
  },
};
