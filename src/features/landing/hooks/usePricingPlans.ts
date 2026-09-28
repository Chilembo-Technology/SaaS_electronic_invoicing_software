import { useCallback, useMemo, useState } from "react";

import type {
  BillingPeriod,
  BillingPeriodOption,
  PricingPlan,
} from "../types/landing";
import { billingPeriods, postPaidPlan, pricingCopy } from "../utils/pricingData";
import { buildPrepaidPlans, findBillingPeriod } from "../utils/pricingHelpers";

export interface UsePricingPlansResult {
  periods: BillingPeriodOption[];
  activePeriod: BillingPeriod;
  periodOption: BillingPeriodOption;
  prepaidPlans: PricingPlan[];
  postPaidPlan: PricingPlan;
  disclaimer: string;
  selectPeriod: (period: BillingPeriod) => void;
}

/**
 * Lógica de apresentação da secção de preços.
 *
 * Responsabilidade única: manter a periodicidade selecionada e derivar a lista
 * de planos a mostrar. Não faz chamadas HTTP — os dados são estáticos
 * (`utils/pricingData.ts`) e, quando existir uma API de planos, é aqui (e só
 * aqui) que a substituição acontece, sem tocar nos componentes de UI.
 */
export function usePricingPlans(
  initialPeriod: BillingPeriod = "monthly",
): UsePricingPlansResult {
  const [activePeriod, setActivePeriod] = useState<BillingPeriod>(initialPeriod);

  const periodOption = useMemo(
    () => findBillingPeriod(activePeriod),
    [activePeriod],
  );

  const prepaidPlans = useMemo(
    () => buildPrepaidPlans(activePeriod),
    [activePeriod],
  );

  const selectPeriod = useCallback((period: BillingPeriod) => {
    setActivePeriod(period);
  }, []);

  return {
    periods: billingPeriods,
    activePeriod,
    periodOption,
    prepaidPlans,
    postPaidPlan,
    disclaimer: pricingCopy.disclaimer,
    selectPeriod,
  };
}
