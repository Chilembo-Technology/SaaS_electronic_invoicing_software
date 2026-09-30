import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import type { Ref } from "react";

import { Button } from "../../../app/components/ui/button";
import { UserMenu } from "../../../components/UserMenu";
import { useAuth } from "../../../contexts/AuthContext";

interface WelcomeBackSectionProps {
  /**
   * Liga o `<section>` da faixa ao observer da página (`useElementVisible`) —
   * a navbar usa essa visibilidade para decidir se esconde as acções
   * duplicadas. Sem esta prop a faixa comporta-se exactamente como antes.
   */
  sectionRef?: Ref<HTMLElement>;
}

/**
 * Faixa de boas-vindas da página inicial, apresentada apenas com sessão iniciada.
 *
 * Sem sessão, devolve `null` — a página inicial deslogada mantém-se exactamente
 * como estava (hero + secções de marketing, sem qualquer vestígio autenticado).
 *
 * O botão de saída é o `UserMenu`, que reutiliza o `logout()` do `AuthContext`
 * (mesmo comportamento da sidebar) — nenhuma lógica de autenticação é duplicada.
 */
export function WelcomeBackSection({ sectionRef }: WelcomeBackSectionProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  const userName = user?.name || "Utilizador";
  const firstName = userName.split(" ")[0] || userName;
  const userEmail = user?.email || "";

  return (
    <section ref={sectionRef} className="border-b border-border bg-white/80">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="landing-fade-up">
          <span className="inline-flex items-center rounded-full border border-brand-green/25 bg-brand-green/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-green">
            Sessão iniciada
          </span>
          <p
            className="mt-3 text-2xl font-bold leading-tight text-foreground sm:text-3xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Bem-vindo de volta, <span className="landing-gradient-text">{firstName}</span>
          </p>
          {userEmail ? (
            <p className="mt-1 text-sm text-muted-foreground">{userEmail}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            asChild
            className="h-11 rounded-xl bg-brand-navy font-semibold text-white hover:bg-brand-navy-dark"
          >
            <Link to="/dashboard">
              Ir para o Dashboard
              <ArrowRight size={16} />
            </Link>
          </Button>

          <UserMenu
            logoutLabel="Sair da conta"
            showIdentity={false}
            className="justify-start sm:justify-center"
          />
        </div>
      </div>
    </section>
  );
}
