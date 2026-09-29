/**
 * Validação do fluxo de entrada (credenciais + código OTP).
 *
 * ⚠️ As regras e as mensagens são o ESPELHO EXACTO do backend:
 *   - AuthLoginRequest     -> `email: required|email|exists(users, active)` + `password: required|string`
 *   - AuthVerifyOTPRequest -> `email: required|email|exists(users)` + `code: required|integer|digits:9`
 *
 * Quando o Laravel devolve 422, a mensagem do servidor substitui a do cliente
 * (ver `loginApiError.ts`), mantendo o texto coerente nos dois lados.
 * O `EMAIL_REGEX` é reutilizado de `registerValidation.ts` — a regra de email é
 * a mesma do registo e não é reimplementada aqui.
 */

import type {
  LoginField,
  LoginFieldErrors,
  LoginFormValues,
  VerifyOtpField,
  VerifyOtpFieldErrors,
  VerifyOtpFormValues,
} from '../types/login';
import { EMAIL_REGEX } from './registerValidation';

/** Comprimento do código OTP — `digits:9` em `AuthVerifyOTPRequest`. */
export const OTP_LENGTH = 9;

/** Mensagens — texto exacto devolvido pelo backend (PT). */
export const LOGIN_MESSAGES = {
  emailRequired: 'O e-mail é obrigatório.',
  emailInvalid: 'Informe um e-mail válido.',

  // O login NÃO impõe comprimento mínimo à password (só `required|string`).
  passwordRequired: 'A senha é obrigatória.',

  codeRequired: 'O campo código é obrigatório.',
  codeDigits: `O código deve ter exatamente ${OTP_LENGTH} dígitos.`,
} as const;

/** Campos por ordem de apresentação — usado para focar o primeiro erro. */
export const LOGIN_FIELDS: LoginField[] = ['email', 'password'];
export const VERIFY_OTP_FIELDS: VerifyOtpField[] = ['code'];

/** Mantém apenas dígitos e limita ao comprimento do código (o backend exige 9). */
export function sanitizeOtpCode(value: string): string {
  return value.replace(/\D/g, '').slice(0, OTP_LENGTH);
}

/** `true` quando o código tem exatamente os dígitos exigidos pelo Laravel. */
export function isOtpComplete(code: string): boolean {
  return code.length === OTP_LENGTH;
}

/* ------------------------------------------------------------------ */
/* Credenciais (passo 1)                                               */
/* ------------------------------------------------------------------ */

/** Valida um único campo das credenciais (usado no `onBlur`). */
export function validateLoginField(
  field: LoginField,
  values: LoginFormValues,
): string | undefined {
  switch (field) {
    case 'email': {
      const value = values.email.trim();
      if (!value) return LOGIN_MESSAGES.emailRequired;
      if (!EMAIL_REGEX.test(value)) return LOGIN_MESSAGES.emailInvalid;
      return undefined;
    }
    case 'password':
      return values.password ? undefined : LOGIN_MESSAGES.passwordRequired;
    default:
      return undefined;
  }
}

/** Valida todas as credenciais (usado no `onSubmit` do passo 1). */
export function validateLoginForm(values: LoginFormValues): LoginFieldErrors {
  const errors: LoginFieldErrors = {};
  LOGIN_FIELDS.forEach((field) => {
    const error = validateLoginField(field, values);
    if (error) errors[field] = error;
  });
  return errors;
}

/* ------------------------------------------------------------------ */
/* Código OTP (passo 2)                                                */
/* ------------------------------------------------------------------ */

/** Valida o código OTP (usado no `onBlur` e no `onSubmit` do passo 2). */
export function validateVerifyOtpField(
  field: VerifyOtpField,
  values: VerifyOtpFormValues,
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

/** Valida o formulário do código OTP. */
export function validateVerifyOtpForm(values: VerifyOtpFormValues): VerifyOtpFieldErrors {
  const errors: VerifyOtpFieldErrors = {};
  VERIFY_OTP_FIELDS.forEach((field) => {
    const error = validateVerifyOtpField(field, values);
    if (error) errors[field] = error;
  });
  return errors;
}
