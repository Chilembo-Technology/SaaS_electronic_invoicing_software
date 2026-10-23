import type { VatExemptionType } from './types';

/**
 * Constantes de apresentação dos motivos de isenção de IVA.
 * Os agrupamentos correspondem aos artigos do CIVA (ver `VATExemptionReason`):
 *   - incomplete_internal → Art. 12.º (operações internas)
 *   - complete            → Art. 15.º
 *   - incomplete_import   → Art. 14.º (importações)
 *   - special_customs     → Art. 16.º (regimes aduaneiros especiais)
 */
export const EXEMPTION_TYPE_LABELS: Record<VatExemptionType, string> = {
  incomplete_internal: 'Isenção incompleta (operações internas)',
  complete: 'Isenção completa',
  incomplete_import: 'Isenção incompleta (importações)',
  special_customs: 'Regimes aduaneiros especiais',
};

export const EXEMPTION_TYPE_OPTIONS: { value: VatExemptionType; label: string }[] = (
  Object.keys(EXEMPTION_TYPE_LABELS) as VatExemptionType[]
).map((value) => ({ value, label: EXEMPTION_TYPE_LABELS[value] }));

/** Label amigável para um agrupamento (com fallback para valores desconhecidos). */
export function exemptionTypeLabel(type?: string | null): string {
  if (!type) return '—';
  return EXEMPTION_TYPE_LABELS[type as VatExemptionType] ?? type;
}
