import type { ReactNode } from "react";
import { Link } from "react-router";
import { Clock, FileCheck, ShieldCheck, Zap } from "lucide-react";

/** Destaques do painel lateral — identidade visual herdada da antiga página `/login`. */
const SHOWCASE_FEATURES = [
  { icon: ShieldCheck, label: "AGT Certificado", sub: "Conforme normas angolanas" },
  { icon: FileCheck, label: "SAF-T Integrado", sub: "Exportação automática" },
  { icon: Zap, label: "IVA Automático", sub: "0%, 7%, 14%, 21,5%" },
  { icon: Clock, label: "Suporte 24/7", sub: "Equipa sempre disponível" },
];

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  /** Largura máxima da coluna do formulário (o código OTP precisa de mais espaço). */
  contentClassName?: string;
}

/**
 * Estrutura comum às páginas públicas de entrada (`/login` e
 * `/login/verify-otp`): formulário à esquerda e painel de destaque à direita
 * (apenas em `lg+`). Mantém a identidade visual da página de login anterior.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  contentClassName = "max-w-md",
}: AuthShellProps) {
  return (
    <div className="min-h-screen flex">
      {/* Coluna do formulário */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-background">
        <div className={`w-full ${contentClassName} space-y-6`}>
          <div className="text-center space-y-3">
            <Link
              to="/"
              className="inline-flex items-center justify-center"
              aria-label="Voltar à página inicial"
            >
              <img
                src="/logo_with_name.png"
                alt="Fatura Mais"
                className="h-20 w-auto sm:h-24"
              />
            </Link>

            <h1
              className="text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {title}
            </h1>

            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {/*
            Mesmo contexto visual do registo (`RegisterPage`): o formulário vive
            dentro de um card branco (`bg-card`). É este contraste que faz o
            fundo cinza dos campos (`bg-background`, definido no `FormField`)
            aparecer dentro dos inputs.
          */}
          <div className="w-full rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow duration-200 sm:p-8">
            {children}
          </div>

          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} CHILEMBO TECHNOLOGY · Todos os direitos reservados
          </p>
        </div>
      </div>

      {/* Painel de destaque — só em ecrãs grandes */}
      <div className="relative hidden items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-secondary p-12 lg:flex lg:flex-1">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='g' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M10 0L0 0 0 10' fill='none' stroke='white' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute right-20 top-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-20 left-10 h-48 w-48 rounded-full bg-secondary/20 blur-3xl" />

        <div className="relative z-10 max-w-lg space-y-10 text-white">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/60">
              Faturação Eletrónica · Angola
            </p>
            <h2
              className="text-5xl font-bold leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Gerencie o seu negócio com confiança
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-white/80">
              Emita faturas conformes com a AGT, controle IVA e retenções, e exporte SAF-T
              automaticamente.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {SHOWCASE_FEATURES.map(({ icon: Icon, label, sub }) => (
              <div
                key={label}
                className="flex items-start gap-3 rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm transition-colors hover:bg-white/15"
              >
                <div className="flex-shrink-0 rounded-lg bg-white/15 p-2">
                  <Icon size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="mt-0.5 text-xs text-white/65">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <div className="flex -space-x-2">
              {["LC", "AT", "JM", "MR"].map((initials) => (
                <div
                  key={initials}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-white/20 text-xs font-bold"
                >
                  {initials}
                </div>
              ))}
            </div>
            <p className="text-sm text-white/70">
              <strong className="text-white">+500 empresas</strong> confiam no FATURA MAIS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
