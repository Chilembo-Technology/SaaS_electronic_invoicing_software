import type { PendingLogin, RequestOtpPayload } from '../types/login';

/**
 * Ponte entre os dois passos do login.
 *
 * O `/verify-otp` volta a exigir o `email` (`AuthVerifyOTPRequest`), por isso o
 * email e a expiração do código são gravados em `sessionStorage` — sobrevivem a
 * um refresh da página sem ficarem no `localStorage` depois de fechar o browser.
 *
 * ⚠️ A password NUNCA é persistida: fica apenas em memória do módulo, para
 * permitir "Reenviar código" (que volta a chamar `/login`) enquanto a página não
 * for recarregada. Sem credenciais em memória, o formulário pede-as de novo.
 */

const PENDING_EMAIL_KEY = '@Chilembo:pending-login-email';
const PENDING_EXPIRES_KEY = '@Chilembo:pending-login-expires-at';

/** Credenciais do pedido de OTP em curso (apenas em memória — nunca em disco). */
let rememberedCredentials: RequestOtpPayload | null = null;

/** `sessionStorage` pode não existir (SSR/testes) — nunca deixamos rebentar aqui. */
function sessionStore(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

/** Guarda o pedido de OTP em curso (email + expiração em `sessionStorage`). */
export function savePendingLogin(credentials: RequestOtpPayload, expiresAt: string | null): void {
  rememberedCredentials = credentials;

  const store = sessionStore();
  if (!store) return;

  store.setItem(PENDING_EMAIL_KEY, credentials.email);
  if (expiresAt) store.setItem(PENDING_EXPIRES_KEY, expiresAt);
  else store.removeItem(PENDING_EXPIRES_KEY);
}

/** Email (e expiração) do pedido de OTP em curso; `null` quando não existe. */
export function readPendingLogin(): PendingLogin | null {
  const store = sessionStore();
  const email = store?.getItem(PENDING_EMAIL_KEY)?.trim();

  if (!email) return null;

  return { email, expiresAt: store?.getItem(PENDING_EXPIRES_KEY) ?? null };
}

/** Actualiza apenas a expiração (usado no "Reenviar código"). */
export function updatePendingExpiry(expiresAt: string | null): void {
  const store = sessionStore();
  if (!store) return;

  if (expiresAt) store.setItem(PENDING_EXPIRES_KEY, expiresAt);
  else store.removeItem(PENDING_EXPIRES_KEY);
}

/** Credenciais em memória — necessárias para reenviar o código. */
export function getRememberedCredentials(): RequestOtpPayload | null {
  return rememberedCredentials;
}

/** Limpa tudo (logout, código validado ou pedido reiniciado). */
export function clearPendingLogin(): void {
  rememberedCredentials = null;

  const store = sessionStore();
  store?.removeItem(PENDING_EMAIL_KEY);
  store?.removeItem(PENDING_EXPIRES_KEY);
}
