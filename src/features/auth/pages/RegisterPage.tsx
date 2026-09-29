import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Building2 } from "lucide-react";

import { FormAlert } from "../../../components/forms/FormAlert";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";
import { AdminUserStepForm } from "../components/AdminUserStepForm";
import { CompanyStepForm } from "../components/CompanyStepForm";
import { RegisterStepper } from "../components/RegisterStepper";
import { RegisterSuccess } from "../components/RegisterSuccess";
import { useRegisterForm } from "../hooks/useRegisterForm";
import { resolvePlanLabel } from "../utils/registerValidation";

/** Tempo (ms) antes do redireccionamento automático para o login. */
const REDIRECT_DELAY_MS = 5000;

/**
 * Página pública de registo (`/registar`) — cadastro da empresa seguido do
 * utilizador administrador.
 *
 * ⚠️ Nenhum pedido HTTP é feito aqui: a comunicação vive exclusivamente em
 * `features/auth/services/registerService.ts` (via `src/lib/api.ts`).
 */
export function RegisterPage() {
  useDocumentTitle("Criar conta");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Plano escolhido na Landing Page (`/registar?plano=profissional`).
  const planParam = searchParams.get("plano");
  const planLabel = planParam ? resolvePlanLabel(planParam) : null;

  const {
    step,
    companyValues,
    companyErrors,
    companyLocked,
    pendingStep,
    submitting,
    succeeded,
    globalError,
    userValues,
    userErrors,
    setCompanyValue,
    handleCompanyBlur,
    isCompanyFieldValid,
    submitCompany,
    setUserValue,
    handleUserBlur,
    isUserFieldValid,
    submitAdminUser,
    goToCompanyStep,
    goToUserStep,
    setGlobalError,
  } = useRegisterForm();

  // Depois do sucesso, encaminha para o login (o botão da confirmação antecipa-o).
  useEffect(() => {
    if (!succeeded) return;
    const timer = window.setTimeout(() => navigate("/login", { replace: true }), REDIRECT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [succeeded, navigate]);

  const redirectInSeconds = Math.round(REDIRECT_DELAY_MS / 1000);
  const companyName = companyValues.companyName.trim();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-10 sm:px-6 sm:py-14">
        <Link to="/" className="flex items-center" aria-label="Voltar à página inicial">
          <img
            src="/logo_with_name.png"
            alt="Fatura Mais"
            className="h-14 w-auto object-contain"
          />
        </Link>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Sistema de faturação eletrónica para Angola · Certificado pela AGT
        </p>

        <div className="mt-8 w-full rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow duration-200 sm:p-9">
          {succeeded ? (
            <RegisterSuccess
              companyName={companyName}
              email={userValues.email.trim()}
              planLabel={planLabel}
              redirectInSeconds={redirectInSeconds}
            />
          ) : (
            <>
              <RegisterStepper currentStep={step} companyStepComplete={companyLocked} />

              <h1
                className="mt-7 text-2xl font-bold text-foreground"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {step === 1 ? "Criar conta da empresa" : "Utilizador administrador"}
              </h1>

              <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Building2 size={15} className="text-brand-teal" aria-hidden="true" />
                {step === 1
                  ? "Passo 1 de 2 · dados fiscais e de contacto"
                  : `Passo 2 de 2 · ${companyName || "empresa"}`}
                {planLabel ? (
                  <>
                    · Plano <strong className="text-foreground">{planLabel}</strong>
                  </>
                ) : null}
              </p>

              {globalError ? (
                <div className="mt-5">
                  <FormAlert
                    variant={globalError.variant}
                    title={globalError.title}
                    message={globalError.message}
                    onDismiss={() => setGlobalError(null)}
                  />
                </div>
              ) : null}

              <div className="mt-6">
                {step === 1 ? (
                  <CompanyStepForm
                    values={companyValues}
                    errors={companyErrors}
                    submitting={pendingStep === 1}
                    locked={companyLocked}
                    onSubmit={(event) => {
                      void submitCompany(event);
                    }}
                    onContinue={goToUserStep}
                    onChange={setCompanyValue}
                    onBlur={handleCompanyBlur}
                    isValid={isCompanyFieldValid}
                  />
                ) : (
                  <AdminUserStepForm
                    values={userValues}
                    errors={userErrors}
                    companyName={companyName}
                    submitting={pendingStep === 2}
                    onSubmit={(event) => {
                      void submitAdminUser(event);
                    }}
                    onBack={goToCompanyStep}
                    onChange={setUserValue}
                    onBlur={handleUserBlur}
                    isValid={isUserFieldValid}
                  />
                )}
              </div>

              {submitting ? (
                <p className="mt-4 text-center text-xs text-muted-foreground" role="status">
                  A comunicar com o servidor. Não feche esta página.
                </p>
              ) : null}
            </>
          )}
        </div>

        {succeeded ? null : (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link to="/login" className="font-semibold text-brand-navy hover:underline">
              Entrar
            </Link>
          </p>
        )}

        <p className="mt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} CHILEMBO TECHNOLOGY · Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}
