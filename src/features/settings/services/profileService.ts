/**
 * Serviço do "O meu perfil" (auth_service).
 *
 * Rotas espelhadas de `auth_service/routes/auth/auth_rooter.php` e
 * `routes/user/user_rooter.php`:
 *   - GET  /v1/auth/me              -> dados do utilizador logado
 *   - POST /v1/users/update/{id}    -> atualizar o próprio perfil
 *
 * ⚠️ `users/update/{id}` exige `role:administrator|super-admin` no backend, pelo
 * que a edição do perfil só está disponível a administradores (a página mostra
 * modo de leitura aos restantes).
 */

import { authApi } from '../../../lib/api';
import type { UserResource } from '../../../services/authService';
import type { ProfileData, UpdateProfilePayload } from '../types/profile.types';
import { buildUserUpdateFormData } from './formData';

interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

const ME_PATH = '/v1/auth/me';
const UPDATE_PATH = (userId: string) => `/v1/users/update/${userId}`;

export function mapProfile(raw: UserResource | null | undefined): ProfileData {
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
  };
}

export const profileService = {
  async getProfile(): Promise<ProfileData> {
    const response = await authApi.get<ApiEnvelope<UserResource> | UserResource>(ME_PATH);
    const body = response.data as ApiEnvelope<UserResource>;
    const raw = body?.data ?? (response.data as UserResource);
    return mapProfile(raw);
  },

  async updateProfile(userId: string, payload: UpdateProfilePayload): Promise<ProfileData> {
    const formData = buildUserUpdateFormData(payload);

    const response = await authApi.post<ApiEnvelope<UserResource>>(UPDATE_PATH(userId), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const body = response.data;
    const updated = body?.data ?? (body as unknown as UserResource);
    return mapProfile(updated as UserResource);
  },
};
