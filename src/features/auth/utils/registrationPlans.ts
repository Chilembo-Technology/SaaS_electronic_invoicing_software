/**
 * Planos que o formulário de registo oferece (campo opcional `plan_code`).
 *
 * Só códigos e nomes — os preços vivem no subscription_service (tabelas de
 * preços versionadas) e nunca no código. Os códigos têm de coincidir com
 * SUBSCRIPTION_REGISTRATION_PLANS no organization_service.
 *
 * Qualquer plano começa com 14 dias de teste em modo formação (um por NIF).
 */
export interface RegistrationPlanOption {
  code: string;
  name: string;
  description: string;
}

export const REGISTRATION_PLANS: RegistrationPlanOption[] = [
  {
    code: "PRE_ESSENCIAL",
    name: "Essencial",
    description: "Faturação, SAF-T e conformidade AGT · 1 utilizador",
  },
  {
    code: "PRE_PROFISSIONAL",
    name: "Profissional",
    description: "+ multi-moeda, guias e avisos de cobrança · 3 utilizadores",
  },
  {
    code: "PRE_EMPRESARIAL",
    name: "Empresarial",
    description: "+ API/POS e emissão em lote · 10 utilizadores",
  },
];

/** Plano pré-seleccionado (decisão da revisão da F2). */
export const DEFAULT_REGISTRATION_PLAN = "PRE_PROFISSIONAL";

/**
 * `?plano=` da Landing Page → plano do registo. Pós-pago e personalizado
 * começam no Profissional (o pedido de pós-pago é feito depois, já com conta).
 */
const LANDING_PLAN_CODES: Record<string, string> = {
  essencial: "PRE_ESSENCIAL",
  profissional: "PRE_PROFISSIONAL",
  empresa: "PRE_EMPRESARIAL",
  empresarial: "PRE_EMPRESARIAL",
};

export function registrationPlanFromQuery(plano: string | null): string {
  return (plano && LANDING_PLAN_CODES[plano.toLowerCase()]) || DEFAULT_REGISTRATION_PLAN;
}

/** Nome do plano para o cabeçalho e a confirmação (null se desconhecido). */
export function registrationPlanName(code: string): string | null {
  return REGISTRATION_PLANS.find((plan) => plan.code === code)?.name ?? null;
}
