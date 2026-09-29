import axios from 'axios';

import { API_ERROR_MESSAGES, normalizeApiError, type NormalizedApiError } from './apiError';

/**
 * Erros do fluxo de entrada.
 *
 * Reutiliza o `normalizeApiError` (422/409/429/rede/timeout) e acrescenta o que
 * só existe neste fluxo:
 *   - `401` — OTP inválido/expirado (`AuthService::verifyCodeOTP`) ou credenciais
 *     inválidas. Nunca revelamos se o email ou a senha estão errados;
 *   - `404` — `Usuário não encontrado` (mensagem do backend);
 *   - `retry_after` de um 429 — o formulário mostra o tempo de espera.
 */

export interface LoginApiError extends NormalizedApiError {
  /** Segundos de espera devolvidos por um 429 (`retry_after` ou cabeçalho `Retry-After`). */
  retryAfterSeconds?: number;
}

export const LOGIN_API_MESSAGES = {
  unauthorized: 'Credenciais inválidas.',
  /** 500 do auth_service: o texto do registo ("concluir o registo") não serve aqui. */
  server: 'Não foi possível concluir a operação. Tente novamente dentro de instantes.',
  /** Pedido de OTP perdido (link aberto directamente, aba recarregada, etc.). */
  pendingMissing:
    'Não há nenhum código em curso. Introduza novamente as suas credenciais para receber um novo código.',
} as const;

interface LaravelLoginBody {
  message?: string;
  error?: string;
}

/** Cabeçalho `Retry-After` (segundos) ou `retry_after` no corpo do 429. */
function readRetryAfterSeconds(error: unknown): number | undefined {
  if (!axios.isAxiosError(error)) return undefined;

  const body = (error.response?.data ?? {}) as { retry_after?: unknown };
  const header = error.response?.headers?.['retry-after'];

  const raw = body.retry_after ?? header;
  if (raw === undefined || raw === null) return undefined;

  const seconds = Number(raw);
  return Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : undefined;
}

/**
 * Converte qualquer falha do serviço de login num `LoginApiError`.
 * As chaves do Laravel (`email`, `password`, `code`) coincidem com os campos do
 * formulário; a chave `error` (credenciais erradas) fica sem campo e é mostrada
 * no banner global.
 */
export function toLoginApiError(error: unknown): LoginApiError {
  const normalized = normalizeApiError(error);
  const retryAfterSeconds = readRetryAfterSeconds(error);

  if (!axios.isAxiosError(error)) {
    return { ...normalized, retryAfterSeconds };
  }

  const status = error.response?.status;
  const body = (error.response?.data ?? {}) as LaravelLoginBody;
  const backendMessage = body.message || body.error;

  if (status === undefined) {
    return { ...normalized, retryAfterSeconds };
  }

  if (status >= 500) {
    return { ...normalized, message: LOGIN_API_MESSAGES.server, retryAfterSeconds };
  }

  if (status === 401 || status === 404) {
    return {
      ...normalized,
      message: backendMessage || LOGIN_API_MESSAGES.unauthorized,
      retryAfterSeconds,
    };
  }

  if (status === 429) {
    return {
      ...normalized,
      message: backendMessage || API_ERROR_MESSAGES.rateLimit,
      retryAfterSeconds,
    };
  }

  return { ...normalized, retryAfterSeconds };
}

/** `true` quando o objecto já é um erro normalizado do login. */
export function isLoginApiError(value: unknown): value is LoginApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'fieldErrors' in value &&
    'isNetworkError' in value &&
    'isValidationError' in value
  );
}

/**
 * Separa os erros do backend entre campos do formulário e mensagens sem campo
 * correspondente (ex.: a chave `error` do `AuthLoginRequest`), para que nenhuma
 * mensagem se perca. Mesmo critério do `useRegisterForm`.
 */
export function splitBackendFieldErrors(
  fieldErrors: Record<string, string>,
  allowedFields: readonly string[],
): { fields: Record<string, string>; unmatched: string[] } {
  const fields: Record<string, string> = {};
  const unmatched: string[] = [];

  Object.entries(fieldErrors).forEach(([field, message]) => {
    if (allowedFields.includes(field)) {
      fields[field] = message;
    } else {
      unmatched.push(message);
    }
  });

  return { fields, unmatched };
}

/**
 * Falhas que valem um toast global (falha de rede, timeout, 429 ou 5xx).
 * Tudo o que é regra de negócio (422, 401 do OTP) fica no banner/inline.
 */
export function isGlobalFailure(error: NormalizedApiError): boolean {
  if (error.isNetworkError) return true;
  if (error.status === undefined) return true;
  return error.status === 429 || error.status >= 500;
}

/** Texto do tempo de espera de um 429 (ex.: `2 minutos`). */
export function formatRetryAfter(seconds: number): string {
  if (seconds < 60) return `${seconds} segundo${seconds === 1 ? '' : 's'}`;

  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minuto${minutes === 1 ? '' : 's'}`;
}
