/**
 * Constantes de apresentação do domínio de facturação.
 *
 * Os códigos são os SAF-T 4.1 (InvoiceType) usados pelo fiscal_core; as
 * etiquetas são as traduções PT para a UI. Rotas/ficheiros ficam em inglês.
 */

/** Etiquetas PT para os códigos de tipo de documento SAF-T. */
export const INVOICE_TYPE_LABELS: Record<string, string> = {
  FT: 'Factura',
  FR: 'Factura-recibo',
  PP: 'Factura proforma',
  OR: 'Orçamento',
  ND: 'Nota de débito',
  NC: 'Nota de crédito',
  RG: 'Recibo',
  GT: 'Guia de transporte',
  GR: 'Guia de remessa',
  GF: 'Guia de facturação',
  FG: 'Factura de guia',
  AC: 'Aviso de cobrança',
  AR: 'Aviso de cobrança/recibo',
  AF: 'Autofacturação',
  TV: 'Talão de venda',
  NL: 'Nota de liquidação',
  RC: 'Recibo',
};

/**
 * Tipos pesquisáveis na listagem unificada — coincide com
 * `ListInvoicesRequest::FILTERABLE_TYPES`.
 */
export const FILTERABLE_INVOICE_TYPES = [
  'FT',
  'FR',
  'PP',
  'OR',
  'ND',
  'NC',
  'RG',
  'GT',
  'GR',
] as const;

/** Opções para selects de filtro por tipo de documento. */
export const INVOICE_TYPE_OPTIONS: { value: string; label: string }[] =
  FILTERABLE_INVOICE_TYPES.map((value) => ({
    value,
    label: INVOICE_TYPE_LABELS[value] ?? value,
  }));

/** Rótulo amigável para um tipo (com fallback para o código cru). */
export function invoiceTypeLabel(type?: string | null): string {
  if (!type) return '—';
  return INVOICE_TYPE_LABELS[type] ?? type;
}
