import { ArrowRight, Zap } from "lucide-react";
import { Link } from "react-router";

import { Button } from "../../../app/components/ui/button";
import { PlanTab } from "../../../components/PlanTab";
import { PricingCard } from "../../../components/PricingCard";
import { SectionHeading } from "../../../components/SectionHeading";
import { usePricingPlans } from "../hooks/usePricingPlans";
import { customPlanCta, postPaidBadgeIcon, pricingCopy } from "../utils/pricingData";

/**
 * Secção de planos e preços.
 *
 * Toda a informação vem de `utils/pricingData.ts` e a lógica de seleção de
 * periodicidade vive no hook `usePricingPlans` — este componente apenas compõe
 * os componentes reutilizáveis `PlanTab` e `PricingCard`.
 */
export function PricingSection() {
  const {
    periods,
    activePeriod,
    periodOption,
    prepaidPlans,
    postPaidPlan,
    disclaimer,
    selectPeriod,
  } = usePricingPlans();

  const PostPaidIcon = postPaidBadgeIcon;

  return (
    <section id="planos" className="landing-anchor bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={pricingCopy.eyebrow}
          title={pricingCopy.title}
          subtitle={pricingCopy.subtitle}
        />

        {/* ---------- Plano pós-pago (destaque central) ---------- */}
        <div className="mx-auto mt-14 max-w-6xl">
          <div className="mb-4 flex items-center justify-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-navy/10 text-brand-navy">
              <PostPaidIcon size={18} />
            </span>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-navy">
              {pricingCopy.postPaidLabel}
            </p>
          </div>

          <PricingCard plan={postPaidPlan} layout="horizontal" featured />
        </div>

        {/* ---------- Planos pré-pagos (com tabs de periodicidade) ---------- */}
        <div className="mx-auto mt-16 max-w-6xl">
          <div className="flex flex-col items-center text-center">
            <h3
              className="text-xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {pricingCopy.prepaidLabel}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{pricingCopy.prepaidHint}</p>

            <PlanTab
              periods={periods}
              value={activePeriod}
              onChange={selectPeriod}
              className="mt-6"
            />

            <p className="mt-3 text-xs text-muted-foreground">
              {periodOption.label} · valores por mês, já com o desconto do período aplicado
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {prepaidPlans.map((plan) => (
              <PricingCard
                key={`${plan.id}-${activePeriod}`}
                plan={plan}
                className="landing-fade-up"
              />
            ))}
          </div>
        </div>

        {/* ---------- Plano personalizado ---------- */}
        <div className="mx-auto mt-14 max-w-6xl">
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-brand-navy/15 bg-gradient-to-br from-brand-navy/5 to-brand-green/5 p-8 sm:flex-row sm:items-center">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy/10 text-brand-navy">
                <Zap size={20} />
              </span>
              <div>
                <h3
                  className="text-lg font-bold text-foreground"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {customPlanCta.title}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                  {customPlanCta.description}
                </p>
              </div>
            </div>

            <Button
              asChild
              className="h-11 shrink-0 rounded-xl bg-brand-navy px-6 font-semibold text-white hover:bg-brand-navy-dark"
            >
              <Link to={customPlanCta.ctaHref}>
                {customPlanCta.ctaLabel}
                <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        </div>

        <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-relaxed text-muted-foreground">
          {disclaimer}
        </p>
      </div>
    </section>
  );
}
