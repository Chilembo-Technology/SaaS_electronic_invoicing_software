import type { FormEvent } from "react";
import { useNavigate } from "react-router";

import { FormAlert } from "../../../components/forms/FormAlert";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";
import { AuthShell } from "../components/AuthShell";
import { ForgotPasswordForm } from "../components/ForgotPasswordForm";
import { useForgotPassword } from "../hooks/useForgotPassword";

/**
 * Ecrã 1 da recuperação de palavra-passe (`/recuperar-senha`).
 *
 * Pede o email e envia o código OTP de recuperação
 * (`POST /v1/users/recuver-password`, via `useForgotPassword`). Com sucesso,
 * segue para `/recuperar-senha/verificar-codigo` levando o email no `state` do
 * React Router (nunca em disco); um refresh nesse ecrã devolve o utilizador a
 * este passo — o que é aceitável em segurança.
 *
 * Nenhum pedido HTTP é feito aqui: a comunicação vive em
 * `features/auth/services/passwordResetService.ts` (via `src/lib/api.ts`).
 */
export function ForgotPasswordPage() {
  useDocumentTitle("Recuperar palavra-passe");

  const navigate = useNavigate();

  const {
    values,
    errors,
    submitting,
    canSubmit,
    globalError,
    setValue,
    handleBlur,
    isFieldValid,
    submit,
    setGlobalError,
  } = useForgotPassword();

  /** Pede o código e, em caso de sucesso, segue para a validação do OTP. */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    const pending = await submit(event);
    if (!pending) return;

    navigate("/recuperar-senha/verificar-codigo", { state: pending });
  };

  return (
    <AuthShell
      title="Recuperar palavra-passe"
      subtitle="Indique o email da sua conta e enviámos-lhe um código de verificação"
    >
      {globalError ? (
        <FormAlert
          variant={globalError.variant}
          title={globalError.title}
          message={globalError.message}
          onDismiss={() => setGlobalError(null)}
        />
      ) : null}

      <ForgotPasswordForm
        values={values}
        errors={errors}
        submitting={submitting}
        canSubmit={canSubmit}
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
        onChange={setValue}
        onBlur={handleBlur}
        isValid={isFieldValid}
      />
    </AuthShell>
  );
}
