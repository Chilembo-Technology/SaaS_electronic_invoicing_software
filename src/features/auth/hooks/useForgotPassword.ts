import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

import type { AuthGlobalError } from '../types/login';
import type {
  ForgotPasswordField,
  ForgotPasswordFieldErrors,
  ForgotPasswordFormValues,
  PendingPasswordReset,
} from '../types/passwordReset';
import { emptyForgotPasswordValues } from '../types/passwordReset';
import {
  FORGOT_PASSWORD_FIELDS,
  validateForgotPasswordField,
  validateForgotPasswordForm,
} from '../utils/passwordResetValidation';
import { firstErrorField, hasErrors } from '../utils/registerValidation';
import { focusField, markAllTouched, type TouchedMap } from '../utils/formState';
import { API_ERROR_MESSAGES } from '../utils/apiError';
import {
  formatRetryAfter,
  isGlobalFailure,
  isLoginApiError,
  splitBackendFieldErrors,
  toLoginApiError,
  type LoginApiError,
} from '../utils/loginApiError';
import { passwordResetService } from '../services/passwordResetService';

/**
 * Ecrã 1 da recuperação de palavra-passe: pede o código OTP de recuperação
 * (`POST /v1/users/recuver-password`, via `passwordResetService`).
 *
 * Mesma estrutura do `useLoginForm`: `values`/`errors`/`touched`, revalidação só
 * depois do blur, banner global para o que não é erro de campo e toast apenas em
 * falhas globais (rede, timeout, 429, 5xx).
 *
 * ⚠️ O backend devolve 422 com «Email inexistente» quando o email não existe
 * (`exists:users,email` no `UserEmailRequest`) — esse erro é escrito INLINE no
 * campo `email`, nunca em toast.
 */
export function useForgotPassword() {
  const [values, setValues] = useState<ForgotPasswordFormValues>(emptyForgotPasswordValues);
  const [errors, setErrors] = useState<ForgotPasswordFieldErrors>({});
  const [touched, setTouched] = useState<TouchedMap<ForgotPasswordField>>({});
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<AuthGlobalError | null>(null);

  /** Só o campo vazio bloqueia o botão; o formato continua a poder ser submetido. */
  const canSubmit = values.email.trim().length > 0;

  const setValue = <K extends ForgotPasswordField>(
    field: K,
    value: ForgotPasswordFormValues[K],
  ) => {
    const nextValues = { ...values, [field]: value };
    setValues(nextValues);

    // Só revalida depois de o campo ter sido tocado (evita ruído enquanto se escreve).
    if (touched[field] || errors[field]) {
      const error = validateForgotPasswordField(field, nextValues);
      setErrors((current) => {
        const next = { ...current };
        if (error) next[field] = error;
        else delete next[field];
        return next;
      });
    }
  };

  const handleBlur = (field: ForgotPasswordField) => {
    setTouched((current) => ({ ...current, [field]: true }));

    const error = validateForgotPasswordField(field, values);
    setErrors((current) => {
      const next = { ...current };
      if (error) next[field] = error;
      else delete next[field];
      return next;
    });
  };

  /** Borda/ícone verde: só depois do blur, sem erro e com valor preenchido. */
  const isFieldValid = (field: ForgotPasswordField): boolean => {
    if (!touched[field] || errors[field]) return false;
    return String(values[field] ?? '').trim().length > 0;
  };

  /** Distribui a falha da API: erro por campo inline, resto no banner global. */
  const applyApiError = (normalized: LoginApiError) => {
    const { fields, unmatched } = splitBackendFieldErrors(
      normalized.fieldErrors,
      FORGOT_PASSWORD_FIELDS,
    );
    setErrors(fields as ForgotPasswordFieldErrors);
    setTouched(markAllTouched(FORGOT_PASSWORD_FIELDS));

    const firstInvalid = firstErrorField(
      fields as ForgotPasswordFieldErrors,
      FORGOT_PASSWORD_FIELDS,
    );
    if (firstInvalid) window.setTimeout(() => focusField(firstInvalid), 0);

    const wait = normalized.retryAfterSeconds
      ? ` Tente novamente em ${formatRetryAfter(normalized.retryAfterSeconds)}.`
      : '';
    const message = normalized.isValidationError
      ? unmatched.join(' ') || API_ERROR_MESSAGES.validation
      : `${normalized.message}${wait}`;

    setGlobalError({
      variant: normalized.status === 429 ? 'warning' : 'error',
      title:
        normalized.status === 429 ? 'Demasiadas tentativas' : 'Não foi possível enviar o código',
      message,
    });

    if (isGlobalFailure(normalized)) toast.error(normalized.message);
  };

  /**
   * Pede o código de recuperação.
   *
   * @returns o estado a entregar ao ecrã 2 (email + validade do código) ou
   *          `null` em caso de falha.
   */
  const submit = async (
    event?: FormEvent<HTMLFormElement>,
  ): Promise<PendingPasswordReset | null> => {
    event?.preventDefault();
    if (submitting) return null;

    const validationErrors = validateForgotPasswordForm(values);
    setErrors(validationErrors);
    setTouched(markAllTouched(FORGOT_PASSWORD_FIELDS));

    if (hasErrors(validationErrors)) {
      const firstInvalid = firstErrorField(validationErrors, FORGOT_PASSWORD_FIELDS);
      setGlobalError({
        variant: 'warning',
        title: 'Dados incompletos',
        message: API_ERROR_MESSAGES.validation,
      });
      if (firstInvalid) window.setTimeout(() => focusField(firstInvalid), 0);
      return null;
    }

    setGlobalError(null);
    setSubmitting(true);

    const email = values.email.trim().toLowerCase();

    try {
      const result = await passwordResetService.requestPasswordReset(email);

      toast.success('Código enviado', {
        description: 'Verifique o seu email e introduza o código de 9 dígitos.',
      });

      return { email, expiresAt: result.expiresAt };
    } catch (error) {
      applyApiError(isLoginApiError(error) ? error : toLoginApiError(error));
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setValues(emptyForgotPasswordValues);
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
