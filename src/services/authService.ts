import { authApi } from '../lib/api';
import { User, AuthLoginCredentials, AuthLoginResponse, CreateUserDTO, UpdateUserDTO } from '../types/api';

export const authService = {
  async login(credentials: AuthLoginCredentials): Promise<AuthLoginResponse> {
    const response = await authApi.post<AuthLoginResponse>('/login', credentials);
    const data = response.data;
    const token = data.token || (data as unknown as { access_token?: string }).access_token || '';
    return {
      token,
      user: data.user,
      token_type: data.token_type,
      expires_in: data.expires_in,
    };
  },

  async getProfile(): Promise<User> {
    try {
      const response = await authApi.get<User>('/me');
      return response.data;
    } catch {
      const response = await authApi.get<User>('/user/me');
      return response.data;
    }
  },

  async logout(): Promise<void> {
    try {
      await authApi.post('/logout');
    } catch {
      // Ignora erro de rede no logout
    }
  },

  async createUser(data: CreateUserDTO): Promise<User> {
    try {
      const response = await authApi.post<User>('/v1/users', data);
      return response.data;
    } catch {
      const response = await authApi.post<User>('/users', data);
      return response.data;
    }
  },

  async listUsers(): Promise<User[]> {
    try {
      const response = await authApi.get<User[]>('/v1/users/list');
      return response.data;
    } catch {
      const response = await authApi.get<User[]>('/users');
      return response.data;
    }
  },

  async updateUser(id: string | number, data: UpdateUserDTO): Promise<User> {
    try {
      const response = await authApi.post<User>(`/v1/users/update/${id}`, data);
      return response.data;
    } catch {
      const response = await authApi.put<User>(`/users/${id}`, data);
      return response.data;
    }
  },

  async activateUser(id: string | number): Promise<void> {
    try {
      await authApi.put('/v1/users/active', { user_id: id });
    } catch {
      await authApi.put(`/users/${id}/active`);
    }
  },

  async deactivateUser(id: string | number): Promise<void> {
    try {
      await authApi.put('/v1/users/desactive', { user_id: id });
    } catch {
      await authApi.put(`/users/${id}/deactivate`);
    }
  },

  async moveToTrash(id: string | number): Promise<void> {
    try {
      await authApi.post('/v1/users/move-to-trash', { user_id: id });
    } catch {
      await authApi.delete(`/users/${id}/trash`);
    }
  },

  async listTrash(): Promise<User[]> {
    try {
      const response = await authApi.get<User[]>('/v1/users/list/trash');
      return response.data;
    } catch {
      const response = await authApi.get<User[]>('/users/trash');
      return response.data;
    }
  },

  async restoreUser(id: string | number): Promise<void> {
    try {
      await authApi.post('/v1/users/recuver-trash', { user_id: id });
    } catch {
      await authApi.post(`/users/${id}/restore`);
    }
  },

  async deletePermanently(id: string | number): Promise<void> {
    try {
      await authApi.delete('/v1/users/delete-permanently', { data: { user_id: id } });
    } catch {
      await authApi.delete(`/users/${id}`);
    }
  },

  async recoverPassword(email: string): Promise<void> {
    try {
      await authApi.post('/v1/users/recuver-password', { email });
    } catch {
      await authApi.post('/auth/recover-password', { email });
    }
  },

  async newPassword(data: { email?: string; token?: string; password: string }): Promise<void> {
    try {
      await authApi.post('/v1/users/new-password', data);
    } catch {
      await authApi.post('/auth/new-password', data);
    }
  },
};
