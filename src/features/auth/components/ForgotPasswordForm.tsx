import type { FormEvent } from "react";
import { Link } from "react-router";
import { Loader2, Mail, ShieldCheck } from "lucide-react";

import { Button } from "../../../app/components/ui/button";
import { FormField } from "../../../components/forms/FormField";
import type {
  ForgotPasswordFieldErrors,
  ForgotPasswordFormValues,
} from "../types/passwordReset";
import { OTP_LENGTH } from "../utils/loginValidation";

/** Props do ecrã 1 — todo o estado vem de `useForgotPassword` (sem HTTP aqui). */
export interface ForgotPasswordFormProps {
  values: ForgotPasswordFormValues;
  errors: ForgotPasswordFieldErrors;
  /** Pedido HTTP em curso: botão desactivado e campos "a validar…". */
  submitting: boolean;
  /** Só o campo vazio bloqueia o submit (ver `useForgotPassword`). */
  canSubmit: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onChange: <K extends keyof ForgotPasswordFormValues>(
    field: K,
    value: ForgotPasswordFormValues[K],
  ) => void;
  onBlur: (field: keyof ForgotPasswordFormValues) => void;
  /** Borda/ícone verde: só depois do blur, sem erro e com valor preenchido. */
  isValid: (field: keyof ForgotPasswordFormValues) => boolean;
}

/**
 * Ecrã 1 da recuperação de palavra-passe: email que recebe o código
 * (`POST /v1/users/recuver-password`). Só `email` é validado
 * (`UserEmailRequest`) — não há password neste passo.
 *
 * ⚠️ O texto fala de um CÓDIGO de {OTP_LENGTH} dígitos (e não de um "link de
 * recuperação"): é isso que o backend envia.
 */
export function ForgotPasswordForm({
  values,
  errors,
  submitting,
  canSubmit,
  onSubmit,
  onChange,
  onBlur,
  isValid,
}: ForgotPasswordFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <FormField
        id="email"
        label="Email"
        type="email"
        value={values.email}
        required
        disabled={submitting}
        autoComplete="email"
        placeholder="o.seu@email.ao"
        error={errors.email}
        showValid={isValid("email")}
        validating={submitting}
        onChange={(value) => onChange("email", value)}
        onBlur={() => onBlur("email")}
      />

      <p className="flex items-start gap-2 rounded-xl border border-brand-navy/15 bg-brand-navy/5 p-3 text-xs leading-relaxed text-muted-foreground">
        <ShieldCheck size={15} className="mt-px shrink-0 text-brand-navy" aria-hidden="true" />
        Vamos enviar um código de verificação de {OTP_LENGTH} dígitos para este email. O código é
        válido durante 15 minutos.
      </p>

      <Button
        type="submit"
        disabled={submitting || !canSubmit}
        className="h-12 w-full rounded-xl bg-brand-navy text-sm font-semibold text-white hover:bg-brand-navy-dark"
      >
        {submitting ? (
          <>
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            A enviar…
          </>
        ) : (
          <>
            <Mail size={16} aria-hidden="true" />
            Enviar código
          </>
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Lembrou-se da senha?{" "}
        <Link to="/login" className="font-semibold text-brand-navy hover:underline">
          Voltar ao login
        </Link>
      </p>
    </form>
  );
}
