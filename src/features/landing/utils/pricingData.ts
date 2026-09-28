import { Building2, Layers, Percent, RefreshCw, Wallet } from "lucide-react";

import type {
  BillingPeriod,
  BillingPeriodOption,
  PrepaidTier,
  PricingPlan,
} from "../types/landing";

/* ================================================================== */
/* Periodicidades disponíveis no componente PlanTab                    */
/* ================================================================== */

export const billingPeriods: BillingPeriodOption[] = [
  { id: "monthly", label: "Mensal", months: 1 },
  { id: "quarterly", label: "Trimestral", months: 3, discountLabel: "−10%" },
  { id: "semesterly", label: "Semestral", months: 6, discountLabel: "−15%" },
  { id: "yearly", label: "Anual", months: 12, discountLabel: "−25%" },
];

/* ================================================================== */
/* Planos PRÉ-PAGOS — identidade, limites e benefícios                 */
/* (os preços vivem em `prepaidPriceMatrix` para evitar duplicação)    */
/* ================================================================== */

export const prepaidTiers: PrepaidTier[] = [
  {
    id: "essencial",
    name: "Essencial",
    description: "Para freelancers e pequenos negócios que estão a começar.",
    icon: Percent,
    limits: { documents: "100 docs/mês", users: "1 utilizador" },
    ctaLabel: "Escolher Essencial",
    ctaHref: "/registar?plano=essencial",
    features: [
      { label: "Até 100 documentos por mês", included: true },
      { label: "1 utilizador", included: true },
      { label: "Fatura, Fatura/Recibo e Recibo", included: true },
      { label: "IVA 0%, 7%, 14% e 21,5% automático", included: true },
      { label: "Exportação SAF-T (AO) e arquivo digital", included: true },
      { label: "Comunicação de faturas à AGT", included: true },
      { label: "Suporte por email (horário laboral)", included: true },
      { label: "Relatórios e BI avançado", included: false },
      { label: "API de integração e Webhooks", included: false },
      { label: "White-label", included: false },
    ],
  },
  {
    id: "profissional",
    name: "Profissional",
    description: "Para empresas em crescimento com faturação regular.",
    icon: Wallet,
    badge: "Mais Popular",
    highlight: true,
    limits: { documents: "1.000 docs/mês", users: "5 utilizadores" },
    ctaLabel: "Escolher Profissional",
    ctaHref: "/registar?plano=profissional",
    features: [
      { label: "Até 1.000 documentos por mês", included: true },
      { label: "5 utilizadores", included: true },
      { label: "Todos os tipos de documento", included: true },
      { label: "Faturação eletrónica assinada e validada", included: true },
      { label: "Retenção na fonte (6,5%) automática", included: true },
      { label: "Relatórios, BI e previsão de fluxo de caixa", included: true },
      { label: "Moeda estrangeira com conversão para AOA", included: true },
      { label: "API de integração e Webhooks", included: true },
      { label: "Suporte prioritário (24/5)", included: true },
      { label: "White-label e domínio próprio", included: false },
    ],
  },
  {
    id: "empresa",
    name: "Empresa",
    description: "Para grandes organizações e grupos multiempresa.",
    icon: Building2,
    limits: { documents: "Ilimitados", users: "Ilimitados" },
    ctaLabel: "Escolher Empresa",
    ctaHref: "/registar?plano=empresa",
    features: [
      { label: "Documentos ilimitados", included: true },
      { label: "Utilizadores ilimitados", included: true },
      { label: "Gestão multiempresa e multi-série", included: true },
      { label: "Auto-faturação, Fatura Global e Notas", included: true },
      { label: "BI avançado com Machine Learning", included: true },
      { label: "API completa, Webhooks e integração ERP", included: true },
      { label: "White-label e domínio próprio", included: true },
      { label: "Gestor de conta dedicado", included: true },
      { label: "Suporte 24/7 com SLA garantido", included: true },
      { label: "Arquivo fiscal auditável (10 anos)", included: true },
    ],
  },
];

/** Preço por mês (Kz) de cada plano pré-pago, por periodicidade. */
export const prepaidPriceMatrix: Record<BillingPeriod, Record<string, number>> = {
  monthly: { essencial: 9900, profissional: 19900, empresa: 39900 },
  quarterly: { essencial: 8900, profissional: 17900, empresa: 35900 },
  semesterly: { essencial: 8400, profissional: 16900, empresa: 33900 },
  yearly: { essencial: 7400, profissional: 14900, empresa: 29900 },
};

/* ================================================================== */
/* Plano PÓS-PAGO — plano central, em maior destaque visual            */
/* ================================================================== */

export const postPaidPlan: PricingPlan = {
  id: "pos-pago",
  name: "Pós-Pago Flex",
  description:
    "Ideal para empresas com faturação variável: pague apenas pelos documentos que emitir.",
  icon: RefreshCw,
  pricePerMonth: 0,
  totalPerPeriod: 0,
  priceNote: "45 Kz por documento emitido",
  priceCaption: "Sem mensalidade fixa · mínimo mensal de 12.500 Kz",
  badge: "Recomendado",
  highlight: true,
  isPostPaid: true,
  limits: { documents: "Sem limite", users: "Ilimitados" },
  ctaLabel: "Adotar Pós-Pago",
  ctaHref: "/registar?plano=pos-pago",
  features: [
    { label: "Zero mensalidade fixa — paga só o que emitir", included: true },
    { label: "Documentos e utilizadores ilimitados", included: true },
    { label: "Tudo o que o plano Profissional inclui", included: true },
    { label: "Comunicação automática de faturas à AGT", included: true },
    { label: "IVA e retenção na fonte (6,5%) automáticos", included: true },
    { label: "Faturação mensal detalhada por consumo", included: true },
    { label: "Exportação SAF-T (AO) e arquivo digital", included: true },
    { label: "API de integração e Webhooks", included: true },
    { label: "Suporte 24/7 com gestor de conta dedicado", included: true },
  ],
};

/** Ícone do selo da faixa de destaque do plano pós-pago. */
export const postPaidBadgeIcon = Layers;

/* ================================================================== */
/* Textos da secção de preços                                          */
/* ================================================================== */

export const pricingCopy = {
  eyebrow: "Planos e Preços",
  title: "Preços simples, sem surpresas",
  subtitle:
    "Escolha um plano pré-pago com a periodicidade que preferir, ou o plano pós-pago se a sua faturação for variável.",
  prepaidLabel: "Planos Pré-Pagos",
  prepaidHint: "Pague adiantado e poupe até 25%",
  postPaidLabel: "Plano Pós-Pago",
  disclaimer:
    "Preços em Kwanzas (Kz), por empresa, sem IVA (14%). Pode mudar de plano ou cancelar a qualquer momento, sem penalizações.",
};

export const customPlanCta = {
  title: "Precisa de um plano à medida?",
  description:
    "Volumes elevados, integração com o seu ERP, vários NIFs ou requisitos de compliance específicos? Falamos a sua linguagem.",
  ctaLabel: "Falar com Vendas",
  ctaHref: "/registar?plano=personalizado",
};

