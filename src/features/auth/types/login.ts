import type { User } from '../../../types/api';

/**
 * Tipos do fluxo de entrada com OTP.
 *
 * Regras espelhadas do auth_service:
 *   - `app/Http/Requests/Auth/AuthLoginRequest.php`    -> POST /v1/auth/login
 *   - `app/Http/Requests/Auth/AuthVerifyOTPRequest.php` -> POST /v1/auth/verify-otp
 *
 * ⚠️ O `/login` NUNCA devolve token: apenas gera e envia um código OTP por email
 * (`AuthService::storeCodeOTP`). A sessão (JWT) nasce no `/verify-otp`
 * (`AuthService::generateTokenResponse`).
 */

/** Valores do formulário de entrada (passo 1). */
export interface LoginFormValues {
  email: string;
  password: string;
}

export type LoginField = keyof LoginFormValues;
export type LoginFieldErrors = Partial<Record<LoginField, string>>;

export const emptyLoginValues: LoginFormValues = {
  email: '',
  password: '',
};

/** Valores do formulário do código OTP (passo 2). */
export interface VerifyOtpFormValues {
  /** Código de 9 dígitos (`digits:9` no backend). */
  code: string;
}

export type VerifyOtpField = keyof VerifyOtpFormValues;
export type VerifyOtpFieldErrors = Partial<Record<VerifyOtpField, string>>;

export const emptyVerifyOtpValues: VerifyOtpFormValues = {
  code: '',
};

/** Payload de `POST /v1/auth/login` (nomes de campo do Laravel). */
export interface RequestOtpPayload {
  email: string;
  password: string;
}

/** Payload de `POST /v1/auth/verify-otp` — o DTO do backend declara `code` como inteiro. */
export interface VerifyOtpPayload {
  email: string;
  code: number;
}

/** Resposta útil de `POST /v1/auth/login` (confirma apenas o envio do código). */
export interface RequestOtpResult {
  message: string;
  /** `expires_at` do `CodeOTPResource` — o código vale 15 minutos. */
  expiresAt: string | null;
  /** `id` do registo em `code_o_t_p_s` (auditoria/depuração). */
  otpId: string | null;
}

/** Sessão autenticada devolvida por `POST /v1/auth/verify-otp`. */
export interface AuthenticatedSession {
  token: string;
  tokenType: string;
  expiresIn: number | null;
  expiresAt: string | null;
  message: string;
  user: User;
}

/**
 * Estado que liga os dois passos: o `/verify-otp` volta a exigir o `email`
 * (`AuthVerifyOTPRequest`), logo tem de sobreviver à navegação.
 */
export interface PendingLogin {
  email: string;
  expiresAt: string | null;
}

/** Aviso global mostrado acima do formulário (erros sem campo correspondente). */
export interface AuthGlobalError {
  variant: 'error' | 'warning' | 'info';
  title?: string;
  message: string;
}
