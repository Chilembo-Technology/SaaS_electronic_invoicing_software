/**
 * Tipos do domínio de facturação (fiscal_core).
 *
 * Espelham o contrato devolvido por `InvoiceResource` (listagem e detalhe) e o
 * payload aceite por `POST /api/v1/invoices/invoice` (factura FT).
 */

export type InvoiceType =
  | 'FT'
  | 'FR'
  | 'PP'
  | 'OR'
  | 'ND'
  | 'NC'
  | 'RG'
  | 'GT'
  | 'GR'
  | 'GF'
  | 'FG'
  | 'AC'
  | 'AR'
  | 'AF'
  | 'TV'
  | 'NL'
  | 'RC'
  | 'AP';

export type TaxType = 'IVA' | 'IS' | 'NS';

/** Linha de documento devolvida pelo `InvoiceResource`. */
export interface InvoiceLine {
  line_number?: number;
  product_code: string;
  product_description: string;
  quantity: number;
  unit_of_measure?: string | null;
  unit_price: number;
  tax_point_date?: string | null;
  description?: string | null;
  credit_amount?: number;
  tax_type?: TaxType | null;
  tax_country_region?: string | null;
  tax_code?: string | null;
  tax_percentage?: number;
  tax_exemption_reason?: string | null;
  tax_exemption_code?: string | null;
}

export interface InvoicePayment {
  payment_mechanism?: string;
  payment_amount?: number;
  payment_date?: string;
}

export interface InvoiceReference {
  reference?: string;
  reason?: string;
  debit_amount?: number | null;
}

/** Documento fiscal serializado pelo `InvoiceResource`. */
export interface Invoice {
  id: string;
  header_id?: string;
  invoice_no?: string | null;
  invoice_status?: string | null;
  invoice_status_date?: string | null;
  source_billing?: string | null;
  source_id?: string | null;
  hash?: string | null;
  hash_control?: string | null;
  pdf_path?: string | null;
  pdf_url?: string | null;
  period?: number | null;
  invoice_date?: string | null;
  invoice_type?: InvoiceType | null;
  eac_code?: string | null;
  self_billing_indicator?: boolean;
  cash_vat_scheme_indicator?: boolean;
  third_parties_billing_indicator?: boolean;
  is_training?: boolean;
  system_entry_date?: string | null;
  customer_code?: string | null;
  ship_to_address_detail?: string | null;
  ship_to_city?: string | null;
  ship_to_country?: string | null;
  ship_from_address_detail?: string | null;
  ship_from_city?: string | null;
  ship_from_country?: string | null;
  tax_payable?: number;
  net_total?: number;
  gross_total?: number;
  lines?: InvoiceLine[];
  payments?: InvoicePayment[];
  references?: InvoiceReference[];
  created_at?: string | null;
  updated_at?: string | null;
}

/** Filtros aceites por `GET /api/v1/invoices` (ListInvoicesDTO). */
export interface InvoiceFilters {
  invoice_type?: string;
  start_date?: string;
  end_date?: string;
  id?: string;
  invoice_no?: string;
  customer_name?: string;
  customer_tax_id?: string;
  status?: string;
  per_page?: number;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/** Linha de documento enviada ao criar uma factura (payload do POST). */
export interface CreateInvoiceLine {
  product_code: string;
  product_description: string;
  quantity: number;
  unit_of_measure?: string;
  unit_price: number;
  description?: string;
  tax_type?: TaxType;
  tax_code?: string;
  tax_percentage?: number;
}

/** Payload do pedido de criação de factura (CreateInvoiceDTO). */
export interface CreateInvoicePayload {
  customer_code: string;
  customer_name?: string;
  customer_tax_id?: string;
  invoice_date: string;
  eac_code?: string;
  lines: CreateInvoiceLine[];
}
