import { fiscalApi } from '../../lib/api';
import type { VatExemption } from '../vat-exemptions/types';

/**
 * Opção do seletor de imposto (`GET /tax-table-entries/options`): catálogo
 * global + entradas da empresa, activas e não expiradas.
 */
export interface TaxOption {
  id: string;
  tax_type: 'IVA' | 'IS' | 'NS';
  tax_country_region: string;
  tax_code: string;
  description: string | null;
  tax_percentage: number;
  /** Ex.: "IVA — Taxa normal — 14%". */
  label: string;
  /** Taxa 0 %: exige motivo de isenção (vat_exemption_reasons). */
  requires_exemption_reason: boolean;
  is_global: boolean;
  is_default: boolean;
}

export interface TaxCatalog {
  options: TaxOption[];
  defaultId: string | null;
  exemptionReasons: VatExemption[];
}

interface Envelope<T> {
  data?: T;
  meta?: { default_id?: string | null };
}

/** Carrega as opções de imposto e os motivos de isenção activos. */
export async function fetchTaxCatalog(): Promise<TaxCatalog> {
  const [options, reasons] = await Promise.all([
    fiscalApi.get<Envelope<TaxOption[]>>('/tax-table-entries/options'),
    fiscalApi.get<Envelope<VatExemption[]>>('/vat-exemption-reasons/list', {
      params: { is_active: 'true', per_page: 100 },
    }),
  ]);

  return {
    options: options.data.data ?? [],
    defaultId: options.data.meta?.default_id ?? null,
    exemptionReasons: reasons.data.data ?? [],
  };
}

/** Texto do motivo no seletor: "M10 — Isento nos termos…". */
export function exemptionLabel(reason: Pick<VatExemption, 'code' | 'description'>): string {
  return `${reason.code} — ${reason.description}`;
}

/**
 * Regra do imposto escolhido: devolve a mensagem de erro, ou null se válido.
 * A 0 % o motivo de isenção é obrigatório (SAF-T TaxExemptionCode).
 */
export function validateTaxChoice(
  options: TaxOption[],
  taxId: string,
  exemptionCode: string,
): { tax?: string; exemption?: string } {
  const option = options.find((item) => item.id === taxId);
  if (!option) return { tax: 'Escolha o imposto.' };
  if (option.requires_exemption_reason && !exemptionCode) {
    return { exemption: 'O motivo de isenção é obrigatório quando a taxa é 0%.' };
  }
  return {};
}

/**
 * Campos de imposto a enviar numa linha de documento a partir da opção
 * escolhida (o motivo só segue quando a taxa é 0 %).
 */
export function lineTaxFields(option: TaxOption, exemptionCode: string) {
  return {
    tax_type: option.tax_type,
    tax_country_region: option.tax_country_region,
    tax_code: option.tax_code,
    tax_percentage: option.tax_percentage,
    tax_exemption_code: option.requires_exemption_reason ? exemptionCode || undefined : undefined,
  };
}
