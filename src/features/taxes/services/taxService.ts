import { fiscalApi } from '../../../lib/api';
import type {
  CreateTaxEntryPayload,
  PaginatedResponse,
  PaginationMeta,
  TaxEntry,
  TaxFilters,
  UpdateTaxEntryPayload,
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

export const taxService = {
  /**
   * Lista entradas da tabela de impostos (`GET /api/v1/tax-table-entries/list`).
   *
   * O backend resolve `company_id -> header_id` internamente. Os filtros de
   * `tax_type` e `is_active` são do servidor; `search` é aplicado no cliente.
   */
  async getTaxes(
    companyId: string,
    filters: TaxFilters = {},
  ): Promise<PaginatedResponse<TaxEntry>> {
    const { tax_type, status, page = 1, per_page = 15 } = filters;

    const response = await fiscalApi.get<PaginatedEnvelope<TaxEntry>>(
      '/tax-table-entries/list',
      {
        params: {
          company_id: companyId,
          page,
          per_page,
          tax_type: tax_type || undefined,
          is_active:
            status === 'active' ? 'true' : status === 'inactive' ? 'false' : undefined,
        },
      },
    );

    const body = response.data;
    return {
      data: body.data ?? [],
      meta: body.meta ?? EMPTY_META,
    };
  },

  /** Devolve uma única entrada (`GET /api/v1/tax-table-entries/{id}`). */
  async getTaxById(id: string): Promise<TaxEntry> {
    const response = await fiscalApi.get<ApiEnvelope<TaxEntry>>(
      `/tax-table-entries/${encodeURIComponent(id)}`,
    );
    const body = response.data;
    return body.data ?? (body as unknown as TaxEntry);
  },

  /** Cria uma entrada (`POST /api/v1/tax-table-entries`). */
  async createTax(companyId: string, data: CreateTaxEntryPayload): Promise<TaxEntry> {
    const response = await fiscalApi.post<ApiEnvelope<TaxEntry>>('/tax-table-entries', {
      company_id: companyId,
      ...data,
    });
    const body = response.data;
    return body.data ?? (body as unknown as TaxEntry);
  },

  /** Actualiza uma entrada (`PUT /api/v1/tax-table-entries/{id}`). */
  async updateTax(
    id: string,
    companyId: string,
    data: UpdateTaxEntryPayload,
  ): Promise<TaxEntry> {
    const response = await fiscalApi.put<ApiEnvelope<TaxEntry>>(
      `/tax-table-entries/${encodeURIComponent(id)}`,
      { company_id: companyId, ...data },
    );
    const body = response.data;
    return body.data ?? (body as unknown as TaxEntry);
  },

  /** Activa uma entrada (`PATCH /api/v1/tax-table-entries/{id}/activate`). */
  async activateTax(id: string): Promise<TaxEntry> {
    const response = await fiscalApi.patch<ApiEnvelope<TaxEntry>>(
      `/tax-table-entries/${encodeURIComponent(id)}/activate`,
    );
    const body = response.data;
    return body.data ?? (body as unknown as TaxEntry);
  },

  /** Desactiva uma entrada (`PATCH /api/v1/tax-table-entries/{id}/desactivate`). */
  async deactivateTax(id: string): Promise<TaxEntry> {
    const response = await fiscalApi.patch<ApiEnvelope<TaxEntry>>(
      `/tax-table-entries/${encodeURIComponent(id)}/desactivate`,
    );
    const body = response.data;
    return body.data ?? (body as unknown as TaxEntry);
  },
};
