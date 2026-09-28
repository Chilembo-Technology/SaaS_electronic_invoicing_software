import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { Link } from "react-router";

import { Button } from "../../../app/components/ui/button";
import { cn } from "../../../app/components/ui/utils";
import { useAuth } from "../../../contexts/AuthContext";

const navigationLinks = [
  { name: "Funcionalidades", href: "#funcionalidades" },
  { name: "Planos", href: "#planos" },
  { name: "Testemunhos", href: "#testemunhos" },
  { name: "FAQ", href: "#faq" },
];

/**
 * Header público da Landing: logótipo, navegação por âncoras e ações de conta.
 * Se o utilizador já estiver autenticado, o CTA passa a "Ir para o Painel".
 */
export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logótipo */}
        <Link to="/" className="flex shrink-0 items-center" aria-label="Fatura Mais — página inicial">
          <img
            src="/logo_with_name.png"
            alt="Fatura Mais"
            className="h-12 w-auto object-contain"
          />
        </Link>

        {/* Navegação (desktop) */}
        <nav className="hidden items-center gap-8 md:flex">
          {navigationLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-semibold text-foreground/80 transition-colors hover:text-brand-navy"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Ações (desktop) */}
        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <Button
              asChild
              className="rounded-xl bg-brand-navy font-semibold text-white hover:bg-brand-navy-dark"
            >
              <Link to="/dashboard">
                Ir para o Painel
                <ArrowRight size={16} />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="rounded-xl font-semibold">
                <Link to="/login">Entrar</Link>
              </Button>
              <Button
                asChild
                className="rounded-xl bg-brand-navy font-semibold text-white hover:bg-brand-navy-dark"
              >
                <Link to="/registar">Registar</Link>
              </Button>
            </>
          )}
        </div>

        {/* Botão do menu mobile */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={mobileMenuOpen}
          className="rounded-lg p-2 text-foreground transition-colors hover:bg-accent md:hidden"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menu mobile */}
      <div
        className={cn(
          "border-t border-border bg-white md:hidden",
          mobileMenuOpen ? "block" : "hidden",
        )}
      >
        <nav className="mx-auto max-w-7xl space-y-1 px-4 py-4 sm:px-6">
          {navigationLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={closeMenu}
              className="block rounded-lg px-3 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
            >
              {link.name}
            </a>
          ))}

          <div className="flex flex-col gap-2 pt-3">
            {isAuthenticated ? (
              <Button
                asChild
                className="h-11 rounded-xl bg-brand-navy font-semibold text-white hover:bg-brand-navy-dark"
              >
                <Link to="/dashboard" onClick={closeMenu}>
                  Ir para o Painel
                  <ArrowRight size={16} />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="outline" className="h-11 rounded-xl font-semibold">
                  <Link to="/login" onClick={closeMenu}>
                    Entrar
                  </Link>
                </Button>
                <Button
                  asChild
                  className="h-11 rounded-xl bg-brand-navy font-semibold text-white hover:bg-brand-navy-dark"
                >
                  <Link to="/registar" onClick={closeMenu}>
                    Registar
                  </Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
