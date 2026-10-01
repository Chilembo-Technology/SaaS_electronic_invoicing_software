/**
 * Tipos da sub-secção "O meu perfil" (auth_service — `/v1/auth/me` e
 * `/v1/users/update/{user_id}`).
 */

/** Dados do utilizador autenticado (`GET /v1/auth/me` → `UserListResource`). */
export interface ProfileData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  bi_number: string;
  /** URL pública da foto (`asset('storage/...')`) ou `null`. */
  path_photo: string | null;
  status: string;
  company_id: string;
  roles: string[];
}

/** Corpo de `POST /v1/users/update/{user_id}` (perfil). */
export interface UpdateProfilePayload {
  company_id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  bi_number?: string;
  password?: string;
  photo?: File | null;
}

export interface ProfileFormValues {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  bi_number: string;
}

export type ProfileField = keyof ProfileFormValues;
export type ProfileFieldErrors = Partial<Record<ProfileField, string>>;

export interface PasswordFormValues {
  password: string;
  confirmPassword: string;
}

export type PasswordField = keyof PasswordFormValues;
export type PasswordFieldErrors = Partial<Record<PasswordField, string>>;
