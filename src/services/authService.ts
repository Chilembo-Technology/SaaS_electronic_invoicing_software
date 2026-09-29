import { authApi } from '../lib/api';
import { User, AuthLoginCredentials, AuthLoginResponse, CreateUserDTO, UpdateUserDTO } from '../types/api';

/**
 * Serviço de autenticação/usuários (auth_service).
 *
 * Os caminhos abaixo espelham EXACTAMENTE as rotas Laravel:
 *   - routes/auth/auth_rooter.php -> prefixo `v1/auth`
 *   - routes/user/user_rooter.php -> prefixo `v1/users`
 * Como o cliente HTTP central já aponta para a raiz `/api`, cada pedido começa em `/v1/...`.
 */
export const authService = {
  async login(credentials: AuthLoginCredentials): Promise<AuthLoginResponse> {
    const response = await authApi.post<AuthLoginResponse>('/v1/auth/login', credentials);
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
    const response = await authApi.get<User>('/v1/auth/me');
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await authApi.post('/v1/auth/logout');
    } catch {
      // Ignora erro de rede no logout
    }
  },

  async createUser(data: CreateUserDTO): Promise<User> {
    const response = await authApi.post<User>('/v1/users', data);
    return response.data;
  },

  async listUsers(): Promise<User[]> {
    const response = await authApi.get<User[]>('/v1/users/list');
    return response.data;
  },

  async updateUser(id: string | number, data: UpdateUserDTO): Promise<User> {
    const response = await authApi.post<User>(`/v1/users/update/${id}`, data);
    return response.data;
  },

  async activateUser(id: string | number): Promise<void> {
    // O auth_service espera um array `ids` (IdsUserRequest)
    await authApi.put('/v1/users/active', { ids: [String(id)] });
  },

  async deactivateUser(id: string | number): Promise<void> {
    await authApi.put('/v1/users/desactive', { ids: [String(id)] });
  },

  async moveToTrash(id: string | number): Promise<void> {
    await authApi.post('/v1/users/move-to-trash', { ids: [String(id)] });
  },

  async listTrash(): Promise<User[]> {
    const response = await authApi.get<User[]>('/v1/users/list/trash');
    return response.data;
  },

  async restoreUser(id: string | number): Promise<void> {
    await authApi.post('/v1/users/recuver-trash', { ids: [String(id)] });
  },

  async deletePermanently(id: string | number): Promise<void> {
    await authApi.delete('/v1/users/delete-permanently', { data: { ids: [String(id)] } });
  },

  async recoverPassword(email: string): Promise<void> {
    await authApi.post('/v1/users/recuver-password', { email });
  },

  async newPassword(data: { email: string; new_password: string }): Promise<void> {
    // NewPasswordUserRequest valida `email` + `new_password`
    await authApi.post('/v1/users/new-password', data);
  },
};
