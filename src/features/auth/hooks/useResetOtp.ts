import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'sonner';

import type { AuthGlobalError } from '../types/login';
import type {
  PendingPasswordReset,
  ResetOtpField,
  ResetOtpFieldErrors,
  ResetOtpFormValues,
} from '../types/passwordReset';
import { emptyResetOtpValues } from '../types/passwordReset';
import {
  RESET_OTP_FIELDS,
  validateResetOtpField,
  validateResetOtpForm,
} from '../utils/passwordResetValidation';
import { isOtpComplete, sanitizeOtpCode } from '../utils/loginValidation';
import { firstErrorField, hasErrors } from '../utils/registerValidation';
import { focusField, markAllTouched, type TouchedMap } from '../utils/formState';
import { API_ERROR_MESSAGES } from '../utils/apiError';
import {
  LOGIN_API_MESSAGES,
  formatRetryAfter,
  isGlobalFailure,
  isLoginApiError,
  splitBackendFieldErrors,
  toLoginApiError,
  type LoginApiError,
} from '../utils/loginApiError';
import { RESEND_COOLDOWN_SECONDS } from './useVerifyOtp';
import { passwordResetService } from '../services/passwordResetService';

/**
 * Ecrã 2 da recuperação de palavra-passe: valida o código OTP recebido
 * (`POST /v1/auth/verify-otp`) e permite reenviar o código
 * (`POST /v1/users/recuver-password`, o mesmo endpoint do ecrã 1 — só precisa do
 * email, tal como o "Reenviar código" do login só precisa do email).
 *
 * Segue o padrão do `useVerifyOtp`, com duas diferenças deliberadas:
 *   - o `pending` (email + validade) vem por PROPS (React Router state), não do
 *     `sessionStorage` — um refresh da página devolve o utilizador ao ecrã 1;
 *   - o JWT devolvido pelo `/verify-otp` é descartado pelo serviço: validar o
 *     código NUNCA abre sessão a meio de um reset.
 *
 * O 401/404 do backend é um erro do próprio código, por isso é mostrado inline
 * no campo (nunca em toast), tal como no login.
 */
export function useResetOtp(pending: PendingPasswordReset | null) {
  const [values, setValues] = useState<ResetOtpFormValues>(emptyResetOtpValues);
  const [errors, setErrors] = useState<ResetOtpFieldErrors>({});
  const [touched, setTouched] = useState<TouchedMap<ResetOtpField>>({});
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  /** Segundos que faltam para poder voltar a reenviar (0 = disponível). */
  const [resendCooldown, setResendCooldown] = useState(0);
  /** `expires_at` do código mais recente (do ecrã 1 ou do reenvio). */
  const [expiresAt, setExpiresAt] = useState<string | null>(pending?.expiresAt ?? null);
  const [globalError, setGlobalError] = useState<AuthGlobalError | null>(null);

  /** Desconta o cooldown de reenvio de segundo a segundo (pára no zero). */
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = window.setTimeout(() => setResendCooldown((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  /** Só um código completo (9 dígitos) pode ser submetido. */
  const canSubmit = isOtpComplete(values.code);
  /** Reenviar exige o email do pedido em curso e o fim do cooldown. */
  const canResend = pending !== null && resendCooldown === 0;

  const setCode = (value: string) => {
    const nextValues = { code: sanitizeOtpCode(value) };
    setValues(nextValues);

    if (touched.code || errors.code) {
      const error = validateResetOtpField('code', nextValues);
      setErrors((current) => {
        const next = { ...current };
        if (error) next.code = error;
        else delete next.code;
        return next;
      });
    }
  };

  const handleBlur = () => {
    setTouched((current) => ({ ...current, code: true }));

    const error = validateResetOtpField('code', values);
    setErrors((current) => {
      const next = { ...current };
      if (error) next.code = error;
      else delete next.code;
      return next;
    });
  };

  /** Borda/ícone verde do código: tocado, sem erro e completo. */
  const isCodeValid = (): boolean =>
    Boolean(touched.code) && !errors.code && isOtpComplete(values.code);

  /** Distribui a falha da API: erro do código inline, resto no banner global. */
  const applyApiError = (normalized: LoginApiError) => {
    const { fields, unmatched } = splitBackendFieldErrors(normalized.fieldErrors, RESET_OTP_FIELDS);
    const isCodeRejected = normalized.status === 401 || normalized.status === 404;
    const nextErrors: Record<string, string> = { ...fields };

    if (isCodeRejected) {
      nextErrors.code = fields.code ?? normalized.message;
    }

    setErrors(nextErrors as ResetOtpFieldErrors);
    setTouched(markAllTouched(RESET_OTP_FIELDS));
    if (nextErrors.code) window.setTimeout(() => focusField('code'), 0);

    const wait = normalized.retryAfterSeconds
      ? ` Tente novamente em ${formatRetryAfter(normalized.retryAfterSeconds)}.`
      : '';
    const message = normalized.isValidationError
      ? unmatched.join(' ') || API_ERROR_MESSAGES.validation
      : `${normalized.message}${wait}`;

    setGlobalError({
      variant: normalized.status === 429 ? 'warning' : 'error',
      title:
        normalized.status === 429
          ? 'Demasiadas tentativas'
          : 'Não foi possível validar o código',
      message,
    });

    if (isGlobalFailure(normalized)) toast.error(normalized.message);
  };

  /**
   * Falha do REENVIO (`POST /v1/users/recuver-password`).
   *
   * Não reutiliza o `applyApiError` de propósito: ali um 401/404 é o código
   * rejeitado e é escrito no campo `code`. Aqui a única chave possível é `email`
   * (`UserEmailRequest`), que não tem campo neste ecrã — o 422 vai para o banner
   * com o texto do backend (ex.: «Email inexistente»).
   */
  const applyResendApiError = (normalized: LoginApiError) => {
    const fieldMessage = Object.values(normalized.fieldErrors)[0];
    const wait = normalized.retryAfterSeconds
      ? ` Tente novamente em ${formatRetryAfter(normalized.retryAfterSeconds)}.`
      : '';
    const message = normalized.isValidationError
      ? fieldMessage ?? API_ERROR_MESSAGES.validation
      : `${normalized.message}${wait}`;

    setGlobalError({
      variant: normalized.status === 429 ? 'warning' : 'error',
      title:
        normalized.status === 429 ? 'Demasiadas tentativas' : 'Não foi possível reenviar o código',
      message,
    });

    if (isGlobalFailure(normalized)) {
      toast.error(normalized.status === 429 ? normalized.message : LOGIN_API_MESSAGES.resendFailed);
    }
  };

  /**
   * Valida o código introduzido.
   *
   * @returns `true` quando o backend aceitou o código (o JWT devolvido é
   *          descartado pelo serviço).
   */
  const submit = async (event?: FormEvent<HTMLFormElement>): Promise<boolean> => {
    event?.preventDefault();
    if (submitting) return false;

    if (!pending) {
      setGlobalError({
        variant: 'warning',
        title: 'Código em falta',
        message: LOGIN_API_MESSAGES.pendingMissing,
      });
      return false;
    }

    const validationErrors = validateResetOtpForm(values);
    setErrors(validationErrors);
    setTouched(markAllTouched(RESET_OTP_FIELDS));

    if (hasErrors(validationErrors)) {
      setGlobalError({
        variant: 'warning',
        title: 'Código incompleto',
        message: API_ERROR_MESSAGES.validation,
      });
      window.setTimeout(() => focusField('code'), 0);
      return false;
    }

    setGlobalError(null);
    setSubmitting(true);

    try {
      // O DTO do backend recebe `code` como inteiro (AuthVerifyOTPDTO).
      await passwordResetService.verifyResetOtp({
        email: pending.email,
        code: Number(values.code),
      });

      return true;
    } catch (error) {
      applyApiError(isLoginApiError(error) ? error : toLoginApiError(error));
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Reenvia o código de recuperação.
   *
   * Usa o MESMO endpoint do ecrã 1 (`POST /v1/users/recuver-password`), que só
   * precisa do email — tal como o reenvio do login só precisa do email.
   *
   * @returns `true` quando o backend confirmou o envio do novo código.
   */
  const resend = async (): Promise<boolean> => {
    if (resending || submitting || resendCooldown > 0) return false;

    if (!pending) {
      setGlobalError({
        variant: 'info',
        title: 'Reenvio indisponível',
        message: LOGIN_API_MESSAGES.pendingMissing,
      });
      return false;
    }

    setResending(true);

    try {
      const result = await passwordResetService.requestPasswordReset(pending.email);
      // A validade mostrada passa a ser a do código mais recente.
      setExpiresAt(result.expiresAt);
      setValues(emptyResetOtpValues);
      setErrors({});
      setGlobalError(null);
      // Bloqueia o botão durante alguns segundos para evitar pedidos em rajada.
      setResendCooldown(RESEND_COOLDOWN_SECONDS);

      toast.success('Novo código enviado', {
        description: 'Verifique o seu email e introduza o código de 9 dígitos.',
      });

      return true;
    } catch (error) {
      applyResendApiError(isLoginApiError(error) ? error : toLoginApiError(error));
      return false;
    } finally {
      setResending(false);
    }
  };

  return {
    // estado
    pending,
    values,
    errors,
    touched,
    submitting,
    resending,
    canSubmit,
    canResend,
    resendCooldown,
    expiresAt,
    globalError,
    // ações
    setCode,
    handleBlur,
    isCodeValid,
    submit,
    resend,
    setGlobalError,
  };
}
