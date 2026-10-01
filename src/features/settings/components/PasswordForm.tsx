import { useState, type FormEvent } from 'react';
import { KeyRound, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '../../../app/components/ui/button';
import { FormAlert } from '../../../components/forms/FormAlert';
import { FormField } from '../../../components/forms/FormField';
import { normalizeApiError } from '../../auth/utils/apiError';
import { profileService } from '../services/profileService';
import type { PasswordFormValues } from '../types/profile.types';
import { hasAnyError, validatePasswordFields } from '../utils/validation';

interface PasswordFormProps {
  userId: string;
  companyId: string;
  canEdit: boolean;
}

const EMPTY: PasswordFormValues = { password: '', confirmPassword: '' };

/**
 * Secção "Alterar palavra-passe". Reutiliza `POST /v1/users/update/{id}` com o
 * campo `password` (só disponível a administradores, como o resto do perfil).
 */
export function PasswordForm({ userId, companyId, canEdit }: PasswordFormProps) {
  const [values, setValues] = useState<PasswordFormValues>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof PasswordFormValues, string>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const update = (field: keyof PasswordFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canEdit || isSaving) return;

    setSubmitError(null);

    const validationErrors = validatePasswordFields(values);
    setErrors(validationErrors);
    if (hasAnyError(validationErrors)) return;

    setIsSaving(true);
    try {
      await profileService.updateProfile(userId, {
        company_id: companyId,
        password: values.password,
      });
      toast.success('Palavra-passe atualizada com sucesso.');
      setValues(EMPTY);
      setErrors({});
    } catch (err) {
      const normalized = normalizeApiError(err);
      setSubmitError(normalized.message);
      setErrors((prev) => ({ ...prev, ...normalized.fieldErrors }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {submitError ? (
        <FormAlert variant="error" title="Não foi possível alterar a palavra-passe" message={submitError} />
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <FormField
          id="password"
          label="Nova palavra-passe"
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={(v) => update('password', v)}
          error={errors.password}
          disabled={!canEdit}
          hint="Mínimo de 8 caracteres"
        />
        <FormField
          id="confirmPassword"
          label="Confirmar palavra-passe"
          type="password"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={(v) => update('confirmPassword', v)}
          error={errors.confirmPassword}
          disabled={!canEdit}
        />
      </div>

      {canEdit ? (
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSaving || !values.password || !values.confirmPassword}
            className="h-11 rounded-xl px-6"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <KeyRound size={16} aria-hidden="true" />}
            {isSaving ? 'A guardar…' : 'Alterar palavra-passe'}
          </Button>
        </div>
      ) : null}
    </form>
  );
}
