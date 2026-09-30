/**
 * Tipos do fluxo de recuperação de palavra-passe (3 ecrãs).
 *
 * Regras espelhadas do auth_service:
 *   - app/Http/Requests/User/UserEmailRequest.php       -> POST /v1/users/recuver-password
 *   - app/Http/Requests/Auth/AuthVerifyOTPRequest.php   -> POST /v1/auth/verify-otp
 *   - app/Http/Requests/User/NewPasswordUserRequest.php -> POST /v1/users/new-password
 *
 * ⚠️ O backend chama ao campo da nova senha `new_password` (e NÃO tem regra
 * `confirmed`, nem aceita `password_confirmation`). O mapeamento entre estes
 * campos e os nomes do Laravel vive apenas em `passwordResetService`.
 */

/* ------------------------------------------------------------------ */
/* Ecrã 1 — pedir o código                                             */
/* ------------------------------------------------------------------ */

export interface ForgotPasswordFormValues {
  email: string;
}

export type ForgotPasswordField = keyof ForgotPasswordFormValues;
export type ForgotPasswordFieldErrors = Partial<Record<ForgotPasswordField, string>>;

export const emptyForgotPasswordValues: ForgotPasswordFormValues = { email: '' };

/* ------------------------------------------------------------------ */
/* Ecrã 2 — validar o código OTP                                       */
/* ------------------------------------------------------------------ */

export interface ResetOtpFormValues {
  /** Código de 9 dígitos (`digits:9` em `AuthVerifyOTPRequest`). */
  code: string;
}

export type ResetOtpField = keyof ResetOtpFormValues;
export type ResetOtpFieldErrors = Partial<Record<ResetOtpField, string>>;

export const emptyResetOtpValues: ResetOtpFormValues = { code: '' };

/* ------------------------------------------------------------------ */
/* Ecrã 3 — definir a nova palavra-passe                               */
/* ------------------------------------------------------------------ */

export interface NewPasswordFormValues {
  password: string;
  /**
   * Confirmação APENAS do lado do cliente: `NewPasswordUserRequest` valida só
   * `email` + `new_password`, e não existe `confirmed` no backend.
   */
  confirmPassword: string;
}

export type NewPasswordField = keyof NewPasswordFormValues;
export type NewPasswordFieldErrors = Partial<Record<NewPasswordField, string>>;

export const emptyNewPasswordValues: NewPasswordFormValues = {
  password: '',
  confirmPassword: '',
};

/** Payload de `POST /v1/users/new-password` na forma do formulário. */
export interface NewPasswordRequestPayload {
  email: string;
  /** Enviado ao Laravel como `new_password` (`NewPasswordUserDTO`). */
  password: string;
}

/**
 * Resposta útil do passo 2.
 *
 * ⚠️ `/v1/auth/verify-otp` devolve um JWT completo (`access_token`), mas no
 * fluxo de recuperação ele é DESCARTADO: guardá-lo abriria sessão autenticada a
 * meio de um reset. Só a mensagem do backend é preservada.
 */
export interface ResetOtpVerification {
  message: string;
}

/**
 * Estado que liga os 3 ecrãs.
 *
 * ⚠️ Viaja apenas no `state` do React Router (memória): um refresh da página
 * volta ao ecrã 1 — aceitável em segurança, porque nada fica em disco.
 */
export interface PendingPasswordReset {
  email: string;
  /** `expires_at` do `CodeOTPResource` — o código vale 15 minutos. */
  expiresAt: string | null;
}
