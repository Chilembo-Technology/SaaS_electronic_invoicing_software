import { ArrowRight, Check, Sparkles, X } from "lucide-react";
import { Link } from "react-router";

import { Button } from "../app/components/ui/button";
import { Card } from "../app/components/ui/card";
import { cn } from "../app/components/ui/utils";
import type { PricingPlan } from "../features/landing/types/landing";
import { formatKz } from "../features/landing/utils/pricingHelpers";

interface PricingCardProps {
  /** Dados do plano (vêm de `features/landing/utils/pricingData.ts`). */
  plan: PricingPlan;
  /** Força o realce visual do card (usado no plano recomendado/pós-pago). */
  featured?: boolean;
  /** `vertical` para a grelha de planos; `horizontal` para a faixa em destaque. */
  layout?: "vertical" | "horizontal";
  className?: string;
}

/**
 * Card de plano genérico e apresentacional: não contém dados nem regras de
 * negócio, nem faz chamadas HTTP — recebe tudo por props.
 */
export function PricingCard({
  plan,
  featured = false,
  layout = "vertical",
  className,
}: PricingCardProps) {
  const Icon = plan.icon;
  const isHighlighted = featured || Boolean(plan.highlight);

  if (layout === "horizontal") {
    return (
      <Card
        className={cn(
          "relative flex flex-col gap-0 overflow-hidden rounded-3xl border-2 bg-card p-0 transition-shadow duration-300",
          isHighlighted
            ? "border-brand-navy shadow-xl shadow-brand-navy/10"
            : "border-border shadow-sm",
          className,
        )}
      >
        {plan.badge ? (
          <span className="absolute right-0 top-0 z-10 inline-flex items-center gap-1 rounded-bl-2xl bg-brand-navy px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white">
            <Sparkles size={12} />
            {plan.badge}
          </span>
        ) : null}

        <div className="grid gap-8 p-7 sm:p-9 lg:grid-cols-2 lg:gap-12">
          {/* Identidade + preço + CTA */}
          <div className="flex flex-col">
            {Icon ? (
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-navy/10 text-brand-navy">
                <Icon size={24} />
              </div>
            ) : null}

            <h3
              className="text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {plan.name}
            </h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              {plan.description}
            </p>

            <div className="mt-6">
              {plan.isPostPaid ? (
                <p className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  0 Kz
                  <span className="ml-2 text-base font-medium text-muted-foreground">
                    de mensalidade
                  </span>
                </p>
              ) : (
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-4xl font-bold tracking-tight text-foreground">
                    {formatKz(plan.pricePerMonth)}
                  </span>
                  <span className="text-sm text-muted-foreground">/ mês</span>
                </div>
              )}

              {plan.priceNote ? (
                <p className="mt-2 text-sm font-semibold text-brand-teal">
                  + {plan.priceNote}
                </p>
              ) : null}
              {plan.priceCaption ? (
                <p className="mt-1 text-xs text-muted-foreground">{plan.priceCaption}</p>
              ) : null}
            </div>

            {plan.limits ? (
              <div className="mt-6 grid max-w-sm grid-cols-2 gap-3">
                <div className="rounded-xl bg-muted/60 p-3 text-center">
                  <p className="text-sm font-bold text-foreground">
                    {plan.limits.documents}
                  </p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                    Documentos
                  </p>
                </div>
                <div className="rounded-xl bg-muted/60 p-3 text-center">
                  <p className="text-sm font-bold text-foreground">{plan.limits.users}</p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                    Utilizadores
                  </p>
                </div>
              </div>
            ) : null}

            <Button
              asChild
              className="mt-7 h-12 w-fit rounded-xl bg-brand-navy px-7 text-sm font-semibold text-white hover:bg-brand-navy-dark"
            >
              <Link to={plan.ctaHref}>
                {plan.ctaLabel}
                <ArrowRight size={16} />
              </Link>
            </Button>
          </div>

          {/* Benefícios */}
          <div className="lg:border-l lg:border-border lg:pl-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              O que está incluído
            </p>
            <PricingFeatureList plan={plan} className="mt-4" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "relative flex h-full flex-col gap-0 overflow-hidden rounded-2xl border-2 bg-card p-0 transition-shadow duration-300 hover:shadow-xl",
        isHighlighted
          ? "border-brand-navy shadow-lg shadow-brand-navy/10"
          : "border-border shadow-sm",
        className,
      )}
    >
      {plan.badge ? (
        <span
          className={cn(
            "absolute right-0 top-0 z-10 inline-flex items-center gap-1 rounded-bl-xl px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white",
            isHighlighted ? "bg-brand-navy" : "bg-brand-teal",
          )}
        >
          <Sparkles size={12} />
          {plan.badge}
        </span>
      ) : null}

      <div className="flex flex-1 flex-col p-7">
        {Icon ? (
          <div
            className={cn(
              "mb-4 flex h-12 w-12 items-center justify-center rounded-xl",
              isHighlighted
                ? "bg-brand-navy/10 text-brand-navy"
                : "bg-brand-teal/10 text-brand-teal",
            )}
          >
            <Icon size={24} />
          </div>
        ) : null}

        <h3
          className="text-xl font-bold text-foreground"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {plan.name}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {plan.description}
        </p>

        {/* Preço */}
        <div className="mt-6">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-4xl font-bold tracking-tight text-foreground">
              {formatKz(plan.pricePerMonth)}
            </span>
            <span className="text-sm text-muted-foreground">/ mês</span>
            {plan.discountLabel ? (
              <span className="rounded-full bg-secondary/20 px-2 py-0.5 text-[11px] font-bold text-brand-navy">
                {plan.discountLabel}
              </span>
            ) : null}
          </div>

          {plan.priceNote ? (
            <p className="mt-2 text-sm font-semibold text-brand-teal">
              + {plan.priceNote}
            </p>
          ) : null}

          {plan.totalPerPeriod > 0 ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Total do período:{" "}
              <span className="font-bold text-foreground">
                {formatKz(plan.totalPerPeriod)}
              </span>
            </p>
          ) : null}

          {plan.priceCaption ? (
            <p className="mt-1 text-xs text-muted-foreground">{plan.priceCaption}</p>
          ) : null}
        </div>
      </div>

      {/* CTA */}
      <div className="border-t border-border bg-muted/30 p-7 pt-6">
        <Button
          asChild
          variant={isHighlighted ? "default" : "outline"}
          className="h-12 w-full rounded-xl text-sm font-semibold"
        >
          <Link to={plan.ctaHref}>
            {plan.ctaLabel}
            <ArrowRight size={16} />
          </Link>
        </Button>
      </div>
    </Card>
  );
}

/** Lista de benefícios de um plano (extraída para reutilização no card destacado). */
export function PricingFeatureList({
  plan,
  className,
}: {
  plan: PricingPlan;
  className?: string;
}) {
  return (
    <ul className={cn("space-y-2.5", className)}>
      {plan.features.map((feature) => (
        <li
          key={feature.label}
          className={cn("flex items-start gap-2.5", !feature.included && "opacity-45")}
        >
          {feature.included ? (
            <Check
              size={16}
              strokeWidth={3}
              className="mt-0.5 shrink-0 text-brand-green"
            />
          ) : (
            <X size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
          )}
          <span
            className={cn(
              "text-sm text-foreground",
              !feature.included && "text-muted-foreground line-through",
            )}
          >
            {feature.label}
          </span>
        </li>
      ))}
    </ul>
  );
}
