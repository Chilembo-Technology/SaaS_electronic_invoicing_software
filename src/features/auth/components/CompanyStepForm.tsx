import { useEffect, useMemo, type ChangeEvent, type FormEvent } from "react";
import { ArrowRight, FileText, Loader2, Upload, X } from "lucide-react";

import { Button } from "../../../app/components/ui/button";
import { Input } from "../../../app/components/ui/input";
import { Label } from "../../../app/components/ui/label";
import { cn } from "../../../app/components/ui/utils";
import { FieldError } from "../../../components/forms/FieldError";
import { FormField } from "../../../components/forms/FormField";
import type { CompanyFieldErrors, CompanyFormValues } from "../types/register";
import {
  COMPANY_NAME_MAX,
  LOGO_ACCEPT_ATTRIBUTE,
  LOGO_MAX_LABEL,
  TAX_NUMBER_MAX,
  sanitizeAngolanPhone,
  sanitizeTaxNumber,
} from "../utils/registerValidation";

/** Props do passo 1 — todo o estado vem de `useRegisterForm` (sem HTTP aqui). */
export interface CompanyStepFormProps {
  values: CompanyFormValues;
  errors: CompanyFieldErrors;
  /** Pedido HTTP em curso: botão desactivado e campos "a validar…". */
  submitting: boolean;
  /** Empresa já criada no servidor: campos apenas-leitura. */
  locked: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  /** Usado quando o formulário está bloqueado (`locked`). */
  onContinue: () => void;
  onChange: <K extends keyof CompanyFormValues>(field: K, value: CompanyFormValues[K]) => void;
  onBlur: (field: keyof CompanyFormValues) => void;
  /** Borda/ícone verde: só depois do blur, sem erro e com valor preenchido. */
  isValid: (field: keyof CompanyFormValues) => boolean;
}

/**
 * Passo 1 do registo: dados da empresa (`POST /v1/company/store`).
 * As regras espelham `StoreCompanyRequest` do organization_service.
 */
export function CompanyStepForm({
  values,
  errors,
  submitting,
  locked,
  onSubmit,
  onContinue,
  onChange,
  onBlur,
  isValid,
}: CompanyStepFormProps) {
  /** Durante a submissão os campos ficam também bloqueados (evita edições a meio do pedido). */
  const fieldsDisabled = locked || submitting;

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id="companyName"
          label="Nome da empresa"
          value={values.companyName}
          required
          disabled={fieldsDisabled}
          maxLength={COMPANY_NAME_MAX}
          autoComplete="organization"
          placeholder="Ex.: Kianda Logística, Lda"
          error={errors.companyName}
          showValid={isValid("companyName")}
          hint="Como consta no certificado da AGT."
          validating={submitting}
          onChange={(value) => onChange("companyName", value)}
          onBlur={() => onBlur("companyName")}
        />

        <FormField
          id="taxNumber"
          label="NIF da empresa"
          value={values.taxNumber}
          required
          disabled={fieldsDisabled}
          maxLength={TAX_NUMBER_MAX}
          autoComplete="off"
          placeholder="541789632LA045"
          error={errors.taxNumber}
          showValid={isValid("taxNumber")}
          hint="9 dígitos + 2 letras + 3 dígitos, ou NIF de 10 dígitos."
          validating={submitting}
          onChange={(value) => onChange("taxNumber", sanitizeTaxNumber(value))}
          onBlur={() => onBlur("taxNumber")}
        />

        <FormField
          id="adminEmail"
          label="Email do administrador"
          type="email"
          value={values.adminEmail}
          required
          disabled={fieldsDisabled}
          autoComplete="email"
          placeholder="nome@empresa.ao"
          error={errors.adminEmail}
          showValid={isValid("adminEmail")}
          hint="Será o email de acesso do administrador da conta."
          validating={submitting}
          onChange={(value) => onChange("adminEmail", value)}
          onBlur={() => onBlur("adminEmail")}
        />

        <FormField
          id="phone"
          label="Telefone da empresa"
          type="tel"
          inputMode="tel"
          value={values.phone}
          required
          disabled={fieldsDisabled}
          autoComplete="tel"
          placeholder="923 000 000"
          error={errors.phone}
          showValid={isValid("phone")}
          hint="Número angolano de 9 dígitos (ex.: 923000000)."
          validating={submitting}
          onChange={(value) => onChange("phone", sanitizeAngolanPhone(value))}
          onBlur={() => onBlur("phone")}
        />

        <FormField
          id="address"
          label="Endereço"
          value={values.address}
          disabled={fieldsDisabled}
          autoComplete="street-address"
          placeholder="Rua, número, bairro"
          error={errors.address}
          showValid={isValid("address")}
          validating={submitting}
          onChange={(value) => onChange("address", value)}
          onBlur={() => onBlur("address")}
        />

        <FormField
          id="city"
          label="Cidade"
          value={values.city}
          disabled={fieldsDisabled}
          autoComplete="address-level2"
          placeholder="Luanda"
          error={errors.city}
          showValid={isValid("city")}
          validating={submitting}
          onChange={(value) => onChange("city", value)}
          onBlur={() => onBlur("city")}
        />

        <FormField
          id="province"
          label="Província"
          value={values.province}
          disabled={fieldsDisabled}
          autoComplete="address-level1"
          placeholder="Luanda"
          error={errors.province}
          showValid={isValid("province")}
          validating={submitting}
          onChange={(value) => onChange("province", value)}
          onBlur={() => onBlur("province")}
        />

        <FormField
          id="agtCertificateNumber"
          label="Nº do certificado AGT"
          value={values.agtCertificateNumber}
          disabled={fieldsDisabled}
          placeholder="Opcional"
          error={errors.agtCertificateNumber}
          showValid={isValid("agtCertificateNumber")}
          hint="Pode ser preenchido depois, nas configurações."
          validating={submitting}
          onChange={(value) => onChange("agtCertificateNumber", value)}
          onBlur={() => onBlur("agtCertificateNumber")}
        />
      </div>

      <LogoField
        file={values.logo}
        error={errors.logo}
        disabled={fieldsDisabled}
        valid={isValid("logo")}
        onChange={(file) => onChange("logo", file)}
      />

      {locked ? (
        <Button
          type="button"
          onClick={onContinue}
          className="h-12 w-full rounded-xl bg-brand-navy text-sm font-semibold text-white hover:bg-brand-navy-dark"
        >
          Continuar para o utilizador
          <ArrowRight size={16} />
        </Button>
      ) : (
        <Button
          type="submit"
          disabled={submitting}
          className="h-12 w-full rounded-xl bg-brand-navy text-sm font-semibold text-white hover:bg-brand-navy-dark"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              A criar empresa…
            </>
          ) : (
            <>
              Criar empresa e continuar
              <ArrowRight size={16} />
            </>
          )}
        </Button>
      )}
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Logotipo — campo de ficheiro com pré-visualização e erro inline     */
/* ------------------------------------------------------------------ */

interface LogoFieldProps {
  file: File | null;
  error?: string;
  disabled: boolean;
  valid: boolean;
  onChange: (file: File | null) => void;
}

/**
 * O `<input type="file">` fica visualmente escondido (`sr-only`) e é accionado
 * por um `<label htmlFor>` — mantém o campo acessível por teclado, sem depender
 * de `ref` em componentes funcionais.
 */
function LogoField({ file, error, disabled, valid, onChange }: LogoFieldProps) {
  const previewUrl = useMemo(() => {
    // SVG e PDF não têm pré-visualização fiável em <img>.
    if (!file || !file.type.startsWith("image/") || file.type === "image/svg+xml") return null;
    return URL.createObjectURL(file);
  }, [file]);

  // Liberta o objectURL quando o ficheiro muda ou o componente é desmontado.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.files?.[0] ?? null);
    // Permite voltar a escolher o mesmo ficheiro depois de o remover.
    event.target.value = "";
  };

  const hasError = Boolean(error);

  return (
    <div>
      <Label htmlFor="logo" className="text-sm font-medium text-foreground">
        Logotipo da empresa
      </Label>

      <div
        className={cn(
          "mt-1.5 flex flex-wrap items-center gap-3 rounded-xl border border-dashed p-3 transition-colors duration-200",
          hasError && "border-destructive bg-destructive/5",
          !hasError && valid && "border-brand-green bg-brand-green/5",
          !hasError && !valid && "border-border bg-background",
        )}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Pré-visualização do logotipo"
            className="h-12 w-12 rounded-lg border border-border bg-white object-contain p-1"
          />
        ) : (
          <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            {file ? <FileText size={20} /> : <Upload size={20} />}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {file ? file.name : "Sem ficheiro selecionado"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {file
              ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
              : `PDF, JPG, PNG, GIF, SVG ou WEBP · até ${LOGO_MAX_LABEL} · opcional`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="logo"
            className={cn(
              "inline-flex h-8 cursor-pointer items-center rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent",
              disabled && "pointer-events-none opacity-50",
            )}
          >
            {file ? "Substituir" : "Escolher ficheiro"}
          </label>

          {file ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={() => onChange(null)}
              aria-label="Remover logotipo"
              className="rounded-lg text-muted-foreground"
            >
              <X size={15} />
            </Button>
          ) : null}
        </div>

        <Input
          id="logo"
          name="logo"
          type="file"
          accept={LOGO_ACCEPT_ATTRIBUTE}
          disabled={disabled}
          className="sr-only"
          onChange={handleFile}
        />
      </div>

      {hasError ? (
        <FieldError id="logo-error" message={String(error)} />
      ) : (
        <p className="mt-1.5 text-xs text-muted-foreground">
          O logotipo é usado nas faturas e pode ser alterado mais tarde.
        </p>
      )}
    </div>
  );
}
