import { orgApi } from '../lib/api';
import { Company, CreateCompanyDTO, UpdateCompanyDTO } from '../types/api';

/**
 * Serviço de empresas (organization_service).
 *
 * Rotas reais (routes/company_rooter/company_rooter.php, prefixo `v1/company`):
 *   POST   /v1/company/store
 *   GET    /v1/company/list
 *   PUT    /v1/company/update
 *   PUT    /v1/company/active/{id} | /disable/{id} | /move-to-trash/{id}
 *   GET    /v1/company/trash-can
 *   POST   /v1/company/restore
 *   DELETE /v1/company/permanently-delete/{id}
 *
 * Nota: os resources do Laravel devolvem os campos com os nomes da BD
 * (`company_name`, `tax_number`, `created_at`). O mapeamento para os nomes
 * usados na UI (`name`, `nif`, `createdAt`) acontece AQUI, no serviço — as
 * páginas nunca falam com o formato bruto da API.
 */

/** Formato bruto devolvido pelo organization_service. */
interface RawCompany {
  id?: string | number;
  company_name?: string;
  tax_number?: string;
  admin_email?: string;
  phone?: string;
  phone_number_alternative?: string;
  address?: string;
  city?: string;
  province?: string;
  country?: string;
  agt_certificate_number?: string;
  logo_path?: string | null;
  status?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  [key: string]: unknown;
}

/** Envelope padrão das respostas do backend. */
interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
}

/** Normaliza a empresa da API para o formato consumido pela UI. */
function mapCompany(raw: RawCompany | null | undefined): Company {
  const company = raw ?? {};
  return {
    id: company.id ?? '',
    name: company.company_name ?? '',
    nif: company.tax_number ?? '',
    email: company.admin_email ?? '',
    address: company.address ?? '',
    phone: company.phone ?? '',
    status: company.status ?? '',
    ativo: company.status === 'active',
    createdAt: company.created_at,
    updatedAt: company.updated_at,
    deletedAt: company.deleted_at ?? undefined,
    // Campos extra do backend preservados (Company tem index signature)
    company_name: company.company_name,
    tax_number: company.tax_number,
    admin_email: company.admin_email,
    city: company.city,
    province: company.province,
  };
}

/** Converte o DTO da UI (`name`/`nif`) para os campos exigidos pelo Laravel. */
function toCompanyPayload(data: CreateCompanyDTO): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    company_name: data.company_name ?? data.name,
    tax_number: data.tax_number ?? data.nif ?? data.taxId,
    admin_email: data.admin_email ?? data.email,
    phone: data.phone,
  };

  const optionalFields: (keyof CreateCompanyDTO)[] = [
    'address',
    'city',
    'province',
    'agt_certificate_number',
  ];

  optionalFields.forEach((field) => {
    const value = data[field];
    if (value !== undefined && value !== null && value !== '') {
      payload[field as string] = value;
    }
  });

  return payload;
}

export const organizationService = {
  async listCompanies(): Promise<Company[]> {
    const response = await orgApi.get<ApiEnvelope<RawCompany[]> | RawCompany[]>('/v1/company/list');
    const body = response.data;
    const list = Array.isArray(body) ? body : body?.data ?? [];
    return (list as RawCompany[]).map(mapCompany);
  },

  async createCompany(data: CreateCompanyDTO): Promise<Company> {
    const response = await orgApi.post<ApiEnvelope<RawCompany>>('/v1/company/store', toCompanyPayload(data));
    const body = response.data;
    const created = Array.isArray(body) ? body[0] : body?.data ?? (body as unknown as RawCompany);
    return mapCompany(created);
  },

  async updateCompany(data: UpdateCompanyDTO): Promise<Company> {
    const response = await orgApi.put<ApiEnvelope<RawCompany>>('/v1/company/update', {
      ...toCompanyPayload(data),
      company_id: data.company_id ?? data.id,
    });
    const body = response.data;
    const updated = Array.isArray(body) ? body[0] : body?.data ?? (body as unknown as RawCompany);
    return mapCompany(updated);
  },

  async activateCompany(id: string | number): Promise<Company> {
    const response = await orgApi.put<ApiEnvelope<RawCompany>>(`/v1/company/active/${id}`);
    return mapCompany(response.data?.data);
  },

  async disableCompany(id: string | number): Promise<Company> {
    const response = await orgApi.put<ApiEnvelope<RawCompany>>(`/v1/company/disable/${id}`);
    return mapCompany(response.data?.data);
  },

  async moveToTrash(id: string | number): Promise<void> {
    await orgApi.put(`/v1/company/move-to-trash/${id}`);
  },

  async listTrash(): Promise<Company[]> {
    const response = await orgApi.get<ApiEnvelope<RawCompany[]> | RawCompany[]>('/v1/company/trash-can');
    const body = response.data;
    const list = Array.isArray(body) ? body : body?.data ?? [];
    return (list as RawCompany[]).map(mapCompany);
  },

  async restoreCompanies(ids?: (string | number)[]): Promise<void> {
    await orgApi.post('/v1/company/restore', { ids: (ids ?? []).map((id) => String(id)) });
  },

  async deletePermanently(id: string | number): Promise<void> {
    await orgApi.delete(`/v1/company/permanently-delete/${id}`);
  },
};
