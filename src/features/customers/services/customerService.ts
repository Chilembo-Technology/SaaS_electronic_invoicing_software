import { fiscalApi } from '../../../lib/api';
import type {
  CreateCustomerPayload,
  Customer,
  CustomerFilters,
  PaginatedResponse,
  PaginationMeta,
  UpdateCustomerPayload,
} from '../types';

/** Envelope genérico devolvido pelos endpoints do `fiscal_core`. */
interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

/** Envelope de listagem paginada (`GET /customers/list`). */
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

/** Acções suportadas pelo endpoint de activação (`PATCH /customers/{id}/...`). */
export type CustomerStatusAction = 'activate' | 'desactivate';

export const customerService = {
  /** `GET /customers/list` — listagem paginada com pesquisa/filtros server-side. */
  async getCustomers(
    companyId: string,
    filters: CustomerFilters = {},
  ): Promise<PaginatedResponse<Customer>> {
    const { search, is_active, type, page = 1, per_page = 15 } = filters;

    const response = await fiscalApi.get<PaginatedEnvelope<Customer>>('/customers/list', {
      params: {
        company_id: companyId,
        page,
        per_page,
        search: search?.trim() || undefined,
        is_active: is_active === undefined ? undefined : is_active,
        type: type || undefined,
      },
    });

    const body = response.data;
    return {
      data: body.data ?? [],
      meta: body.meta ?? EMPTY_META,
    };
  },

  /** `GET /customers/{id}` — detalhe de um cliente. */
  async getCustomerById(id: string): Promise<Customer> {
    const response = await fiscalApi.get<ApiEnvelope<Customer>>(
      `/customers/${encodeURIComponent(id)}`,
    );
    const body = response.data;
    return body.data ?? (body as unknown as Customer);
  },

  /** `POST /customers` — criação de um cliente. */
  async createCustomer(companyId: string, data: CreateCustomerPayload): Promise<Customer> {
    const response = await fiscalApi.post<ApiEnvelope<Customer>>('/customers', {
      company_id: companyId,
      ...data,
    });
    const body = response.data;
    return body.data ?? (body as unknown as Customer);
  },

  /** `PUT /customers/{id}` — actualização de um cliente. */
  async updateCustomer(
    id: string,
    companyId: string,
    data: UpdateCustomerPayload,
  ): Promise<Customer> {
    const response = await fiscalApi.put<ApiEnvelope<Customer>>(
      `/customers/${encodeURIComponent(id)}`,
      {
        company_id: companyId,
        ...data,
      },
    );
    const body = response.data;
    return body.data ?? (body as unknown as Customer);
  },

  /** `PATCH /customers/{id}/{activate|desactivate}` — alterna o estado de activação. */
  async toggleCustomerStatus(id: string, action: CustomerStatusAction): Promise<Customer> {
    const response = await fiscalApi.patch<ApiEnvelope<Customer>>(
      `/customers/${encodeURIComponent(id)}/${action}`,
    );
    const body = response.data;
    return body.data ?? (body as unknown as Customer);
  },
};
