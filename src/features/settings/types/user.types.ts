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

/* ------------------------------------------------------------------ */
/* Criação de utilizador (POST /v1/users — StoreUserRequest)           */
/* ------------------------------------------------------------------ */

/**
 * Papéis atribuíveis via endpoint de criação.
 * ⚠️ `super-admin` é BLOQUEADO no backend (`Rule::notIn`) — nunca aparece aqui.
 */
export type CreateUserRole = 'Administrator' | 'Viewer' | 'Operator';

/** Valores permitidos pelo `Rule::in(['Administrator', 'Viewer', 'Operator'])`. */
export const CREATE_USER_ROLES: CreateUserRole[] = ['Administrator', 'Viewer', 'Operator'];

/** Estados aceites pelo backend (`Rule::in(['active', 'inactive'])`). */
export type CreateUserStatus = 'active' | 'inactive';

/** Corpo de `POST /v1/users` (enviado como `multipart/form-data`). */
export interface CreateUserPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone_number: string;
  bi_number: string;
  /** Vem do AuthContext (`getCompanyId(user)`) — NUNCA do formulário. */
  company_id: string;
  role?: CreateUserRole;
  status?: CreateUserStatus;
  photo?: File | null;
}

/** Valores editáveis no formulário de criação (`company_id` e `photo` ficam fora). */
export interface CreateUserFormValues {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone_number: string;
  bi_number: string;
  role: CreateUserRole;
  status: CreateUserStatus;
}

export type CreateUserField = keyof CreateUserFormValues | 'photo';
export type CreateUserFieldErrors = Partial<Record<CreateUserField, string>>;

/** Estado inicial do modal de criação (reset a cada abertura). */
export const CREATE_USER_DEFAULTS: CreateUserFormValues = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  phone_number: '',
  bi_number: '',
  role: 'Administrator',
  status: 'active',
};
