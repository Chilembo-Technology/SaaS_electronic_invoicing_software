/**
 * Serviço da sub-secção "Utilizadores" (auth_service).
 *
 * Rotas espelhadas de `auth_service/routes/user/user_rooter.php`:
 *   - GET  /v1/users/list           -> listar (paginado; envelope `{data, meta}`)
 *   - POST /v1/users                -> criar (StoreUserRequest; multipart)
 *   - POST /v1/users/update/{id}    -> atualizar um utilizador
 *   - PUT  /v1/users/active         -> ativar  (`{ ids: [...] }`)
 *   - PUT  /v1/users/desactive      -> desativar (`{ ids: [...] }`)
 *
 * ⚠️ O endpoint de update NÃO aceita `role` — o papel não é editável.
 */

import { authApi } from '../../../lib/api';
import type { UserResource } from '../../../services/authService';
import type { CreateUserPayload, UpdateUserPayload, UserListItem } from '../types/user.types';
import { buildUserCreateFormData, buildUserUpdateFormData } from './formData';

interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export interface UsersListMeta {
  current_page?: number;
  total?: number;
  per_page?: number;
  is_first_page?: boolean;
  is_last_page?: boolean;
}

export interface UsersListResult {
  users: UserListItem[];
  meta?: UsersListMeta;
}

export function mapUserListItem(raw: UserResource | null | undefined): UserListItem {
  return {
    id: raw?.id != null ? String(raw.id) : '',
    first_name: raw?.first_name ?? '',
    last_name: raw?.last_name ?? '',
    email: raw?.email ?? '',
    phone_number: raw?.phone_number ?? '',
    bi_number: raw?.bi_number ?? '',
    path_photo: raw?.path_photo ?? null,
    status: raw?.status ?? '',
    company_id: raw?.company_id ?? '',
    roles: (raw?.roles ?? []).filter(Boolean),
    created_at: raw?.created_at ?? null,
  };
}

export const usersSettingsService = {
  async listUsers(params?: { per_page?: number; page?: number }): Promise<UsersListResult> {
    const response = await authApi.get<ApiEnvelope<UserResource[]> | UserResource[]>('/v1/users/list', {
      params: params ?? { per_page: 100, page: 1 },
    });

    const body = response.data;
    const list = Array.isArray(body) ? body : body?.data ?? [];
    const meta = Array.isArray(body) ? undefined : (body?.meta as UsersListMeta | undefined);

    return {
      users: (list as UserResource[]).map(mapUserListItem),
      meta,
    };
  },

  async updateUser(userId: string, payload: UpdateUserPayload): Promise<UserListItem> {
    const formData = buildUserUpdateFormData(payload, { includeStatus: true });

    const response = await authApi.post<ApiEnvelope<UserResource>>(`/v1/users/update/${userId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const body = response.data;
    const updated = body?.data ?? (body as unknown as UserResource);
    return mapUserListItem(updated as UserResource);
  },

  /**
   * Cria um utilizador (`POST /v1/users`, protegido por `auth:api` +
   * `role:administrator|super-admin`). Enviado SEMPRE como
   * `multipart/form-data` — mesma abordagem do `updateUser`.
   */
  async createUser(payload: CreateUserPayload): Promise<UserListItem> {
    const formData = buildUserCreateFormData(payload);

    const response = await authApi.post<ApiEnvelope<UserResource>>('/v1/users', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const body = response.data;
    const created = body?.data ?? (body as unknown as UserResource);
    return mapUserListItem(created as UserResource);
  },

  /** Ativa um ou mais utilizadores (`{ ids: [...] }`). */
  async activateUsers(ids: string[]): Promise<void> {
    await authApi.put('/v1/users/active', { ids });
  },

  /** Desativa um ou mais utilizadores (`{ ids: [...] }`). */
  async deactivateUsers(ids: string[]): Promise<void> {
    await authApi.put('/v1/users/desactive', { ids });
  },
};
