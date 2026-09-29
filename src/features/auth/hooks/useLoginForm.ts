import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import type { AuthGlobalError, LoginField, LoginFieldErrors, LoginFormValues } from "../types/login";
import { emptyLoginValues } from "../types/login";
import { LOGIN_FIELDS, validateLoginField, validateLoginForm } from "../utils/loginValidation";
import { firstErrorField, hasErrors } from "../utils/registerValidation";
import { focusField, markAllTouched, type TouchedMap } from "../utils/formState";
import { API_ERROR_MESSAGES } from "../utils/apiError";
import {
  formatRetryAfter,
  isGlobalFailure,
  isLoginApiError,
  splitBackendFieldErrors,
  toLoginApiError,
  type LoginApiError,
} from "../utils/loginApiError";
import { loginService } from "../services/loginService";
import { savePendingLogin } from "../utils/otpSession";

/**
 * Orquestra o passo 1 do login: validação local das credenciais e pedido do
 * código OTP (`POST /v1/auth/login`, via `loginService`).
 *
 * Mesma estrutura do `useRegisterForm`: `values`/`errors`/`touched`, revalidação
 * só depois do blur, banner global para o que não é erro de campo e toast apenas
 * em falhas globais (rede, timeout, 429, 5xx).
 *
 * ⚠️ O `/login` NÃO devolve token: o sucesso aqui significa "código enviado" e
 * a página segue para `/login/verify-otp`, onde nasce a sessão.
 *
 * Nota: as chaves de erro do Laravel (`email`, `password`) coincidem com os
 * campos do formulário, por isso não é preciso mapa de campos. A chave `error`
 * (credenciais incorretas) não tem campo e é mostrada no banner global.
 */

export function useLoginForm() {
  const [values, setValues] = useState<LoginFormValues>(emptyLoginValues);
  const [errors, setErrors] = useState<LoginFieldErrors>({});
  const [touched, setTouched] = useState<TouchedMap<LoginField>>({});
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<AuthGlobalError | null>(null);

  /**
   * Só os campos vazios bloqueiam o botão. Erros de formato continuam a poder ser
   * submetidos, para o utilizador ver a mensagem (inline) do que está mal.
   */
  const canSubmit = values.email.trim().length > 0 && values.password.length > 0;

  const setValue = <K extends LoginField>(field: K, value: LoginFormValues[K]) => {
    const nextValues = { ...values, [field]: value };
    setValues(nextValues);

    // Só revalida depois de o campo ter sido tocado (evita ruído enquanto se escreve).
    if (touched[field] || errors[field]) {
      const error = validateLoginField(field, nextValues);
      setErrors((current) => {
        const next = { ...current };
        if (error) next[field] = error;
        else delete next[field];
        return next;
      });
    }
  };

  const handleBlur = (field: LoginField) => {
    setTouched((current) => ({ ...current, [field]: true }));

    const error = validateLoginField(field, values);
    setErrors((current) => {
      const next = { ...current };
      if (error) next[field] = error;
      else delete next[field];
      return next;
    });
  };

  /** Borda/ícone verde: só depois do blur, sem erro e com valor preenchido. */
  const isFieldValid = (field: LoginField): boolean => {
    if (!touched[field] || errors[field]) return false;
    return String(values[field] ?? "").trim().length > 0;
  };

  /** Distribui a falha da API: erro por campo inline, resto no banner global. */
  const applyApiError = (normalized: LoginApiError) => {
    const { fields, unmatched } = splitBackendFieldErrors(normalized.fieldErrors, LOGIN_FIELDS);
    setErrors(fields as LoginFieldErrors);
    setTouched(markAllTouched(LOGIN_FIELDS));

    const firstInvalid = firstErrorField(fields as LoginFieldErrors, LOGIN_FIELDS);
    if (firstInvalid) window.setTimeout(() => focusField(firstInvalid), 0);

    // O 422 das credenciais traz a chave `error` (sem campo) — vai para o banner.
    const wait = normalized.retryAfterSeconds
      ? ` Tente novamente em ${formatRetryAfter(normalized.retryAfterSeconds)}.`
      : "";
    const message = normalized.isValidationError
      ? unmatched.join(" ") || API_ERROR_MESSAGES.validation
      : `${normalized.message}${wait}`;

    setGlobalError({
      variant: normalized.status === 429 ? "warning" : "error",
      title:
        normalized.status === 429 ? "Demasiadas tentativas" : "Não foi possível iniciar sessão",
      message,
    });

    if (isGlobalFailure(normalized)) toast.error(normalized.message);
  };

  /** @returns `true` quando o código foi pedido (a página segue para o passo 2). */
  const submit = async (event?: FormEvent<HTMLFormElement>): Promise<boolean> => {
    event?.preventDefault();
    if (submitting) return false;

    const validationErrors = validateLoginForm(values);
    setErrors(validationErrors);
    setTouched(markAllTouched(LOGIN_FIELDS));

    if (hasErrors(validationErrors)) {
      const firstInvalid = firstErrorField(validationErrors, LOGIN_FIELDS);
      setGlobalError({
        variant: "warning",
        title: "Dados incompletos",
        message: API_ERROR_MESSAGES.validation,
      });
      if (firstInvalid) window.setTimeout(() => focusField(firstInvalid), 0);
      return false;
    }

    setGlobalError(null);
    setSubmitting(true);

    const credentials = {
      email: values.email.trim().toLowerCase(),
      password: values.password,
    };

    try {
      const result = await loginService.requestOtp(credentials);

      // O `/verify-otp` volta a exigir o email; a password fica só em memória.
      savePendingLogin(credentials, result.expiresAt);

      toast.success("Código enviado", {
        description: "Verifique o seu email e introduza o código de 9 dígitos.",
      });

      return true;
    } catch (error) {
      applyApiError(isLoginApiError(error) ? error : toLoginApiError(error));
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setValues(emptyLoginValues);
    setErrors({});
    setTouched({});
    setGlobalError(null);
  };

  return {
    // estado
    values,
    errors,
    touched,
    submitting,
    canSubmit,
    globalError,
    // ações
    setValue,
    handleBlur,
    isFieldValid,
    submit,
    setGlobalError,
    resetForm,
  };
}
