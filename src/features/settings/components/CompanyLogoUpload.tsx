import { useEffect, useState, type ChangeEvent } from 'react';
import { Image as ImageIcon, Upload, X } from 'lucide-react';

import { Label } from '../../../app/components/ui/label';
import { FieldError } from '../../../components/forms/FieldError';
import { LOGO_ACCEPT_ATTRIBUTE, LOGO_MAX_LABEL } from '../../auth/utils/registerValidation';
import { validateLogoFile } from '../utils/validation';

interface CompanyLogoUploadProps {
  file: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
  error?: string;
  /** URL do logotipo actual. `company/list` não o devolve — pode ser `null`. */
  currentUrl?: string | null;
}

/**
 * Upload do logotipo com pré-visualização local.
 *
 * Nota (Fase 1): o `CompanyListResource` não expõe `logo_path`, pelo que a
 * imagem actual só aparece depois de um upload. Aqui mostramos um placeholder
 * quando não há imagem — nunca inventamos um caminho que o backend não devolve.
 */
export function CompanyLogoUpload({
  file,
  onChange,
  disabled = false,
  error,
  currentUrl = null,
}: CompanyLogoUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | undefined>(undefined);
  const inputId = 'company-logo';

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const shownError = error ?? localError;
  const src = previewUrl ?? currentUrl;

  const handleSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    const validationError = validateLogoFile(selected);
    setLocalError(validationError);
    onChange(validationError ? null : selected);
    // Permite voltar a escolher o mesmo ficheiro depois de o remover.
    event.target.value = '';
  };

  return (
    <div>
      <Label htmlFor={inputId} className="text-sm font-medium text-foreground">
        Logotipo
      </Label>

      <div className="mt-1.5 flex items-center gap-4">
        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
          {src ? (
            <img src={src} alt="Pré-visualização do logotipo" className="h-full w-full object-contain" />
          ) : (
            <ImageIcon size={24} className="text-muted-foreground" aria-hidden="true" />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor={inputId}
            className={`inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted ${
              disabled ? 'pointer-events-none opacity-60' : ''
            }`}
          >
            <Upload size={16} aria-hidden="true" />
            Selecionar imagem
          </label>

          {file ? (
            <button
              type="button"
              onClick={() => {
                setLocalError(undefined);
                onChange(null);
              }}
              disabled={disabled}
              className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-destructive disabled:opacity-60"
            >
              <X size={13} aria-hidden="true" />
              Remover seleção
            </button>
          ) : (
            <p className="text-xs text-muted-foreground">
              PNG, JPG, SVG ou WEBP · máx. {LOGO_MAX_LABEL}
            </p>
          )}
        </div>
      </div>

      <input
        id={inputId}
        name={inputId}
        type="file"
        accept={LOGO_ACCEPT_ATTRIBUTE}
        className="sr-only"
        disabled={disabled}
        onChange={handleSelect}
      />

      {shownError ? <FieldError id={`${inputId}-error`} message={shownError} /> : null}
    </div>
  );
}
