import type { CustomerType } from './types';

/**
 * Constantes de apresentação da tabela de clientes (SAF-T 2.5 MasterFiles →
 * Customer). Rotas/ficheiros ficam em inglês; as etiquetas são as traduções PT
 * para a UI.
 */

/** Etiquetas PT para CustomerType. */
export const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  normal: 'Normal',
  empresa: 'Empresa',
};

export const CUSTOMER_TYPE_OPTIONS: { value: CustomerType; label: string }[] = (
  Object.keys(CUSTOMER_TYPE_LABELS) as CustomerType[]
).map((value) => ({ value, label: CUSTOMER_TYPE_LABELS[value] }));

/** Label amigável para um tipo de cliente (com fallback para o valor cru). */
export function customerTypeLabel(type?: string | null): string {
  if (!type) return '—';
  return CUSTOMER_TYPE_LABELS[type as CustomerType] ?? type;
}
