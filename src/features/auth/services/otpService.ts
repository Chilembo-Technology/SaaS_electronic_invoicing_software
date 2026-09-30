import { authApi } from '../../../lib/api';
import type { RequestOtpResult } from '../types/login';
import { toLoginApiError } from '../utils/loginApiError';

/**
 * Serviço do código OTP (`auth_service/routes/otp/otp_rooter.php`).
 *
 * Vive separado do `loginService` porque cobre outro grupo de rotas do backend:
 *   - POST /v1/otp/generate -> `OTPController::generateOTP` (prefixo `v1/otp`)
 *
 * O `/login` também gera um código, mas exige as credenciais. Este endpoint
 * serve apenas o "Reenviar código" do passo 2: precisa só do `email`, que
 * sobrevive em `sessionStorage` (`utils/otpSession.ts`) — funciona mesmo depois
 * de a página ser recarregada, sem guardar a password.
 *
 * Regras do backend (lidas de `GenerateOTPRequest` / `OTPService::generateOTP`):
 *   - campo obrigatório: `email` (`required|string|email|max:255|exists:users,email`);
 *   - rota PÚBLICA (sem middleware; `authorize()` devolve `true`);
 *   - 200 -> `{ success, message, data: { id, user_id, expires_at, … } }`
 *     (o `code` nunca é devolvido; o novo código vale 15 minutos);
 *   - 422 -> validação (email em falta/inválido/inexistente); não há 429 nesta rota.
 *
 * ⚠️ O backend NÃO invalida os códigos anteriores deste utilizador: um código
 * antigo que ainda não tenha expirado continua a ser aceite no `/verify-otp`.
 */

const RESEND_OTP_PATH = '/v1/otp/generate';

/** Envelope padrão das respostas do auth_service: `{ success, message, data }`. */
interface OtpEnvelope<T> {
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

/** Email normalizado como o `loginService` o envia (o backend compara o valor exacto). */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export const otpService = {
  /**
   * Pede um novo código para o email indicado.
   *
   * O `expires_at` devolvido substitui o do pedido anterior (`pending`), para o
   * passo 2 mostrar a validade correcta do código mais recente.
   */
  async resendOtp(email: string): Promise<RequestOtpResult> {
    let body: OtpEnvelope<OtpResource> = {};

    try {
      const response = await authApi.post<OtpEnvelope<OtpResource>>(RESEND_OTP_PATH, {
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
};
