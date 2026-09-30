import { useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../../../app/components/ui/button";
import { FormAlert } from "../../../components/forms/FormAlert";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";
import { useAuth } from "../../../contexts/AuthContext";
import { AuthShell } from "../components/AuthShell";
import { OtpInput } from "../components/OtpInput";
import { useVerifyOtp } from "../hooks/useVerifyOtp";
import { OTP_LENGTH } from "../utils/loginValidation";

/** O `expires_at` vem do Laravel como `Y-m-d H:i:s` (sem fuso) — mostramos só as horas. */
function formatExpiry(expiresAt: string | null): string | null {
  if (!expiresAt) return null;

  const parsed = new Date(expiresAt.replace(" ", "T"));
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
}

/**
 * Página pública de entrada (`/login/verify-otp`) — passo 2: validação do código.
 *
 * Recebe o `email` do passo anterior (`utils/otpSession.ts`), valida o código em
 * `POST /v1/auth/verify-otp` e, com o token devolvido, grava a sessão no
 * `AuthContext` antes de seguir para o painel.
 *
 * O "Reenviar código" usa `POST /v1/otp/generate` (via `otpService`) e só precisa
 * do email — as credenciais do passo 1 deixaram de ser necessárias para reenviar.
 */
export function VerifyOtpPage() {
  useDocumentTitle("Verificação OTP");

  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    pending,
    values,
    errors,
    submitting,
    resending,
    canSubmit,
    canResend,
    resendCooldown,
    globalError,
    setCode,
    handleBlur,
    isCodeValid,
    submit,
    resend,
    setGlobalError,
  } = useVerifyOtp();

  // Sem pedido de OTP em curso (link aberto directamente, aba recarregada muito
  // tempo depois, etc.) não há email para validar: volta-se ao passo 1.
  useEffect(() => {
    if (!pending) {
      navigate("/login", { replace: true });
    }
  }, [pending, navigate]);

  /** Valida o código e cria a sessão autenticada. */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const session = await submit(event);
    if (!session) return;

    login(session.token, session.user);
    toast.success("Sessão iniciada", {
      description: `Bem-vindo(a), ${session.user.name}.`,
    });
    navigate("/dashboard", { replace: true });
  };

  const expiry = formatExpiry(pending?.expiresAt ?? null);

  return (
    <AuthShell
      title="Verificação em dois passos"
      subtitle="Introduza o código que enviámos para o seu email"
      contentClassName="max-w-lg"
    >
      {globalError ? (
        <FormAlert
          variant={globalError.variant}
          title={globalError.title}
          message={globalError.message}
          onDismiss={() => setGlobalError(null)}
        />
      ) : null}

      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-5" noValidate>
        <div className="flex items-start gap-3 rounded-xl border border-brand-navy/15 bg-brand-navy/5 p-4">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-brand-navy" aria-hidden="true" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Enviámos um código de <strong className="text-foreground">{OTP_LENGTH} dígitos</strong>{" "}
            para <strong className="text-foreground">{pending?.email ?? "o seu email"}</strong>. Se
            não o encontrar, verifique a pasta de spam.
          </p>
        </div>

        <OtpInput
          id="code"
          label="Código de verificação"
          value={values.code}
          onChange={setCode}
          onBlur={handleBlur}
          error={errors.code}
          showValid={isCodeValid()}
          disabled={submitting || resending}
          autoFocus
          hint={
            expiry
              ? `O código é válido até às ${expiry}.`
              : "Introduza os dígitos exactamente como aparecem no email."
          }
        />

        <Button
          type="submit"
          disabled={submitting || resending || !canSubmit}
          className="h-12 w-full rounded-xl bg-brand-navy text-sm font-semibold text-white hover:bg-brand-navy-dark"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              A validar…
            </>
          ) : (
            "Validar código"
          )}
        </Button>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => void resend()}
            disabled={submitting || resending || !canResend}
            className="h-11 flex-1 rounded-xl font-semibold"
          >
            {resending ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                A reenviar…
              </>
            ) : resendCooldown > 0 ? (
              // Cooldown do reenvio: o botão reabre sozinho no fim da contagem.
              `Reenviar em ${resendCooldown}s`
            ) : (
              <>
                <RefreshCw size={16} aria-hidden="true" />
                Reenviar código
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/login")}
            disabled={submitting || resending}
            className="h-11 flex-1 rounded-xl font-semibold text-muted-foreground"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Voltar ao login
          </Button>
        </div>

        {resendCooldown > 0 ? (
          <p className="text-center text-xs text-muted-foreground">
            Pode pedir um novo código dentro de {resendCooldown}{" "}
            {resendCooldown === 1 ? "segundo" : "segundos"}.
          </p>
        ) : null}
      </form>

      <p className="text-center text-xs text-muted-foreground">
        O código expira em 15 minutos. Nunca partilhe este código com terceiros.
      </p>
    </AuthShell>
  );
}
