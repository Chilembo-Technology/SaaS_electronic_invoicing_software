import type { ComponentType } from "react";

/**
 * Tipos da Landing Page (página pública / não autenticada).
 *
 * Nota de arquitetura: estes tipos descrevem apenas a apresentação da Landing.
 * O contexto da empresa (`company_id`) não se aplica aqui, uma vez que o
 * utilizador ainda não está autenticado.
 */

/** Periodicidade de cobrança dos planos pré-pagos. */
export type BillingPeriod = "monthly" | "quarterly" | "semesterly" | "yearly";

/** Opção de periodicidade apresentada no componente `PlanTab`. */
export interface BillingPeriodOption {
  id: BillingPeriod;
  /** Rótulo visível na UI (ex.: "Trimestral"). */
  label: string;
  /** Número de meses cobertos pelo período. */
  months: number;
  /** Desconto aplicado face ao preço mensal (ex.: "−10%"). */
  discountLabel?: string;
}

/** Benefício de um plano. `included: false` é apresentado como indisponível. */
export interface PricingFeature {
  label: string;
  included: boolean;
}

/** Plano apresentado num `PricingCard`. */
export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  /** Preço por mês, em Kwanzas (0 no plano pós-pago). */
  pricePerMonth: number;
  /** Valor total a pagar no período selecionado, em Kwanzas. */
  totalPerPeriod: number;
  /** Sufixo do preço para planos por utilização (ex.: "+ 45 Kz por documento"). */
  priceNote?: string;
  /** Legenda sob o preço (ex.: "Faturado trimestralmente"). */
  priceCaption?: string;
  /** Selo de desconto do período (ex.: "Poupe 10%"). */
  discountLabel?: string;
  /** Selo de destaque do card (ex.: "Recomendado", "Mais Popular"). */
  badge?: string;
  /** Ativa a borda/realce visual de plano em destaque. */
  highlight?: boolean;
  /** Limites principais, apresentados em grelha no card. */
  limits?: { documents: string; users: string };
  features: PricingFeature[];
  ctaLabel: string;
  ctaHref: string;
  /** Ícone apresentado no topo do card (componente de `lucide-react`). */
  icon?: ComponentType<{ className?: string; size?: number | string }>;
  /** Marca o plano pós-pago (cobrança por utilização). */
  isPostPaid?: boolean;
}

/**
 * Definição de um plano pré-pago sem preços.
 * Os preços vivem em `prepaidPriceMatrix`, evitando duplicação de dados.
 */
export type PrepaidTier = Omit<
  PricingPlan,
  "pricePerMonth" | "totalPerPeriod" | "priceCaption" | "discountLabel"
>;

/** Secção de funcionalidades (tipos de documento suportados). */
export interface DocumentFeature {
  title: string;
  description: string;
}

export interface DocumentFeatureGroup {
  id: string;
  title: string;
  description: string;
  icon?: ComponentType<{ className?: string; size?: number | string }>;
  items: DocumentFeature[];
}

/** Item da faixa de confiança/segurança sob o Hero. */
export interface TrustItem {
  label: string;
  description: string;
  icon?: ComponentType<{ className?: string; size?: number | string }>;
}

/** Testemunho de cliente. */
export interface Testimonial {
  id: string;
  quote: string;
  highlight?: string;
  author: string;
  role: string;
  company: string;
  initials: string;
  rating: number;
}

/** Pergunta frequente. */
export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

/** Coluna do footer. */
export interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}
