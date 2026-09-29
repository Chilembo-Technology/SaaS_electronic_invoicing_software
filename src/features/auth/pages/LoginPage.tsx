import { useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router";

import { FormAlert } from "../../../components/forms/FormAlert";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";
import { useAuth } from "../../../contexts/AuthContext";
import { AuthShell } from "../components/AuthShell";
import { LoginForm } from "../components/LoginForm";
import { useLoginForm } from "../hooks/useLoginForm";

/**
 * Página pública de entrada (`/login`) — passo 1: credenciais.
 *
 * ⚠️ O backend (`auth_service`) NUNCA devolve token no `/login`: o pedido cria e
 * envia um código OTP por email. Um pedido bem-sucedido encaminha para
 * `/login/verify-otp`, onde a sessão (JWT) é criada.
 *
 * Nenhum pedido HTTP é feito aqui: a comunicação vive exclusivamente em
 * `features/auth/services/loginService.ts` (via `src/lib/api.ts`).
 */
export function LoginPage() {
  useDocumentTitle("Entrar");

  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

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
  } = useLoginForm();

  // Sessão já válida (token guardado no localStorage): não faz sentido re-entrar.
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  /** Submete as credenciais e, em caso de sucesso, segue para a validação do OTP. */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    const requested = await submit(event);
    if (requested) {
      navigate("/login/verify-otp");
    }
  };

  return (
    <AuthShell
      title="Entrar na sua conta"
      subtitle="Sistema de faturação eletrónica para Angola · Certificado pela AGT"
    >
      {globalError ? (
        <FormAlert
          variant={globalError.variant}
          title={globalError.title}
          message={globalError.message}
          onDismiss={() => setGlobalError(null)}
        />
      ) : null}

      <LoginForm
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
