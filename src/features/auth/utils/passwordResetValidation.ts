/**
 * Validação do fluxo de recuperação de palavra-passe (3 ecrãs).
 *
 * ⚠️ As regras e as mensagens são o ESPELHO do backend:
 *   - `UserEmailRequest`       -> `email: required|string|email|max:255|exists(users,email)`
 *   - `AuthVerifyOTPRequest`   -> `email: required|email|exists(users)` + `code: required|integer|digits:9`
 *   - `NewPasswordUserRequest` -> `email: required|string|email|max:255|exists(users,email)` + `new_password: required`
 *
 * Nenhuma mensagem é reescrita aqui: reutilizam-se as constantes já existentes
 * do registo (`MESSAGES`, com o texto do `UserEmailRequest`/
 * `NewPasswordUserRequest`) e do login (`LOGIN_MESSAGES`, para o código).
 * Quando o Laravel devolve 422, a mensagem do servidor substitui a do cliente
 * (ver `loginApiError.ts`).
 *
 * Duas regras exclusivas deste formulário (o backend não as tem):
 *   - comprimento mínimo da nova senha (`COMPANY_PASSWORD_MIN`, igual ao registo);
 *   - confirmação da senha (`MESSAGES.confirmPasswordMismatch`).
 */

import type {
  ForgotPasswordField,
  ForgotPasswordFieldErrors,
  ForgotPasswordFormValues,
  NewPasswordField,
  NewPasswordFieldErrors,
  NewPasswordFormValues,
  PendingPasswordReset,
  ResetOtpField,
  ResetOtpFieldErrors,
  ResetOtpFormValues,
} from '../types/passwordReset';
import { COMPANY_PASSWORD_MIN, EMAIL_REGEX, MESSAGES } from './registerValidation';
import { LOGIN_MESSAGES, isOtpComplete, sanitizeOtpCode } from './loginValidation';

/** Campos por ordem de apresentação — usado para focar o primeiro erro. */
export const FORGOT_PASSWORD_FIELDS: ForgotPasswordField[] = ['email'];
export const RESET_OTP_FIELDS: ResetOtpField[] = ['code'];
export const NEW_PASSWORD_FIELDS: NewPasswordField[] = ['password', 'confirmPassword'];

/* ------------------------------------------------------------------ */
/* Ecrã 1 — pedir o código                                             */
/* ------------------------------------------------------------------ */

/** Valida o email (usado no `onBlur` e no `onSubmit` do ecrã 1). */
export function validateForgotPasswordField(
  field: ForgotPasswordField,
  values: ForgotPasswordFormValues,
): string | undefined {
  switch (field) {
    case 'email': {
      const value = values.email.trim();
      // Texto exacto do `UserEmailRequest` (que é também o do registo).
      if (!value) return MESSAGES.emailRequired;
      if (!EMAIL_REGEX.test(value)) return MESSAGES.emailInvalid;
      return undefined;
    }
    default:
      return undefined;
  }
}

/** Valida o formulário do ecrã 1. */
export function validateForgotPasswordForm(
  values: ForgotPasswordFormValues,
): ForgotPasswordFieldErrors {
  const errors: ForgotPasswordFieldErrors = {};
  FORGOT_PASSWORD_FIELDS.forEach((field) => {
    const error = validateForgotPasswordField(field, values);
    if (error) errors[field] = error;
  });
  return errors;
}

/* ------------------------------------------------------------------ */
/* Ecrã 2 — validar o código OTP                                       */
/* ------------------------------------------------------------------ */

/** Valida o código (usado no `onBlur` e no `onSubmit` do ecrã 2). */
export function validateResetOtpField(
  field: ResetOtpField,
  values: ResetOtpFormValues,
): string | undefined {
  switch (field) {
    case 'code': {
      const value = sanitizeOtpCode(values.code);
      if (!value) return LOGIN_MESSAGES.codeRequired;
      if (!isOtpComplete(value)) return LOGIN_MESSAGES.codeDigits;
      return undefined;
    }
    default:
      return undefined;
  }
}

/** Valida o formulário do ecrã 2. */
export function validateResetOtpForm(values: ResetOtpFormValues): ResetOtpFieldErrors {
  const errors: ResetOtpFieldErrors = {};
  RESET_OTP_FIELDS.forEach((field) => {
    const error = validateResetOtpField(field, values);
    if (error) errors[field] = error;
  });
  return errors;
}

/* ------------------------------------------------------------------ */
/* Ecrã 3 — nova palavra-passe                                         */
/* ------------------------------------------------------------------ */

/** Valida um campo do ecrã 3 (usado no `onBlur`). */
export function validateNewPasswordField(
  field: NewPasswordField,
  values: NewPasswordFormValues,
): string | undefined {
  switch (field) {
    case 'password': {
      if (!values.password) return MESSAGES.passwordRequired;
      if (values.password.length < COMPANY_PASSWORD_MIN) return MESSAGES.passwordMin;
      return undefined;
    }
    case 'confirmPassword': {
      if (!values.confirmPassword || values.confirmPassword !== values.password) {
        return MESSAGES.confirmPasswordMismatch;
      }
      return undefined;
    }
    default:
      return undefined;
  }
}

/** Valida o formulário do ecrã 3. */
export function validateNewPasswordForm(values: NewPasswordFormValues): NewPasswordFieldErrors {
  const errors: NewPasswordFieldErrors = {};
  NEW_PASSWORD_FIELDS.forEach((field) => {
    const error = validateNewPasswordField(field, values);
    if (error) errors[field] = error;
  });
  return errors;
}

/* ------------------------------------------------------------------ */
/* Erros do backend e estado entre ecrãs                               */
/* ------------------------------------------------------------------ */

/**
 * Traduz as chaves de erro do Laravel para os campos deste formulário.
 *
 * `NewPasswordUserRequest` chama ao campo da senha `new_password`; sem este
 * mapa, um 422 dessa chave cairia no banner global em vez do campo.
 */
export function mapNewPasswordFieldErrors(
  fieldErrors: Record<string, string>,
): Record<string, string> {
  const mapped: Record<string, string> = {};

  Object.entries(fieldErrors).forEach(([field, message]) => {
    mapped[field === 'new_password' ? 'password' : field] = message;
  });

  return mapped;
}

/**
 * `true` quando o `state` do React Router traz um email utilizável — serve de
 * guarda aos ecrãs 2 e 3 (link aberto directamente, refresh da página, etc.).
 */
export function isPendingPasswordReset(value: unknown): value is PendingPasswordReset {
  if (typeof value !== 'object' || value === null) return false;

  const email = (value as { email?: unknown }).email;
  return typeof email === 'string' && email.trim().length > 0;
}
