import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import type {
  AuthGlobalError,
  AuthenticatedSession,
  PendingLogin,
  VerifyOtpField,
  VerifyOtpFieldErrors,
  VerifyOtpFormValues,
} from "../types/login";
import { emptyVerifyOtpValues } from "../types/login";
import {
  VERIFY_OTP_FIELDS,
  isOtpComplete,
  sanitizeOtpCode,
  validateVerifyOtpField,
  validateVerifyOtpForm,
} from "../utils/loginValidation";
import { firstErrorField, hasErrors } from "../utils/registerValidation";
import { focusField, markAllTouched, type TouchedMap } from "../utils/formState";
import { API_ERROR_MESSAGES } from "../utils/apiError";
import {
  LOGIN_API_MESSAGES,
  formatRetryAfter,
  isGlobalFailure,
  isLoginApiError,
  splitBackendFieldErrors,
  toLoginApiError,
  type LoginApiError,
} from "../utils/loginApiError";
import { loginService } from "../services/loginService";
import {
  clearPendingLogin,
  getRememberedCredentials,
  readPendingLogin,
  updatePendingExpiry,
} from "../utils/otpSession";

/**
 * Orquestra o passo 2 do login: validação do código OTP e criação da sessão
 * (`POST /v1/auth/verify-otp`, via `loginService`).
 *
 * O `email` vem do pedido de OTP anterior (`otpSession`) — o `AuthVerifyOTPRequest`
 * volta a exigi-lo. O 401/404 do backend é um erro do próprio código, por isso é
 * mostrado inline no campo (nunca em toast).
 */

export function useVerifyOtp() {
  const [pending, setPending] = useState<PendingLogin | null>(() => readPendingLogin());
  const [values, setValues] = useState<VerifyOtpFormValues>(emptyVerifyOtpValues);
  const [errors, setErrors] = useState<VerifyOtpFieldErrors>({});
  const [touched, setTouched] = useState<TouchedMap<VerifyOtpField>>({});
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [globalError, setGlobalError] = useState<AuthGlobalError | null>(null);

  /** Só um código completo (9 dígitos) pode ser submetido. */
  const canSubmit = isOtpComplete(values.code);
  /**
   * Reenviar exige as credenciais do passo 1. Elas vivem apenas em memória:
   * depois de um refresh da página é preciso voltar a introduzi-las.
   */
  const canResend = getRememberedCredentials() !== null;

  const setCode = (value: string) => {
    const nextValues = { code: sanitizeOtpCode(value) };
    setValues(nextValues);

    if (touched.code || errors.code) {
      const error = validateVerifyOtpField("code", nextValues);
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

    const error = validateVerifyOtpField("code", values);
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
    const { fields, unmatched } = splitBackendFieldErrors(normalized.fieldErrors, VERIFY_OTP_FIELDS);
    const isCodeRejected = normalized.status === 401 || normalized.status === 404;
    const nextErrors: Record<string, string> = { ...fields };

    if (isCodeRejected) {
      nextErrors.code = fields.code ?? normalized.message;
    }

    setErrors(nextErrors as VerifyOtpFieldErrors);
    setTouched(markAllTouched(VERIFY_OTP_FIELDS));
    if (nextErrors.code) window.setTimeout(() => focusField("code"), 0);

    const wait = normalized.retryAfterSeconds
      ? ` Tente novamente em ${formatRetryAfter(normalized.retryAfterSeconds)}.`
      : "";
    const message = normalized.isValidationError
      ? unmatched.join(" ") || API_ERROR_MESSAGES.validation
      : `${normalized.message}${wait}`;

    setGlobalError({
      variant: normalized.status === 429 ? "warning" : "error",
      title:
        normalized.status === 429
          ? "Demasiadas tentativas"
          : "Não foi possível validar o código",
      message,
    });

    if (isGlobalFailure(normalized)) toast.error(normalized.message);
  };

  /**
   * Valida o código introduzido.
   * @returns a sessão autenticada (token + utilizador) ou `null` em caso de falha.
   */
  const submit = async (
    event?: FormEvent<HTMLFormElement>,
  ): Promise<AuthenticatedSession | null> => {
    event?.preventDefault();
    if (submitting) return null;

    if (!pending) {
      setGlobalError({
        variant: "warning",
        title: "Código em falta",
        message: LOGIN_API_MESSAGES.pendingMissing,
      });
      return null;
    }

    const validationErrors = validateVerifyOtpForm(values);
    setErrors(validationErrors);
    setTouched(markAllTouched(VERIFY_OTP_FIELDS));

    if (hasErrors(validationErrors)) {
      setGlobalError({
        variant: "warning",
        title: "Código incompleto",
        message: API_ERROR_MESSAGES.validation,
      });
      window.setTimeout(() => focusField("code"), 0);
      return null;
    }

    setGlobalError(null);
    setSubmitting(true);

    try {
      // O DTO do backend recebe `code` como inteiro (AuthVerifyOTPDTO).
      const session = await loginService.verifyOtp({
        email: pending.email,
        code: Number(values.code),
      });

      clearPendingLogin();
      return session;
    } catch (error) {
      applyApiError(isLoginApiError(error) ? error : toLoginApiError(error));
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Reenvia o código: volta a chamar `/login` com as credenciais guardadas em
   * memória (o backend não tem endpoint de reenvio próprio).
   */
  const resend = async (): Promise<boolean> => {
    if (resending || submitting) return false;

    const credentials = getRememberedCredentials();
    if (!credentials) {
      setGlobalError({
        variant: "info",
        title: "Reenvio indisponível",
        message: LOGIN_API_MESSAGES.pendingMissing,
      });
      return false;
    }

    setResending(true);

    try {
      const result = await loginService.requestOtp(credentials);
      updatePendingExpiry(result.expiresAt);
      setPending({ email: credentials.email, expiresAt: result.expiresAt });
      setValues(emptyVerifyOtpValues);
      setErrors({});
      setGlobalError(null);

      toast.success("Novo código enviado", {
        description: "Verifique o seu email e introduza o código de 9 dígitos.",
      });

      return true;
    } catch (error) {
      applyApiError(isLoginApiError(error) ? error : toLoginApiError(error));
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
