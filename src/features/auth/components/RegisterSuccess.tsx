import { ArrowRight, Check, LogIn } from "lucide-react";
import { Link } from "react-router";

import { Button } from "../../../app/components/ui/button";

interface RegisterSuccessProps {
  companyName: string;
  email: string;
  /** Plano escolhido na Landing Page (`?plano=`), quando aplicável. */
  planLabel?: string | null;
  /** Segundos até o redireccionamento automático para o login. */
  redirectInSeconds: number;
}

/**
 * Confirmação final do registo: resumo do que foi criado e encaminhamento para
 * o login (automático após alguns segundos, ou imediato pelo botão).
 */
export function RegisterSuccess({
  companyName,
  email,
  planLabel,
  redirectInSeconds,
}: RegisterSuccessProps) {
  return (
    <div className="flex flex-col items-center py-4 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-green/15 text-brand-green">
        <Check size={26} strokeWidth={3} />
      </span>

      <h1 className="mt-5 text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
        Conta criada com sucesso
      </h1>

      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        A empresa <strong className="text-foreground">{companyName}</strong> e o utilizador
        administrador <strong className="text-foreground">{email}</strong> foram registados.
        {planLabel ? (
          <>
            {" "}
            Plano escolhido: <strong className="text-foreground">{planLabel}</strong>.
          </>
        ) : null}
      </p>

      <p className="mt-4 rounded-xl bg-brand-navy/5 px-4 py-3 text-xs text-muted-foreground">
        A redirecionar para o login em {redirectInSeconds} segundos…
      </p>

      <div className="mt-7 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild variant="outline" className="h-11 rounded-xl font-semibold">
          <Link to="/">Voltar à página inicial</Link>
        </Button>
        <Button
          asChild
          className="h-11 rounded-xl bg-brand-navy font-semibold text-white hover:bg-brand-navy-dark"
        >
          <Link to="/login">
            <LogIn size={16} />
            Entrar agora
            <ArrowRight size={16} />
          </Link>
        </Button>
      </div>
    </div>
  );
}
