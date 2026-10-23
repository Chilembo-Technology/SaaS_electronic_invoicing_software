import { fiscalApi } from '../../../lib/api';
import type {
  CreateVatExemptionPayload,
  PaginatedResponse,
  PaginationMeta,
  UpdateVatExemptionPayload,
  VatExemption,
  VatExemptionFilters,
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

export const vatExemptionService = {
  /**
   * Lista motivos de isenção (`GET /api/v1/vat-exemption-reasons/list`).
   *
   * O backend filtra por `is_active` (`true`/`false`) e pagina via `page`/
   * `per_page`; não existe `search` no endpoint, pelo que a pesquisa é aplicada
   * client-side no hook `useVatExemptions`.
   */
  async getVatExemptions(
    filters: VatExemptionFilters = {},
  ): Promise<PaginatedResponse<VatExemption>> {
    const { status, page = 1, per_page = 15 } = filters;

    const response = await fiscalApi.get<PaginatedEnvelope<VatExemption>>(
      '/vat-exemption-reasons/list',
      {
        params: {
          page,
          per_page,
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

  /** Devolve um único motivo (`GET /api/v1/vat-exemption-reasons/{code}`). */
  async getVatExemptionByCode(code: string): Promise<VatExemption> {
    const response = await fiscalApi.get<ApiEnvelope<VatExemption>>(
      `/vat-exemption-reasons/${encodeURIComponent(code)}`,
    );
    const body = response.data;
    return body.data ?? (body as unknown as VatExemption);
  },

  /** Cria um motivo (`POST /api/v1/vat-exemption-reasons`). */
  async createVatExemption(data: CreateVatExemptionPayload): Promise<VatExemption> {
    const response = await fiscalApi.post<ApiEnvelope<VatExemption>>(
      '/vat-exemption-reasons',
      data,
    );
    const body = response.data;
    return body.data ?? (body as unknown as VatExemption);
  },

  /** Actualiza um motivo (`PUT /api/v1/vat-exemption-reasons/{code}`). */
  async updateVatExemption(
    code: string,
    data: UpdateVatExemptionPayload,
  ): Promise<VatExemption> {
    const response = await fiscalApi.put<ApiEnvelope<VatExemption>>(
      `/vat-exemption-reasons/${encodeURIComponent(code)}`,
      data,
    );
    const body = response.data;
    return body.data ?? (body as unknown as VatExemption);
  },
};
