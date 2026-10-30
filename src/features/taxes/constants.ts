import type { TaxCountryRegion, TaxType } from './types';

/**
 * Constantes de apresentação da tabela de impostos (SAF-T 2.5 TaxTableEntry).
 * Rotas/ficheiros ficam em inglês; as etiquetas são as traduções PT para a UI.
 */

/** Etiquetas PT para TaxType (SAF-T 2.5.1.1). */
export const TAX_TYPE_LABELS: Record<TaxType, string> = {
  IVA: 'IVA',
  IS: 'Imposto do Selo',
  NS: 'Não sujeição',
};

export const TAX_TYPE_OPTIONS: { value: TaxType; label: string }[] = (
  Object.keys(TAX_TYPE_LABELS) as TaxType[]
).map((value) => ({ value, label: TAX_TYPE_LABELS[value] }));

/** Etiquetas PT para TaxCountryRegion (SAF-T 2.5.1.2). */
export const TAX_COUNTRY_REGION_LABELS: Record<TaxCountryRegion, string> = {
  AO: 'Angola',
  'AO-CABI': 'Cabinda',
};

export const TAX_COUNTRY_REGION_OPTIONS: { value: TaxCountryRegion; label: string }[] = (
  Object.keys(TAX_COUNTRY_REGION_LABELS) as TaxCountryRegion[]
).map((value) => ({ value, label: TAX_COUNTRY_REGION_LABELS[value] }));

/**
 * Códigos de imposto válidos por TaxType (regra R1 do backend). Para IS o código
 * é livre (verba do Imposto do Selo), pelo que a lista fica vazia e a UI usa um
 * input de texto.
 */
export const TAX_CODE_OPTIONS: Record<TaxType, { value: string; label: string }[]> = {
  IVA: [
    { value: 'NOR', label: 'NOR — Taxa normal' },
    { value: 'ISE', label: 'ISE — Isenta' },
    { value: 'OUT', label: 'OUT — Regimes especiais' },
  ],
  IS: [],
  NS: [
    { value: 'NS', label: 'NS — Não sujeição' },
    { value: 'NA', label: 'NA — Não aplicável' },
  ],
};

/** Label amigável para um tipo de imposto (com fallback para o valor cru). */
export function taxTypeLabel(type?: string | null): string {
  if (!type) return '—';
  return TAX_TYPE_LABELS[type as TaxType] ?? type;
}

/** Label amigável para uma região (com fallback para o valor cru). */
export function taxCountryRegionLabel(region?: string | null): string {
  if (!region) return '—';
  return TAX_COUNTRY_REGION_LABELS[region as TaxCountryRegion] ?? region;
}
