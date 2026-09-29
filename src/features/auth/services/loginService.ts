import { authApi } from '../../../lib/api';
import { toUser, type UserResource } from '../../../services/authService';
import type {
  AuthenticatedSession,
  RequestOtpPayload,
  RequestOtpResult,
  VerifyOtpPayload,
} from '../types/login';
import { toLoginApiError } from '../utils/loginApiError';

/**
 * Serviço do fluxo de entrada.
 *
 * ⚠️ Único ponto do login que fala HTTP. As páginas e os hooks (`useLoginForm`,
 * `useVerifyOtp`) nunca importam axios nem as instâncias da API.
 *
 * Rotas espelhadas do `auth_service/routes/auth/auth_rooter.php` (prefixo `v1/auth`
 * somado à raiz `/api` do cliente central):
 *   - POST /v1/auth/login      -> `AuthController::authLogin`   (gera/envia OTP; NUNCA devolve token)
 *   - POST /v1/auth/verify-otp -> `AuthController::verifyCodeOTP` (valida o código e devolve o JWT)
 */

const REQUEST_OTP_PATH = '/v1/auth/login';
const VERIFY_OTP_PATH = '/v1/auth/verify-otp';

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

/** Resposta de `POST /v1/auth/verify-otp` (token + `UserListResource`). */
interface VerifyOtpResponse extends ApiEnvelope<UserResource> {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  expires_at?: string | null;
}

/** Email normalizado como o backend espera (`Auth::validate` usa o valor exacto). */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export const loginService = {
  /**
   * Passo 1 — pede um código OTP. O backend responde 200 sem token: só confirma
   * o envio para o email (o código vale 15 minutos).
   */
  async requestOtp(payload: RequestOtpPayload): Promise<RequestOtpResult> {
    let body: ApiEnvelope<OtpResource> = {};

    try {
      const response = await authApi.post<ApiEnvelope<OtpResource>>(REQUEST_OTP_PATH, {
        email: normalizeEmail(payload.email),
        password: payload.password,
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
   * Passo 2 — valida o código e devolve a sessão autenticada (JWT).
   * O `email` volta a ser enviado porque `AuthVerifyOTPRequest` o exige.
   */
  async verifyOtp(payload: VerifyOtpPayload): Promise<AuthenticatedSession> {
    let body: VerifyOtpResponse = {};

    try {
      const response = await authApi.post<VerifyOtpResponse>(VERIFY_OTP_PATH, {
        email: normalizeEmail(payload.email),
        // O DTO do backend declara `code` como inteiro (`AuthVerifyOTPDTO`).
        code: payload.code,
      });
      body = response.data ?? {};
    } catch (error) {
      throw toLoginApiError(error);
    }

    const token = body.access_token ?? '';
    if (!token) {
      throw new Error('O código foi aceite, mas a API não devolveu o token de acesso.');
    }

    return {
      token,
      tokenType: body.token_type ?? 'bearer',
      expiresIn: body.expires_in ?? null,
      expiresAt: body.expires_at ?? null,
      message: body.message ?? 'Código OTP válido',
      user: toUser(body.data),
    };
  },
};
