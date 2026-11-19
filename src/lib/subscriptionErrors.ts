/**
 * Erros da subscrição — ÚNICO sítio com o mapa código → mensagem/acção.
 *
 * O fiscal_core (emissão) e o auth_service (tecto de utilizadores) respondem
 * `402 { success: false, message, code }` quando a subscrição da empresa não
 * permite a operação (SUBSCRIPTION_ENFORCEMENT=enforce), e o auth_service
 * responde `503 { code: "USER_SEATS_BUSY" }` quando outra alteração aos
 * utilizadores está em curso.
 *
 * Os códigos vêm de:
 *   - subscription_service `EmissionBlockReason` (motivo do retrato de direitos,
 *     devolvido tal e qual pelos dois serviços);
 *   - fiscal_core `EmissionGate` (FEATURE_NOT_IN_PLAN, SUBSCRIPTION_UNAVAILABLE,
 *     EMISSION_BLOCKED);
 *   - auth_service `UserSeatGate` (USER_LIMIT_REACHED, SUBSCRIPTION_INACTIVE,
 *     USER_SEATS_BUSY).
 * Um código novo no backend tem de ser acrescentado aqui (o teste falha se
 * faltar mensagem a algum de SUBSCRIPTION_ERROR_CODES).
 */

/** Página dos planos e pacotes (rota `/planos`). */
export const PLANS_HREF = '/planos';

/** Contacto do suporte (o mesmo endereço da página pública). */
export const SUPPORT_HREF = 'mailto:comercial@faturamais.ao';

export const SUBSCRIPTION_ERROR_CODES = [
  // EmissionBlockReason (subscription_service)
  'NO_SUBSCRIPTION',
  'PENDING_ACTIVATION',
  'TRIAL_TRAINING_ONLY',
  'LIMIT_REACHED',
  'SUSPENDED_OVERDUE',
  'SUSPENDED_MANUAL',
  'PREPAID_EXPIRED',
  'CANCELLED',
  'ARCHIVED',
  'PRICING_UNAVAILABLE',
  // fiscal_core (EmissionGate)
  'FEATURE_NOT_IN_PLAN',
  'SUBSCRIPTION_UNAVAILABLE',
  'EMISSION_BLOCKED',
  // auth_service (UserSeatGate)
  'USER_LIMIT_REACHED',
  'SUBSCRIPTION_INACTIVE',
  'USER_SEATS_BUSY',
] as const;

export type SubscriptionErrorCode = (typeof SUBSCRIPTION_ERROR_CODES)[number];

export interface SubscriptionErrorAction {
  label: string;
  href: string;
}

export interface SubscriptionErrorInfo {
  /** Código devolvido pelo backend (ou `UNKNOWN` para um 402 sem código conhecido). */
  code: SubscriptionErrorCode | 'UNKNOWN';
  /** Título curto (toast). */
  title: string;
  /** Mensagem completa em português, já com a acção por extenso. */
  message: string;
  /** Acção sugerida (botão no toast). */
  action?: SubscriptionErrorAction;
}

const SEE_PLANS: SubscriptionErrorAction = { label: 'Ver planos e pacotes', href: PLANS_HREF };
const CONTACT_SUPPORT: SubscriptionErrorAction = { label: 'Contactar o suporte', href: SUPPORT_HREF };

const MESSAGES: Record<SubscriptionErrorCode, Omit<SubscriptionErrorInfo, 'code'>> = {
  LIMIT_REACHED: {
    title: 'Limite de documentos atingido',
    message:
      'Atingiu o limite de documentos do seu plano neste período. Para continuar a emitir, compre um pacote de documentos ou mude de plano.',
    action: SEE_PLANS,
  },
  FEATURE_NOT_IN_PLAN: {
    title: 'Não incluído no seu plano',
    message:
      'Esta funcionalidade não está incluída no seu plano. Para emitir este tipo de documento, mude para um plano que o inclua.',
    action: SEE_PLANS,
  },
  USER_LIMIT_REACHED: {
    title: 'Limite de utilizadores atingido',
    message:
      'Atingiu o número máximo de utilizadores do seu plano. Desactive um utilizador ou mude de plano para acrescentar mais.',
    action: SEE_PLANS,
  },
  USER_SEATS_BUSY: {
    title: 'Operação em curso',
    message:
      'Outra alteração aos utilizadores da empresa está a decorrer. Aguarde uns segundos e tente novamente.',
  },
  SUSPENDED_OVERDUE: {
    title: 'Subscrição suspensa',
    message:
      'A emissão está suspensa por falta de pagamento. Pode continuar a consultar os seus documentos. Regularize o pagamento ou contacte o suporte.',
    action: CONTACT_SUPPORT,
  },
  SUSPENDED_MANUAL: {
    title: 'Subscrição suspensa',
    message: 'A subscrição da empresa está suspensa. Contacte o suporte para saber como a reactivar.',
    action: CONTACT_SUPPORT,
  },
  NO_SUBSCRIPTION: {
    title: 'Sem subscrição',
    message: 'A empresa ainda não tem uma subscrição. Escolha um plano para começar a emitir.',
    action: SEE_PLANS,
  },
  PENDING_ACTIVATION: {
    title: 'Subscrição por activar',
    message:
      'A subscrição da empresa ainda não está activa. Conclua a activação do plano para emitir documentos.',
    action: SEE_PLANS,
  },
  TRIAL_TRAINING_ONLY: {
    title: 'Período de teste',
    message:
      'Durante o período de teste só pode emitir documentos em modo formação. Escolha um plano para emitir documentos com validade fiscal.',
    action: SEE_PLANS,
  },
  PREPAID_EXPIRED: {
    title: 'Período pago terminado',
    message: 'O período pago do seu plano terminou. Renove a subscrição para voltar a emitir.',
    action: { label: 'Renovar o plano', href: PLANS_HREF },
  },
  CANCELLED: {
    title: 'Subscrição cancelada',
    message: 'A subscrição da empresa foi cancelada. Escolha um plano para voltar a emitir.',
    action: SEE_PLANS,
  },
  ARCHIVED: {
    title: 'Conta arquivada',
    message:
      'A conta da empresa está arquivada: só é possível consultar documentos. Contacte o suporte para a reactivar.',
    action: CONTACT_SUPPORT,
  },
  PRICING_UNAVAILABLE: {
    title: 'Plano por configurar',
    message:
      'Não foi possível confirmar as condições do seu plano. Contacte o suporte para concluir a configuração.',
    action: CONTACT_SUPPORT,
  },
  SUBSCRIPTION_UNAVAILABLE: {
    title: 'Subscrição temporariamente indisponível',
    message:
      'Não foi possível confirmar a subscrição da empresa neste momento. Tente novamente dentro de momentos.',
  },
  SUBSCRIPTION_INACTIVE: {
    title: 'Subscrição inactiva',
    message: 'A subscrição da empresa não está activa. Consulte os planos ou contacte o suporte.',
    action: SEE_PLANS,
  },
  EMISSION_BLOCKED: {
    title: 'Emissão não permitida',
    message:
      'A subscrição da empresa não permite emitir documentos neste momento. Consulte o seu plano ou contacte o suporte.',
    action: SEE_PLANS,
  },
};

/** 402 com um código que este frontend ainda não conhece: nunca uma mensagem técnica. */
const UNKNOWN_402: Omit<SubscriptionErrorInfo, 'code'> = {
  title: 'Operação não permitida pelo plano',
  message: 'A subscrição da empresa não permite esta operação neste momento. Consulte o seu plano ou contacte o suporte.',
  action: SEE_PLANS,
};

export function isSubscriptionErrorCode(code: unknown): code is SubscriptionErrorCode {
  return typeof code === 'string' && (SUBSCRIPTION_ERROR_CODES as readonly string[]).includes(code);
}

/** Informação de um código conhecido (ou `null`). */
export function getSubscriptionError(code: unknown): SubscriptionErrorInfo | null {
  return isSubscriptionErrorCode(code) ? { code, ...MESSAGES[code] } : null;
}

/**
 * Erro de subscrição a partir de uma resposta HTTP: qualquer 402 (código
 * conhecido ou não) e o 503 com um código conhecido (USER_SEATS_BUSY). Outros
 * estados nunca são tratados como erro de subscrição. `null` se não for.
 */
export function subscriptionErrorFromResponse(status: number | undefined, body: unknown): SubscriptionErrorInfo | null {
  if (status !== 402 && status !== 503) {
    return null;
  }

  const code = body && typeof body === 'object' ? (body as { code?: unknown }).code : undefined;
  const known = getSubscriptionError(code);

  if (known) {
    return known;
  }

  return status === 402 ? { code: 'UNKNOWN', ...UNKNOWN_402 } : null;
}
