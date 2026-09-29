import type { FormEvent } from "react";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";

import { Button } from "../../../app/components/ui/button";
import { Checkbox } from "../../../app/components/ui/checkbox";
import { Label } from "../../../app/components/ui/label";
import { FieldError } from "../../../components/forms/FieldError";
import { FormField } from "../../../components/forms/FormField";
import type { AdminUserFieldErrors, AdminUserFormValues } from "../types/register";
import {
  COMPANY_PASSWORD_MIN,
  sanitizeAngolanPhone,
  sanitizeBiNumber,
} from "../utils/registerValidation";

/** Props do passo 2 — todo o estado vem de `useRegisterForm` (sem HTTP aqui). */
export interface AdminUserStepFormProps {
  values: AdminUserFormValues;
  errors: AdminUserFieldErrors;
  /** Nome da empresa já criada — usado no texto de contexto. */
  companyName: string;
  /** Pedido HTTP em curso: botão desactivado e campos "a validar…". */
  submitting: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
  onChange: <K extends keyof AdminUserFormValues>(field: K, value: AdminUserFormValues[K]) => void;
  onBlur: (field: keyof AdminUserFormValues) => void;
  isValid: (field: keyof AdminUserFormValues) => boolean;
}

/**
 * Passo 2 do registo: utilizador administrador da empresa (`POST /v1/users`),
 * associado pelo `company_id` devolvido no passo 1.
 * As regras espelham `StoreUserRequest` do auth_service.
 */
export function AdminUserStepForm({
  values,
  errors,
  companyName,
  submitting,
  onSubmit,
  onBack,
  onChange,
  onBlur,
  isValid,
}: AdminUserStepFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="flex items-start gap-3 rounded-xl border border-brand-navy/15 bg-brand-navy/5 p-4">
        <ShieldCheck size={18} className="mt-0.5 shrink-0 text-brand-navy" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Este utilizador fica como <strong className="text-foreground">Administrator</strong> de{" "}
          <strong className="text-foreground">{companyName || "empresa registada"}</strong>, com
          acesso a faturação, utilizadores e configurações.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id="firstName"
          label="Nome"
          value={values.firstName}
          required
          disabled={submitting}
          autoComplete="given-name"
          placeholder="Nome próprio"
          error={errors.firstName}
          showValid={isValid("firstName")}
          validating={submitting}
          onChange={(value) => onChange("firstName", value)}
          onBlur={() => onBlur("firstName")}
        />

        <FormField
          id="lastName"
          label="Sobrenome"
          value={values.lastName}
          required
          disabled={submitting}
          autoComplete="family-name"
          placeholder="Apelido"
          error={errors.lastName}
          showValid={isValid("lastName")}
          validating={submitting}
          onChange={(value) => onChange("lastName", value)}
          onBlur={() => onBlur("lastName")}
        />

        <FormField
          id="email"
          label="Email de acesso"
          type="email"
          value={values.email}
          required
          disabled={submitting}
          autoComplete="email"
          placeholder="nome@empresa.ao"
          error={errors.email}
          showValid={isValid("email")}
          hint="Usado para entrar no painel e recuperar a senha."
          validating={submitting}
          onChange={(value) => onChange("email", value)}
          onBlur={() => onBlur("email")}
        />

        <FormField
          id="phoneNumber"
          label="Telefone"
          type="tel"
          inputMode="tel"
          value={values.phoneNumber}
          required
          disabled={submitting}
          autoComplete="tel"
          placeholder="923 000 000"
          error={errors.phoneNumber}
          showValid={isValid("phoneNumber")}
          hint="Começa por 90, 91, 92, 93, 94, 95, 96, 97 ou 99."
          validating={submitting}
          onChange={(value) => onChange("phoneNumber", sanitizeAngolanPhone(value))}
          onBlur={() => onBlur("phoneNumber")}
        />

        <FormField
          id="biNumber"
          label="Número de BI"
          value={values.biNumber}
          required
          disabled={submitting}
          autoComplete="off"
          placeholder="000000000LA000"
          error={errors.biNumber}
          showValid={isValid("biNumber")}
          hint="9 dígitos + 2 letras maiúsculas + 3 dígitos."
          validating={submitting}
          onChange={(value) => onChange("biNumber", sanitizeBiNumber(value))}
          onBlur={() => onBlur("biNumber")}
        />

        <FormField
          id="password"
          label="Senha"
          type="password"
          value={values.password}
          required
          disabled={submitting}
          autoComplete="new-password"
          placeholder={`Mínimo ${COMPANY_PASSWORD_MIN} caracteres`}
          error={errors.password}
          showValid={isValid("password")}
          validating={submitting}
          onChange={(value) => onChange("password", value)}
          onBlur={() => onBlur("password")}
        />

        <FormField
          id="confirmPassword"
          label="Confirmar senha"
          type="password"
          value={values.confirmPassword}
          required
          disabled={submitting}
          autoComplete="new-password"
          placeholder="Repita a senha"
          error={errors.confirmPassword}
          showValid={isValid("confirmPassword")}
          validating={submitting}
          onChange={(value) => onChange("confirmPassword", value)}
          onBlur={() => onBlur("confirmPassword")}
        />
      </div>

      <div>
        <div className="flex items-start gap-3">
          <Checkbox
            id="acceptTerms"
            name="acceptTerms"
            checked={values.acceptTerms}
            disabled={submitting}
            aria-invalid={Boolean(errors.acceptTerms)}
            aria-describedby={errors.acceptTerms ? "acceptTerms-error" : undefined}
            className="mt-0.5"
            onCheckedChange={(checked) => onChange("acceptTerms", checked === true)}
          />
          <Label
            htmlFor="acceptTerms"
            className="text-sm font-normal leading-relaxed text-muted-foreground"
          >
            Confirmo que os dados introduzidos estão correctos e que aceito os Termos e Condições e
            a Política de Privacidade.
          </Label>
        </div>
        {errors.acceptTerms ? (
          <FieldError id="acceptTerms-error" message={errors.acceptTerms} />
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={submitting}
          className="h-12 rounded-xl font-semibold sm:w-40"
        >
          <ArrowLeft size={16} />
          Voltar
        </Button>

        <Button
          type="submit"
          disabled={submitting}
          className="h-12 flex-1 rounded-xl bg-brand-navy text-sm font-semibold text-white hover:bg-brand-navy-dark"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              A criar conta…
            </>
          ) : (
            "Criar conta"
          )}
        </Button>
      </div>
    </form>
  );
}
