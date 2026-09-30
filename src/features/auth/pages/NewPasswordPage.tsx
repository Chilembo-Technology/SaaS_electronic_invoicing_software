import { useEffect, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router";

import { FormAlert } from "../../../components/forms/FormAlert";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";
import { AuthShell } from "../components/AuthShell";
import { NewPasswordForm } from "../components/NewPasswordForm";
import { useNewPassword } from "../hooks/useNewPassword";
import { isPendingPasswordReset } from "../utils/passwordResetValidation";

/**
 * Ecrã 3 da recuperação de palavra-passe (`/recuperar-senha/nova-senha`).
 *
 * Recebe o email pelo `state` do React Router e altera a senha em
 * `POST /v1/users/new-password` (`useNewPassword`). Em caso de sucesso, mostra o
 * toast e volta ao login — a sessão NÃO é aberta automaticamente.
 *
 * Chegar aqui sem pedido em curso (link directo, refresh) devolve o utilizador
 * ao ecrã 1.
 */
export function NewPasswordPage() {
  useDocumentTitle("Nova palavra-passe");

  const navigate = useNavigate();
  const location = useLocation();

  const pending = isPendingPasswordReset(location.state) ? location.state : null;
  const email = pending?.email ?? "";

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
  } = useNewPassword(email);

  useEffect(() => {
    if (!pending) {
      navigate("/recuperar-senha", { replace: true });
    }
  }, [pending, navigate]);

  /** Altera a senha e, em caso de sucesso, volta ao login. */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    const changed = await submit(event);
    if (!changed) return;

    // `replace` para o botão "voltar" não regressar ao formulário já usado.
    navigate("/login", { replace: true });
  };

  return (
    <AuthShell
      title="Nova palavra-passe"
      subtitle={
        email
          ? `Defina a nova senha para ${email}`
          : "Defina a nova palavra-passe da sua conta"
      }
    >
      {globalError ? (
        <FormAlert
          variant={globalError.variant}
          title={globalError.title}
          message={globalError.message}
          onDismiss={() => setGlobalError(null)}
        />
      ) : null}

      <NewPasswordForm
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
