import { authApi, getStoredToken } from '../lib/api';
import { User, CreateUserDTO, UpdateUserDTO } from '../types/api';

/**
 * Serviço de autenticação/usuários (auth_service).
 *
 * Os caminhos abaixo espelham EXACTAMENTE as rotas Laravel:
 *   - routes/auth/auth_rooter.php -> prefixo `v1/auth`
 *   - routes/user/user_rooter.php -> prefixo `v1/users`
 * Como o cliente HTTP central já aponta para a raiz `/api`, cada pedido começa em `/v1/...`.
 *
 * ⚠️ O login (pedido de OTP + validação do código) NÃO vive aqui: está em
 * `features/auth/services/loginService.ts`, que é o único ponto do fluxo de
 * entrada que fala HTTP. Aqui ficam apenas a sessão/perfil e a gestão de
 * utilizadores.
 */

/** Recurso devolvido pelo `UserListResource` do auth_service. */
export interface UserResource {
  id?: string | number;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone_number?: string | null;
  bi_number?: string | null;
  path_photo?: string | null;
  status?: string | null;
  company_id?: string | null;
  email_verified_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  roles?: string[] | null;
  permissions?: string[] | null;
}

/** Envelope padrão das respostas do auth_service: `{ success, message, data }`. */
interface ResourceEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

/**
 * Converte o recurso do backend no `User` usado pela aplicação.
 *
 * O `UserListResource` devolve `first_name`/`last_name`/`roles[]`, mas o resto da
 * aplicação (ex.: `Layout`) lê `name`/`role`/`perfil` — o mapeamento acontece
 * aqui, num único sítio.
 */
export function toUser(resource: UserResource | null | undefined): User {
  const firstName = (resource?.first_name ?? '').trim();
  const lastName = (resource?.last_name ?? '').trim();
  const email = (resource?.email ?? '').trim();
  const roles = (resource?.roles ?? []).filter(Boolean);
  const permissions = (resource?.permissions ?? []).filter(Boolean);
  const fullName = `${firstName} ${lastName}`.trim();

  return {
    id: resource?.id ?? '',
    name: fullName || email || 'Utilizador',
    email,
    role: roles[0],
    perfil: roles[0],
    status: resource?.status ?? undefined,
    ativo: resource?.status === 'active',
    avatar: resource?.path_photo ?? undefined,
    createdAt: resource?.created_at ?? undefined,
    updatedAt: resource?.updated_at ?? undefined,
    company_id: resource?.company_id ?? undefined,
    first_name: firstName,
    last_name: lastName,
    phone_number: resource?.phone_number ?? undefined,
    roles,
    permissions,
  };
}

export const authService = {
  async getProfile(): Promise<User> {
    // `GET /v1/auth/me` responde com o envelope `{ success, message, data }`.
    const response = await authApi.get<ResourceEnvelope<UserResource> | UserResource>('/v1/auth/me');
    const body = response.data as ResourceEnvelope<UserResource>;

    return toUser(body?.data ?? (response.data as UserResource));
  },

  /**
   * Termina a sessão no backend (`POST /v1/auth/logout`, protegido por `auth:api`).
   *
   * O backend invalida o JWT (`auth()->logout()` → blacklist do `tymon/jwt-auth`)
   * e responde 200 `{ success, message }`.
   *
   * ⚠️ O token é lido AQUI, de forma síncrona, e enviado explicitamente: os
   * interceptores do axios correm em microtask (não são síncronos), pelo que o
   * interceptor de request poderia consultar o `localStorage` já depois de o
   * `AuthContext` o ter apagado — o pedido seguiria sem `Authorization`, o
   * backend responderia 401 e o token NUNCA seria invalidado.
   *
   * Erros (rede, 401 de token expirado, 500) são engolidos de propósito: o
   * logout local do utilizador nunca pode depender do backend.
   */
  async logout(): Promise<void> {
    const token = getStoredToken();

    try {
      await authApi.post(
        '/v1/auth/logout',
        null,
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
      );
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
