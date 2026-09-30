import { authApi } from '../../../lib/api';
import type { RequestOtpResult } from '../types/login';
import type { NewPasswordRequestPayload, ResetOtpVerification } from '../types/passwordReset';
import { toLoginApiError } from '../utils/loginApiError';

/**
 * Serviço do fluxo de recuperação de palavra-passe.
 *
 * ⚠️ Único ponto deste fluxo que fala HTTP — as páginas e os hooks
 * (`useForgotPassword`, `useResetOtp`, `useNewPassword`) nunca importam axios.
 *
 * Rotas espelhadas do auth_service (prefixo somado à raiz `/api` do cliente
 * central em `src/lib/api.ts`):
 *   - POST /v1/users/recuver-password -> `UserController::recuverPassword`
 *     (⚠️ "recuver" com "u" é o path REAL do backend — não corrigir)
 *   - POST /v1/auth/verify-otp       -> `AuthController::verifyCodeOTP`
 *   - POST /v1/users/new-password    -> `UserController::newPassword`
 *
 * Notas do contrato (lidas do backend):
 *   - `recuver-password` NÃO devolve 200 sempre: valida `exists:users,email` e
 *     responde 422 com «Email inexistente» quando o email não existe;
 *   - `verify-otp` devolve o JWT completo (`access_token`), que aqui é
 *     descartado de propósito — validar o código não pode abrir sessão;
 *   - `new-password` exige o campo `new_password` (não `password`) e o `email`,
 *     e NÃO tem `password_confirmation` nem exige token/autenticação.
 */

const RECUVER_PASSWORD_PATH = '/v1/users/recuver-password';
const VERIFY_OTP_PATH = '/v1/auth/verify-otp';
const NEW_PASSWORD_PATH = '/v1/users/new-password';

/** Envelope padrão das respostas do auth_service: `{ success, message, data }`. */
interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

/** `CodeOTPResource` — o `code` não é devolvido por segurança. */
interface OtpResource {
  id?: string;
  user_id?: string;
  expires_at?: string | null;
}

/** Resposta de `POST /v1/auth/verify-otp` (inclui o token que NÃO guardamos). */
interface VerifyOtpResponse extends ApiEnvelope<unknown> {
  access_token?: string;
}

/** Email normalizado como o resto do auth_service o envia/compara. */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export const passwordResetService = {
  /**
   * Ecrã 1 — pede o código OTP de recuperação.
   *
   * O `expires_at` alimenta o ecrã 2 (o código vale 15 minutos). O 422 do
   * `email` («Email inexistente») chega normalizado como erro de campo.
   *
   * ⚠️ Bug latente do backend (só documentado, não corrigido aqui): um
   * utilizador em soft delete passa a validação `exists` mas `findByEmail`
   * devolve `null` -> 500. Tratado como falha global pelo formulário.
   */
  async requestPasswordReset(email: string): Promise<RequestOtpResult> {
    let body: ApiEnvelope<OtpResource> = {};

    try {
      const response = await authApi.post<ApiEnvelope<OtpResource>>(RECUVER_PASSWORD_PATH, {
        email: normalizeEmail(email),
      });
      body = response.data ?? {};
    } catch (error) {
      throw toLoginApiError(error);
    }

    const data = body.data;

    return {
      message: body.message ?? 'Código OTP gerado e enviado ao seu email',
      expiresAt: data?.expires_at ?? null,
      otpId: data?.id ?? null,
    };
  },

  /**
   * Ecrã 2 — valida o código OTP.
   *
   * O DTO do backend declara `code` como inteiro (`AuthVerifyOTPDTO`). Um código
   * inválido/expirado chega como 401 («Código OTP inválido ou expirado»).
   *
   * O `access_token` devolvido em caso de sucesso serve apenas de prova de que o
   * backend aceitou o código: é lido e deitado fora (nunca guardado em
   * `localStorage` nem entregue ao `AuthContext`).
   */
  async verifyResetOtp(payload: { email: string; code: number }): Promise<ResetOtpVerification> {
    let body: VerifyOtpResponse = {};

    try {
      const response = await authApi.post<VerifyOtpResponse>(VERIFY_OTP_PATH, {
        email: normalizeEmail(payload.email),
        code: payload.code,
      });
      body = response.data ?? {};
    } catch (error) {
      throw toLoginApiError(error);
    }

    if (!body.access_token) {
      throw new Error('O código foi aceite, mas a API não devolveu o token de acesso.');
    }

    return { message: body.message ?? 'Código OTP válido' };
  },

  /**
   * Ecrã 3 — define a nova palavra-passe (`bcrypt` no backend).
   *
   * O formulário trabalha com `password`; o Laravel espera `new_password` — a
   * tradução acontece aqui, num único sítio.
   */
  async submitNewPassword(payload: NewPasswordRequestPayload): Promise<{ message: string }> {
    let body: ApiEnvelope<unknown> = {};

    try {
      const response = await authApi.post<ApiEnvelope<unknown>>(NEW_PASSWORD_PATH, {
        email: normalizeEmail(payload.email),
        // `NewPasswordUserRequest` -> `new_password: required` (não existe `confirmed`).
        new_password: payload.password,
      });
      body = response.data ?? {};
    } catch (error) {
      throw toLoginApiError(error);
    }

    return { message: body.message ?? 'Nova senha definida com sucesso' };
  },
};
