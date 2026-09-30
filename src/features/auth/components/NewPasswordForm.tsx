import type { FormEvent } from "react";
import { Loader2, ShieldCheck } from "lucide-react";

import { Button } from "../../../app/components/ui/button";
import { FormField } from "../../../components/forms/FormField";
import type {
  NewPasswordFieldErrors,
  NewPasswordFormValues,
} from "../types/passwordReset";
import { COMPANY_PASSWORD_MIN } from "../utils/registerValidation";

/** Props do ecrã 3 — todo o estado vem de `useNewPassword` (sem HTTP aqui). */
export interface NewPasswordFormProps {
  values: NewPasswordFormValues;
  errors: NewPasswordFieldErrors;
  /** Pedido HTTP em curso: botão desactivado e campos "a validar…". */
  submitting: boolean;
  /** Só campos vazios bloqueiam o submit (ver `useNewPassword`). */
  canSubmit: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onChange: <K extends keyof NewPasswordFormValues>(
    field: K,
    value: NewPasswordFormValues[K],
  ) => void;
  onBlur: (field: keyof NewPasswordFormValues) => void;
  /** Borda/ícone verde: só depois do blur, sem erro e com valor preenchido. */
  isValid: (field: keyof NewPasswordFormValues) => boolean;
}

/**
 * Ecrã 3 da recuperação de palavra-passe: nova senha.
 *
 * ⚠️ Só `password` é enviado ao backend — e com o nome `new_password`
 * (`NewPasswordUserRequest`). O campo `confirmPassword` é uma verificação
 * EXCLUSIVA do cliente: o backend não tem a regra `confirmed`.
 *
 * O toggle mostrar/ocultar vem do próprio `FormField` (`type="password"`).
 */
export function NewPasswordForm({
  values,
  errors,
  submitting,
  canSubmit,
  onSubmit,
  onChange,
  onBlur,
  isValid,
}: NewPasswordFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <FormField
        id="password"
        label="Nova senha"
        type="password"
        value={values.password}
        required
        disabled={submitting}
        autoComplete="new-password"
        placeholder="A sua nova senha"
        hint={`Pelo menos ${COMPANY_PASSWORD_MIN} caracteres.`}
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
        placeholder="Repita a nova senha"
        error={errors.confirmPassword}
        showValid={isValid("confirmPassword")}
        validating={submitting}
        onChange={(value) => onChange("confirmPassword", value)}
        onBlur={() => onBlur("confirmPassword")}
      />

      <p className="flex items-start gap-2 rounded-xl border border-brand-navy/15 bg-brand-navy/5 p-3 text-xs leading-relaxed text-muted-foreground">
        <ShieldCheck size={15} className="mt-px shrink-0 text-brand-navy" aria-hidden="true" />
        Depois de alterar a senha, será encaminhado para o login — por segurança, a sessão não é
        aberta automaticamente.
      </p>

      <Button
        type="submit"
        disabled={submitting || !canSubmit}
        className="h-12 w-full rounded-xl bg-brand-navy text-sm font-semibold text-white hover:bg-brand-navy-dark"
      >
        {submitting ? (
          <>
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            A alterar…
          </>
        ) : (
          "Alterar palavra-passe"
        )}
      </Button>
    </form>
  );
}
