import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

import type { AuthGlobalError } from '../types/login';
import type {
  NewPasswordField,
  NewPasswordFieldErrors,
  NewPasswordFormValues,
} from '../types/passwordReset';
import { emptyNewPasswordValues } from '../types/passwordReset';
import {
  NEW_PASSWORD_FIELDS,
  mapNewPasswordFieldErrors,
  validateNewPasswordField,
  validateNewPasswordForm,
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
 * Ecrã 3 da recuperação de palavra-passe: define a nova senha
 * (`POST /v1/users/new-password`, via `passwordResetService`).
 *
 * Mesma estrutura do `useLoginForm`. O `email` (do passo anterior) entra por
 * argumento e é reenviado porque `NewPasswordUserRequest` o exige.
 *
 * ⚠️ A confirmação da senha é validada APENAS aqui: o backend valida só
 * `email` + `new_password` e não tem regra `confirmed`. O 422 do campo
 * `new_password` é traduzido para o campo `password` do formulário
 * (`mapNewPasswordFieldErrors`).
 */
export function useNewPassword(email: string) {
  const [values, setValues] = useState<NewPasswordFormValues>(emptyNewPasswordValues);
  const [errors, setErrors] = useState<NewPasswordFieldErrors>({});
  const [touched, setTouched] = useState<TouchedMap<NewPasswordField>>({});
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<AuthGlobalError | null>(null);

  /** Só os campos vazios bloqueiam o botão. */
  const canSubmit = values.password.length > 0 && values.confirmPassword.length > 0;

  const setValue = <K extends NewPasswordField>(field: K, value: NewPasswordFormValues[K]) => {
    const nextValues = { ...values, [field]: value };
    setValues(nextValues);

    // Só revalida depois de o campo ter sido tocado (evita ruído enquanto se escreve).
    if (touched[field] || errors[field]) {
      const nextTouched: TouchedMap<NewPasswordField> = { ...touched, [field]: true };
      setErrors((current) => {
        // Alterar a senha revalida a confirmação (deixam de coincidir/passam a coincidir).
        const fieldsToCheck: NewPasswordField[] =
          field === 'password' && (nextTouched.confirmPassword || current.confirmPassword)
            ? ['password', 'confirmPassword']
            : [field];

        const next = { ...current };
        fieldsToCheck.forEach((checked) => {
          const error = validateNewPasswordField(checked, nextValues);
          if (error) next[checked] = error;
          else delete next[checked];
        });
        return next;
      });
    }
  };

  const handleBlur = (field: NewPasswordField) => {
    setTouched((current) => ({ ...current, [field]: true }));

    const error = validateNewPasswordField(field, values);
    setErrors((current) => {
      const next = { ...current };
      if (error) next[field] = error;
      else delete next[field];
      return next;
    });
  };

  /** Borda/ícone verde: só depois do blur, sem erro e com valor preenchido. */
  const isFieldValid = (field: NewPasswordField): boolean => {
    if (!touched[field] || errors[field]) return false;
    return String(values[field] ?? '').trim().length > 0;
  };

  /** Distribui a falha da API: erro por campo inline, resto no banner global. */
  const applyApiError = (normalized: LoginApiError) => {
    // `new_password` (Laravel) -> `password` (formulário).
    const { fields, unmatched } = splitBackendFieldErrors(
      mapNewPasswordFieldErrors(normalized.fieldErrors),
      NEW_PASSWORD_FIELDS,
    );
    setErrors(fields as NewPasswordFieldErrors);
    setTouched(markAllTouched(NEW_PASSWORD_FIELDS));

    const firstInvalid = firstErrorField(fields as NewPasswordFieldErrors, NEW_PASSWORD_FIELDS);
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
        normalized.status === 429
          ? 'Demasiadas tentativas'
          : 'Não foi possível alterar a palavra-passe',
      message,
    });

    if (isGlobalFailure(normalized)) toast.error(normalized.message);
  };

  /**
   * Altera a palavra-passe.
   *
   * @returns `true` em caso de sucesso (a página segue para o login).
   */
  const submit = async (event?: FormEvent<HTMLFormElement>): Promise<boolean> => {
    event?.preventDefault();
    if (submitting) return false;

    if (!email) {
      setGlobalError({
        variant: 'warning',
        title: 'Pedido incompleto',
        message: 'Não há nenhum pedido de recuperação em curso. Comece novamente.',
      });
      return false;
    }

    const validationErrors = validateNewPasswordForm(values);
    setErrors(validationErrors);
    setTouched(markAllTouched(NEW_PASSWORD_FIELDS));

    if (hasErrors(validationErrors)) {
      const firstInvalid = firstErrorField(validationErrors, NEW_PASSWORD_FIELDS);
      setGlobalError({
        variant: 'warning',
        title: 'Dados incompletos',
        message: API_ERROR_MESSAGES.validation,
      });
      if (firstInvalid) window.setTimeout(() => focusField(firstInvalid), 0);
      return false;
    }

    setGlobalError(null);
    setSubmitting(true);

    try {
      await passwordResetService.submitNewPassword({ email, password: values.password });

      toast.success('Palavra-passe alterada com sucesso', {
        description: 'Já pode entrar com a nova palavra-passe.',
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
    setValues(emptyNewPasswordValues);
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
