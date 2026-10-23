import type { ProductType } from './types';

/**
 * Constantes de apresentação do domínio de produtos (SAF-T 2.4 Product).
 * Rotas/ficheiros ficam em inglês; as etiquetas são as traduções PT para a UI.
 */

/** Etiquetas PT para ProductType (SAF-T 2.4.1). */
export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  P: 'Produto',
  S: 'Serviço',
  O: 'Outro',
  E: 'IEC',
  I: 'Imposto/Parafiscal',
};

export const PRODUCT_TYPE_OPTIONS: { value: ProductType; label: string }[] = (
  Object.keys(PRODUCT_TYPE_LABELS) as ProductType[]
).map((value) => ({ value, label: PRODUCT_TYPE_LABELS[value] }));

/** Unidades de medida comuns (campo livre no backend, máx. 20 caracteres). */
export const UNIT_OF_MEASURE_OPTIONS: { value: string; label: string }[] = [
  { value: 'UN', label: 'UN — Unidade' },
  { value: 'KG', label: 'KG — Quilograma' },
  { value: 'LT', label: 'LT — Litro' },
  { value: 'MT', label: 'MT — Metro' },
  { value: 'M2', label: 'M2 — Metro quadrado' },
  { value: 'M3', label: 'M3 — Metro cúbico' },
  { value: 'CX', label: 'CX — Caixa' },
  { value: 'HR', label: 'HR — Hora' },
  { value: 'SRV', label: 'SRV — Serviço' },
];

/** Label amigável para um tipo de produto (com fallback para o valor cru). */
export function productTypeLabel(type?: string | null): string {
  if (!type) return '—';
  return PRODUCT_TYPE_LABELS[type as ProductType] ?? type;
}

/** Label amigável para uma unidade de medida (com fallback para o valor cru). */
export function unitOfMeasureLabel(unit?: string | null): string {
  if (!unit) return '—';
  return (
    UNIT_OF_MEASURE_OPTIONS.find((option) => option.value === unit)?.label ?? unit
  );
}
