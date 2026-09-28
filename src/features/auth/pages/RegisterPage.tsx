import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { AlertCircle, ArrowRight, Building2, Check, ShieldCheck } from "lucide-react";

import { Button } from "../../../app/components/ui/button";
import { Input } from "../../../app/components/ui/input";
import { Label } from "../../../app/components/ui/label";
import { cn } from "../../../app/components/ui/utils";
import {
  hasErrors,
  initialRegisterValues,
  resolvePlanLabel,
  validateRegisterForm,
  type RegisterFormErrors,
  type RegisterFormValues,
} from "../utils/registerValidation";

/**
 * Página pública de registo (`/registar`).
 *
 * ⚠️ Preparada para integração com a API: o `auth_service` ainda NÃO expõe um
 * endpoint de auto-registo, por isso o formulário valida os dados no cliente e
 * confirma o pedido localmente. Quando o endpoint existir, a chamada deve ser
 * feita a partir de um ficheiro em `src/features/auth/services/` (nunca aqui).
 */
export function RegisterPage() {
  const [searchParams] = useSearchParams();
  const [values, setValues] = useState<RegisterFormValues>({
    ...initialRegisterValues,
    plan: searchParams.get("plano") ?? initialRegisterValues.plan,
  });
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const selectedPlan = resolvePlanLabel(values.plan);

  const updateField = <K extends keyof RegisterFormValues>(
    field: K,
    value: RegisterFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateRegisterForm(values);
    setErrors(validationErrors);

    if (hasErrors(validationErrors)) {
      return;
    }

    // TODO(api): integrar com o endpoint de auto-registo do auth_service
    // (criar `src/features/auth/services/registerService.ts`) e remover a simulação.
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-12 sm:px-6">
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

        <div className="mt-8 w-full rounded-2xl border border-border bg-card p-7 shadow-sm sm:p-9">
          {submitted ? (
            <RegisterSuccess
              companyName={values.companyName}
              email={values.email}
              planLabel={selectedPlan}
            />
          ) : (
            <>
              <div className="flex items-start gap-3 rounded-xl border border-brand-navy/15 bg-brand-navy/5 p-4">
                <ShieldCheck size={18} className="mt-0.5 shrink-0 text-brand-navy" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Crie a conta da sua empresa no <strong>Fatura Mais</strong>. Cada empresa
                  recebe um ambiente isolado, com as suas próprias séries de documentos,
                  utilizadores e permissões.
                </p>
              </div>

              <h1
                className="mt-6 text-2xl font-bold text-foreground"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Criar conta
              </h1>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 size={15} className="text-brand-teal" />
                Plano selecionado:{" "}
                <strong className="text-foreground">{selectedPlan}</strong>
              </p>

              <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    id="companyName"
                    label="Nome da empresa"
                    value={values.companyName}
                    error={errors.companyName}
                    placeholder="Ex.: Kianda Logística, Lda"
                    onChange={(value) => updateField("companyName", value)}
                  />
                  <Field
                    id="nif"
                    label="NIF da empresa"
                    value={values.nif}
                    error={errors.nif}
                    placeholder="10 dígitos"
                    inputMode="numeric"
                    maxLength={10}
                    onChange={(value) => updateField("nif", value.replace(/\D/g, ""))}
                  />
                  <Field
                    id="fullName"
                    label="Nome do responsável"
                    value={values.fullName}
                    error={errors.fullName}
                    placeholder="Nome completo"
                    onChange={(value) => updateField("fullName", value)}
                  />
                  <Field
                    id="phone"
                    label="Telefone"
                    value={values.phone}
                    error={errors.phone}
                    placeholder="923 000 000"
                    inputMode="tel"
                    onChange={(value) => updateField("phone", value)}
                  />
                  <Field
                    id="email"
                    label="Email profissional"
                    value={values.email}
                    error={errors.email}
                    placeholder="nome@empresa.ao"
                    type="email"
                    onChange={(value) => updateField("email", value)}
                  />
                  <Field
                    id="password"
                    label="Senha"
                    value={values.password}
                    error={errors.password}
                    placeholder="Mínimo 8 caracteres"
                    type="password"
                    onChange={(value) => updateField("password", value)}
                  />
                  <Field
                    id="confirmPassword"
                    label="Confirmar senha"
                    value={values.confirmPassword}
                    error={errors.confirmPassword}
                    placeholder="Repita a senha"
                    type="password"
                    onChange={(value) => updateField("confirmPassword", value)}
                  />
                </div>

                <div>
                  <label className="flex items-start gap-3 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={values.acceptTerms}
                      onChange={(event) =>
                        updateField("acceptTerms", event.target.checked)
                      }
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-[var(--brand-navy)]"
                    />
                    <span>
                      Aceito os Termos e Condições e a Política de Privacidade do Fatura
                      Mais.
                    </span>
                  </label>
                  {errors.acceptTerms ? (
                    <ErrorText>{errors.acceptTerms}</ErrorText>
                  ) : null}
                </div>

                <Button
                  type="submit"
                  disabled={sending}
                  className="h-12 w-full rounded-xl bg-brand-navy text-sm font-semibold text-white hover:bg-brand-navy-dark"
                >
                  {sending ? "A enviar pedido…" : "Criar conta"}
                  {sending ? null : <ArrowRight size={16} />}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Já tem conta?{" "}
                <Link to="/login" className="font-semibold text-brand-navy hover:underline">
                  Entrar
                </Link>
              </p>
            </>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} CHILEMBO TECHNOLOGY · Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Subcomponentes de apoio — exclusivos desta página e intencionalmente */
/* mantidos no mesmo ficheiro por serem muito pequenos.                 */
/* ------------------------------------------------------------------ */

interface RegisterSuccessProps {
  companyName: string;
  email: string;
  planLabel: string;
}

function RegisterSuccess({ companyName, email, planLabel }: RegisterSuccessProps) {
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-green/15 text-brand-green">
        <Check size={26} strokeWidth={3} />
      </span>
      <h1
        className="mt-5 text-2xl font-bold text-foreground"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Pedido de registo recebido
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        Obrigado! A nossa equipa vai contactar{" "}
        <strong className="text-foreground">{email}</strong> em menos de 1 dia útil para
        ativar a conta de <strong className="text-foreground">{companyName}</strong> no
        plano <strong className="text-foreground">{planLabel}</strong>.
      </p>
      <p className="mt-4 rounded-xl bg-brand-navy/5 px-4 py-3 text-xs text-muted-foreground">
        Ambiente de demonstração: nenhum dado foi enviado para o servidor.
      </p>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <Button asChild variant="outline" className="h-11 rounded-xl font-semibold">
          <Link to="/">Voltar à página inicial</Link>
        </Button>
        <Button
          asChild
          className="h-11 rounded-xl bg-brand-navy font-semibold text-white hover:bg-brand-navy-dark"
        >
          <Link to="/login">
            Ir para o login
            <ArrowRight size={16} />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-destructive">
      <AlertCircle size={13} className="shrink-0" />
      {children}
    </p>
  );
}

interface FieldProps {
  id: string;
  label: string;
  value: string;
  error?: string;
  placeholder?: string;
  type?: string;
  inputMode?: "text" | "tel" | "numeric" | "email";
  maxLength?: number;
  onChange: (value: string) => void;
}

function Field({
  id,
  label,
  value,
  error,
  placeholder,
  type = "text",
  inputMode = "text",
  maxLength,
  onChange,
}: FieldProps) {
  return (
    <div>
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      <Input
        id={id}
        name={id}
        type={type}
        value={value}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "mt-1.5 h-11 rounded-xl bg-background",
          error && "border-destructive focus-visible:ring-destructive/30",
        )}
      />
      {error ? <ErrorText>{error}</ErrorText> : null}
    </div>
  );
}

