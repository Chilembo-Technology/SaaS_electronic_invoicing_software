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

/**
 * Tipos com endpoint de criação no fiscal_core — coincide com as rotas de
 * `invoice_rooter.php`. Usado no dropdown "Novo documento" da listagem e na
 * validação do parâmetro `:type` da rota de criação.
 */
export const CREATABLE_INVOICE_TYPES = [
  'FT',
  'FR',
  'PP',
  'OR',
  'ND',
  'NC',
  'RG',
  'GT',
  'GR',
  'GF',
  'FG',
  'AC',
  'AR',
  'AF',
  'TV',
  'NL',
] as const;

/** Opções para o dropdown "Novo documento" (todos os tipos criáveis). */
export const CREATE_INVOICE_TYPE_OPTIONS: { value: string; label: string }[] =
  CREATABLE_INVOICE_TYPES.map((value) => ({
    value,
    label: INVOICE_TYPE_LABELS[value] ?? value,
  }));

/** Tipos de operação aceites numa nota de crédito (CreateCreditNoteRequest). */
export const NC_OPERATION_TYPES = ['Rectificação', 'Anulação'] as const;

/** Títulos das páginas de criação (género incluído na etiqueta). */
export const CREATE_PAGE_TITLES: Record<string, string> = {
  FT: 'Nova Factura',
  FR: 'Nova Factura-recibo',
  PP: 'Nova Factura proforma',
  OR: 'Novo Orçamento',
  ND: 'Nova Nota de débito',
  NC: 'Nova Nota de crédito',
  RG: 'Novo Recibo',
  GT: 'Nova Guia de transporte',
  GR: 'Nova Guia de remessa',
  GF: 'Nova Guia de facturação',
  FG: 'Nova Factura de guia',
  AC: 'Novo Aviso de cobrança',
  AR: 'Novo Aviso de cobrança/recibo',
  AF: 'Nova Autofacturação',
  TV: 'Novo Talão de venda',
  NL: 'Nova Nota de liquidação',
};

/** Rótulo amigável para um tipo (com fallback para o código cru). */
export function invoiceTypeLabel(type?: string | null): string {
  if (!type) return '—';
  return INVOICE_TYPE_LABELS[type] ?? type;
}
