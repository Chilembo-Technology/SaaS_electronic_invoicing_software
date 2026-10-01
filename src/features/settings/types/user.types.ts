/**
 * Tipos da sub-secção "Utilizadores" (auth_service — `/v1/users/*`).
 */

/** Item da lista de utilizadores (`GET /v1/users/list` → `UserListResource`). */
export interface UserListItem {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  bi_number: string;
  path_photo: string | null;
  status: string;
  company_id: string;
  roles: string[];
  created_at: string | null;
}

/** Corpo de `POST /v1/users/update/{user_id}`.
 *  ⚠️ NÃO existe campo `role` no backend — o papel não é editável aqui. */
export interface UpdateUserPayload {
  company_id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  bi_number?: string;
  status?: string;
  password?: string;
  photo?: File | null;
}

export interface EditUserFormValues {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  bi_number: string;
  status: 'active' | 'inactive';
  password: string;
}

export type EditUserField = keyof EditUserFormValues;
export type EditUserFieldErrors = Partial<Record<EditUserField, string>>;

/** Filtros do painel de utilizadores (aplicados no cliente). */
export interface UsersFilters {
  search: string;
  /** `''` = todos. */
  role: string;
  /** `''` = todos. */
  status: string;
}

export const EMPTY_USERS_FILTERS: UsersFilters = { search: '', role: '', status: '' };
