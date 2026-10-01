import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { Loader2, Save, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '../../../app/components/ui/button';
import { FieldError } from '../../../components/forms/FieldError';
import { FormAlert } from '../../../components/forms/FormAlert';
import { FormField } from '../../../components/forms/FormField';
import { normalizeApiError } from '../../auth/utils/apiError';
import { sanitizeAngolanPhone, sanitizeBiNumber } from '../../auth/utils/registerValidation';
import { profileService } from '../services/profileService';
import type { ProfileData, ProfileFormValues } from '../types/profile.types';
import { hasAnyError, validateProfileFields } from '../utils/validation';

const PHOTO_EXTENSIONS = ['jpeg', 'jpg', 'png', 'gif', 'bmp', 'svg', 'webp', 'heic'];
const PHOTO_MAX_BYTES = 2 * 1024 * 1024;

interface ProfileFormProps {
  profile: ProfileData;
  /** `users/update` exige `administrator|super-admin` no backend. */
  canEdit: boolean;
  onSaved: (profile: ProfileData) => void;
}

function toValues(profile: ProfileData): ProfileFormValues {
  return {
    first_name: profile.first_name,
    last_name: profile.last_name,
    email: profile.email,
    phone_number: profile.phone_number,
    bi_number: profile.bi_number,
  };
}

export function ProfileForm({ profile, canEdit, onSaved }: ProfileFormProps) {
  const [values, setValues] = useState<ProfileFormValues>(() => toValues(profile));
  const [baseline, setBaseline] = useState<ProfileFormValues>(() => toValues(profile));
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ProfileFormValues, string>>>({});
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | undefined>(undefined);

  useEffect(() => {
    const next = toValues(profile);
    setValues(next);
    setBaseline(next);
    setPhotoFile(null);
    setPhotoError(undefined);
    setFormErrors({});
  }, [profile]);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview(null);
      return;
    }
    const url = URL.createObjectURL(photoFile);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  const isDirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(baseline) || photoFile !== null,
    [values, baseline, photoFile],
  );

  const fieldError = (field: keyof ProfileFormValues): string | undefined =>
    formErrors[field] ?? serverErrors[field];

  const update = (field: keyof ProfileFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    event.target.value = '';

    if (!selected) {
      setPhotoFile(null);
      setPhotoError(undefined);
      return;
    }
    const extension = selected.name.split('.').pop()?.toLowerCase() ?? '';
    if (!PHOTO_EXTENSIONS.includes(extension)) {
      setPhotoFile(null);
      setPhotoError('A foto deve ser do tipo: jpeg, png, jpg, gif, bmp, svg, webp ou heic.');
      return;
    }
    if (selected.size > PHOTO_MAX_BYTES) {
      setPhotoFile(null);
      setPhotoError('A foto não pode ser maior que 2MB.');
      return;
    }
    setPhotoError(undefined);
    setPhotoFile(selected);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canEdit || isSaving) return;

    setSubmitError(null);
    setServerErrors({});

    const validationErrors = validateProfileFields(values);
    setFormErrors(validationErrors);
    if (hasAnyError(validationErrors) || photoError) return;

    setIsSaving(true);
    try {
      const updated = await profileService.updateProfile(profile.id, {
        company_id: profile.company_id,
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone_number: sanitizeAngolanPhone(values.phone_number),
        bi_number: values.bi_number ? sanitizeBiNumber(values.bi_number) : '',
        photo: photoFile,
      });
      toast.success('Perfil atualizado com sucesso.');
      onSaved(updated);
    } catch (err) {
      const normalized = normalizeApiError(err);
      setSubmitError(normalized.message);
      setServerErrors(normalized.fieldErrors);
    } finally {
      setIsSaving(false);
    }
  };

  const avatarSrc = photoPreview ?? profile.path_photo ?? null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {!canEdit ? (
        <FormAlert
          variant="info"
          message="Só administradores podem editar o perfil (o backend exige esse papel). Está a ver os dados em modo de leitura."
        />
      ) : null}

      {submitError ? (
        <FormAlert variant="error" title="Não foi possível guardar" message={submitError} />
      ) : null}

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-foreground">Dados pessoais</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            id="first_name"
            label="Nome"
            value={values.first_name}
            onChange={(v) => update('first_name', v)}
            error={fieldError('first_name')}
            disabled={!canEdit}
            required
          />
          <FormField
            id="last_name"
            label="Apelido"
            value={values.last_name}
            onChange={(v) => update('last_name', v)}
            error={fieldError('last_name')}
            disabled={!canEdit}
            required
          />
          <FormField
            id="email"
            label="Email"
            type="email"
            value={values.email}
            onChange={(v) => update('email', v)}
            error={fieldError('email')}
            disabled={!canEdit}
            required
          />
          <FormField
            id="phone_number"
            label="Telefone"
            type="tel"
            inputMode="tel"
            value={values.phone_number}
            onChange={(v) => update('phone_number', sanitizeAngolanPhone(v))}
            error={fieldError('phone_number')}
            disabled={!canEdit}
            hint="9 dígitos, ex.: 923456789"
          />
          <FormField
            id="bi_number"
            label="Nº de BI"
            value={values.bi_number}
            onChange={(v) => update('bi_number', sanitizeBiNumber(v))}
            error={fieldError('bi_number')}
            disabled={!canEdit}
            className="md:col-span-2"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-foreground">Fotografia</h2>
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-xs font-semibold text-muted-foreground">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt="Pré-visualização da fotografia"
                className="h-full w-full object-cover"
              />
            ) : (
              'Sem foto'
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="profile-photo"
              className={`inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted ${
                canEdit ? '' : 'pointer-events-none opacity-60'
              }`}
            >
              <Upload size={16} aria-hidden="true" />
              Escolher fotografia
            </label>
            {photoFile ? (
              <button
                type="button"
                onClick={() => setPhotoFile(null)}
                className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-destructive"
              >
                <X size={13} aria-hidden="true" />
                Remover seleção
              </button>
            ) : (
              <p className="text-xs text-muted-foreground">PNG, JPG, WEBP ou HEIC · máx. 2 MB</p>
            )}
          </div>
        </div>
        <input
          id="profile-photo"
          name="photo"
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={!canEdit}
          onChange={handlePhoto}
        />
        {photoError ? <FieldError id="profile-photo-error" message={photoError} /> : null}
      </div>

      {canEdit ? (
        <div className="flex justify-end">
          <Button type="submit" disabled={!isDirty || isSaving} className="h-11 rounded-xl px-6">
            {isSaving ? (
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            ) : (
              <Save size={16} aria-hidden="true" />
            )}
            {isSaving ? 'A guardar…' : 'Guardar alterações'}
          </Button>
        </div>
      ) : null}
    </form>
  );
}
