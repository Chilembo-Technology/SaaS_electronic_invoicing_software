import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import { Link } from "react-router";

import { Button } from "../../../app/components/ui/button";
import { HeroIllustration } from "./HeroIllustration";

const highlights = [
  "100% na nuvem — sem instalação",
  "Migração de dados em 48 horas",
  "Séries, NIF e IVA configurados por nós",
];

const stats = [
  { value: "+500", label: "empresas em Angola" },
  { value: "1,2M", label: "documentos emitidos" },
  { value: "99,9%", label: "disponibilidade" },
];

/** Secção Hero: proposta de valor principal e CTA de entrada na aplicação. */
export function HeroSection() {
  return (
    <section className="landing-hero relative overflow-hidden">
      <div className="landing-hero-grid pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-7xl gap-14 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-10 lg:px-8 lg:py-24">
        {/* Coluna de texto */}
        <div className="landing-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-navy/15 bg-white/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-navy shadow-sm">
            <ShieldCheck size={14} className="text-brand-green" />
            Certificado pela AGT
          </span>

          <h1
            className="mt-6 text-4xl font-bold leading-[1.1] text-foreground sm:text-5xl lg:text-6xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Simplifique a sua{" "}
            <span className="landing-gradient-text">faturação em Angola</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Emita faturas, notas e recibos conformes com a AGT, calcule IVA e retenções
            automaticamente e exporte o SAF-T num clique — tudo numa só plataforma,
            pensada para empresas angolanas.
          </p>

          <ul className="mt-8 space-y-2.5">
            {highlights.map((highlight) => (
              <li key={highlight} className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-green/15">
                  <Check size={12} strokeWidth={3} className="text-brand-green" />
                </span>
                <span className="text-sm font-medium text-foreground">{highlight}</span>
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              asChild
              size="lg"
              className="h-13 rounded-xl bg-brand-navy px-7 text-base font-semibold text-white shadow-lg shadow-brand-navy/20 hover:bg-brand-navy-dark"
            >
              <Link to="/registar">
                Começar agora
                <ArrowRight size={18} />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-13 rounded-xl border-brand-navy/25 bg-white px-7 text-base font-semibold text-brand-navy hover:bg-brand-navy/5"
            >
              <a href="#planos">Ver planos e preços</a>
            </Button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Sem cartão de crédito · Configuração assistida · Suporte em português
          </p>

          {/* Indicadores */}
          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-border/70 pt-6">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-2xl font-bold text-brand-navy sm:text-3xl">{stat.value}</dt>
                <dd className="mt-0.5 text-xs leading-snug text-muted-foreground">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Coluna ilustrativa */}
        <div className="landing-fade-up landing-delay-1 lg:pl-6">
          <HeroIllustration />
        </div>
      </div>
    </section>
  );
}
