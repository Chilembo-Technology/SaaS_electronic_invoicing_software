import { fiscalApi } from '../../../lib/api';
import type {
  CreateInvoicePayload,
  Invoice,
  InvoiceFilters,
  InvoiceType,
  PaginatedResponse,
  PaginationMeta,
} from '../types';

interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

interface PaginatedEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T[];
  meta?: PaginationMeta;
}

const EMPTY_META: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
};

/**
 * Mapa tipo de documento -> endpoint de criação. Coincide com
 * `fiscal_core/routes/invoice_rooter/invoice_rooter.php`.
 */
const INVOICE_TYPE_ENDPOINTS: Record<string, string> = {
  FT: '/invoices/invoice',
  FR: '/invoices/invoice-receipt',
  PP: '/invoices/proforma',
  OR: '/invoices/quote',
  ND: '/invoices/debit-note',
  NC: '/invoices/credit-note',
  RG: '/invoices/receipt',
  GT: '/invoices/transport-guide',
  GR: '/invoices/delivery-note',
};

export const invoiceService = {
  /** Lista documentos com filtros e paginação (`GET /api/v1/invoices`). */
  async getInvoices(
    companyId: string,
    filters: InvoiceFilters = {},
    page = 1,
  ): Promise<PaginatedResponse<Invoice>> {
    const response = await fiscalApi.get<PaginatedEnvelope<Invoice>>('/invoices', {
      params: { company_id: companyId, page, ...filters },
    });
    const body = response.data;
    return {
      data: body.data ?? [],
      meta: body.meta ?? EMPTY_META,
    };
  },

  /** Devolve um único documento (`GET /api/v1/invoices/{id}`). */
  async getInvoiceById(companyId: string, id: string): Promise<Invoice> {
    const response = await fiscalApi.get<ApiEnvelope<Invoice>>(`/invoices/${id}`, {
      params: { company_id: companyId },
    });
    const body = response.data;
    return body.data ?? (body as unknown as Invoice);
  },

  /** Cria um documento fiscal (default FT — factura). */
  async createInvoice(
    companyId: string,
    payload: CreateInvoicePayload,
    type: InvoiceType = 'FT',
  ): Promise<Invoice> {
    const endpoint = INVOICE_TYPE_ENDPOINTS[type] ?? INVOICE_TYPE_ENDPOINTS.FT;
    const response = await fiscalApi.post<ApiEnvelope<Invoice>>(endpoint, {
      company_id: companyId,
      ...payload,
    });
    const body = response.data;
    return body.data ?? (body as unknown as Invoice);
  },
};
