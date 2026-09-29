import type { FormEvent } from "react";
import { Link } from "react-router";
import { Loader2, LogIn, Mail } from "lucide-react";

import { Button } from "../../../app/components/ui/button";
import { FormField } from "../../../components/forms/FormField";
import type { LoginFieldErrors, LoginFormValues } from "../types/login";

/** Props do passo 1 — todo o estado vem de `useLoginForm` (sem HTTP aqui). */
export interface LoginFormProps {
  values: LoginFormValues;
  errors: LoginFieldErrors;
  /** Pedido HTTP em curso: botão desactivado e campos "a validar…". */
  submitting: boolean;
  /** Só campos vazios bloqueiam o submit (ver `useLoginForm`). */
  canSubmit: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onChange: <K extends keyof LoginFormValues>(field: K, value: LoginFormValues[K]) => void;
  onBlur: (field: keyof LoginFormValues) => void;
  /** Borda/ícone verde: só depois do blur, sem erro e com valor preenchido. */
  isValid: (field: keyof LoginFormValues) => boolean;
}

/**
 * Passo 1 do login: credenciais que geram o pedido de OTP
 * (`POST /v1/auth/login`). As regras espelham `AuthLoginRequest` do auth_service
 * — no login a password só é obrigatória, sem comprimento mínimo.
 */
export function LoginForm({
  values,
  errors,
  submitting,
  canSubmit,
  onSubmit,
  onChange,
  onBlur,
  isValid,
}: LoginFormProps) {
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

      <div>
        <FormField
          id="password"
          label="Senha"
          type="password"
          value={values.password}
          required
          disabled={submitting}
          autoComplete="current-password"
          placeholder="A sua senha"
          error={errors.password}
          showValid={isValid("password")}
          validating={submitting}
          onChange={(value) => onChange("password", value)}
          onBlur={() => onBlur("password")}
        />

        <div className="mt-1.5 text-right">
          <Link
            to="/recuperar-senha"
            className="text-xs font-medium text-brand-navy hover:underline"
          >
            Esqueci-me da senha
          </Link>
        </div>
      </div>

      <p className="flex items-start gap-2 rounded-xl border border-brand-navy/15 bg-brand-navy/5 p-3 text-xs leading-relaxed text-muted-foreground">
        <Mail size={15} className="mt-px shrink-0 text-brand-navy" aria-hidden="true" />
        Por segurança, vamos enviar um código de verificação de 9 dígitos para o seu email. O código
        é válido durante 15 minutos.
      </p>

      <Button
        type="submit"
        disabled={submitting || !canSubmit}
        className="h-12 w-full rounded-xl bg-brand-navy text-sm font-semibold text-white hover:bg-brand-navy-dark"
      >
        {submitting ? (
          <>
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            A verificar…
          </>
        ) : (
          <>
            <LogIn size={16} aria-hidden="true" />
            Entrar
          </>
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Ainda não tem conta?{" "}
        <Link to="/registar" className="font-semibold text-brand-navy hover:underline">
          Criar conta
        </Link>
      </p>
    </form>
  );
}
