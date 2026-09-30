import { useEffect, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router";
import { ArrowLeft, Loader2, RefreshCw, ShieldCheck } from "lucide-react";

import { Button } from "../../../app/components/ui/button";
import { FormAlert } from "../../../components/forms/FormAlert";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";
import { AuthShell } from "../components/AuthShell";
import { OtpInput } from "../components/OtpInput";
import { useResetOtp } from "../hooks/useResetOtp";
import { OTP_LENGTH } from "../utils/loginValidation";
import { isPendingPasswordReset } from "../utils/passwordResetValidation";

/**
 * O `expires_at` vem do Laravel como `Y-m-d H:i:s` (sem fuso) — mostramos só as
 * horas. Mesmo formato do passo 2 do login (`VerifyOtpPage`).
 */
function formatExpiry(expiresAt: string | null): string | null {
  if (!expiresAt) return null;

  const parsed = new Date(expiresAt.replace(" ", "T"));
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
}

/**
 * Ecrã 2 da recuperação de palavra-passe
 * (`/recuperar-senha/verificar-codigo`): valida o código OTP recebido.
 *
 * O `email` chega pelo `state` do React Router (`PendingPasswordReset`) e volta a
 * ser exigido pelo backend (`AuthVerifyOTPRequest`). Chegar aqui sem pedido em
 * curso (link directo, refresh) devolve o utilizador ao ecrã 1.
 *
 * ⚠️ O `/v1/auth/verify-otp` é a MESMA rota do login e devolve um JWT: aqui ele
 * é descartado pelo `passwordResetService` — validar o código não pode abrir
 * sessão a meio de um reset.
 *
 * "Reenviar código" usa `POST /v1/users/recuver-password` (o mesmo endpoint do
 * ecrã 1), que só precisa do email.
 */
export function ResetOtpPage() {
  useDocumentTitle("Verificar código");

  const navigate = useNavigate();
  const location = useLocation();

  const pending = isPendingPasswordReset(location.state) ? location.state : null;

  const {
    values,
    errors,
    submitting,
    resending,
    canSubmit,
    canResend,
    resendCooldown,
    expiresAt,
    globalError,
    setCode,
    handleBlur,
    isCodeValid,
    submit,
    resend,
    setGlobalError,
  } = useResetOtp(pending);

  // Sem pedido de recuperação em curso não há email para validar: volta ao ecrã 1.
  useEffect(() => {
    if (!pending) {
      navigate("/recuperar-senha", { replace: true });
    }
  }, [pending, navigate]);

  /** Valida o código e segue para a definição da nova senha. */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    const accepted = await submit(event);
    if (!accepted || !pending) return;

    // O token devolvido pelo backend NÃO é guardado: só o email segue para o ecrã 3.
    navigate("/recuperar-senha/nova-senha", {
      state: { email: pending.email, expiresAt },
    });
  };

  const expiry = formatExpiry(expiresAt);

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
            "Verificar código"
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
            onClick={() => navigate("/recuperar-senha")}
            disabled={submitting || resending}
            className="h-11 flex-1 rounded-xl font-semibold text-muted-foreground"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Voltar
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
