import type {
  BillingPeriod,
  BillingPeriodOption,
  PricingPlan,
} from "../types/landing";
import {
  billingPeriods,
  prepaidPriceMatrix,
  prepaidTiers,
} from "./pricingData";

/**
 * Formata um valor em Kwanzas com separador de milhares.
 * Implementação manual (sem dependência de ICU) para resultado previsível.
 * Ex.: 19900 -> "19.900 Kz"
 */
export function formatKz(value: number): string {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? "-" : "";
  const digits = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${sign}${digits} Kz`;
}

/** Devolve a opção de periodicidade correspondente (ou a mensal por omissão). */
export function findBillingPeriod(period: BillingPeriod): BillingPeriodOption {
  return billingPeriods.find((option) => option.id === period) ?? billingPeriods[0];
}

/** Legenda apresentada sob o preço de um plano pré-pago. */
export function buildPriceCaption(option: BillingPeriodOption): string {
  if (option.months === 1) {
    return "Faturado mensalmente, sem compromisso";
  }
  return `Faturado a cada ${option.months} meses (${option.label.toLowerCase()})`;
}

/**
 * Constrói a lista de planos pré-pagos para a periodicidade indicada,
 * cruzando a identidade do plano (`prepaidTiers`) com a matriz de preços.
 */
export function buildPrepaidPlans(period: BillingPeriod): PricingPlan[] {
  const option = findBillingPeriod(period);
  const prices = prepaidPriceMatrix[period] ?? prepaidPriceMatrix.monthly;

  return prepaidTiers.map((tier) => {
    const pricePerMonth = prices[tier.id] ?? 0;
    return {
      ...tier,
      pricePerMonth,
      totalPerPeriod: pricePerMonth * option.months,
      priceCaption: buildPriceCaption(option),
      discountLabel: option.discountLabel,
    };
  });
}
