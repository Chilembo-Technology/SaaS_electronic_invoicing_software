/**
 * Serviço da área de super-admin (organization_service):
 *   - GET /v1/company/list                       -> `listCompanies`
 *   - PUT /v1/company/financial-institution/{id} -> `setFinancialInstitution`
 *
 * O backend só devolve todas as empresas ao super-admin (os restantes papéis
 * recebem apenas a própria) e responde 403 às rotas de super-admin.
 */

import { orgApi } from '../../../lib/api';
import type { AdminCompany, AdminCompanyFilters, AdminCompanyPage } from '../types';

export const ADMIN_COMPANIES_PER_PAGE = 25;

interface RawCompany {
  id?: string | number;
  company_name?: string | null;
  tax_number?: string | null;
  admin_email?: string | null;
  phone?: string | null;
  city?: string | null;
  province?: string | null;
  status?: string | null;
  is_financial_institution?: boolean | null;
  created_at?: string | null;
}

interface ListEnvelope {
  data?: RawCompany[];
  meta?: { total?: number; current_page?: number; is_last_page?: boolean };
}

interface ItemEnvelope {
  data?: RawCompany;
}

export function mapAdminCompany(raw: RawCompany | null | undefined): AdminCompany {
  const company = raw ?? {};
  return {
    id: company.id != null ? String(company.id) : '',
    company_name: company.company_name ?? '',
    tax_number: company.tax_number ?? '',
    admin_email: company.admin_email ?? '',
    phone: company.phone ?? '',
    city: company.city ?? '',
    province: company.province ?? '',
    status: company.status ?? '',
    is_financial_institution: company.is_financial_institution === true,
    created_at: company.created_at ?? null,
  };
}

/** NIF angolano (só dígitos/letras, sem espaços) vs. pesquisa por nome. */
function looksLikeTaxNumber(term: string): boolean {
  return /^[0-9][0-9A-Z]{5,}$/i.test(term);
}

export function buildListParams(filters: AdminCompanyFilters, page: number): Record<string, string | number> {
  const params: Record<string, string | number> = { page, per_page: ADMIN_COMPANIES_PER_PAGE };
  const search = filters.search?.trim() ?? '';

  if (search) {
    if (looksLikeTaxNumber(search)) params.tax_number = search.toUpperCase();
    else params.company_name = search;
  }

  if (filters.status) params.status = filters.status;

  if (filters.financialInstitution === 'banks') params.is_financial_institution = 'true';
  if (filters.financialInstitution === 'non-banks') params.is_financial_institution = 'false';

  return params;
}

export const platformCompaniesService = {
  async listCompanies(filters: AdminCompanyFilters = {}, page = 1): Promise<AdminCompanyPage> {
    const response = await orgApi.get<ListEnvelope>('/v1/company/list', {
      params: buildListParams(filters, page),
    });
    const body = response.data ?? {};

    return {
      data: (body.data ?? []).map(mapAdminCompany),
      total: body.meta?.total ?? body.data?.length ?? 0,
      currentPage: body.meta?.current_page ?? page,
      isLastPage: body.meta?.is_last_page ?? true,
    };
  },

  /** Marca/desmarca a empresa como instituição financeira (apenas super-admin). */
  async setFinancialInstitution(companyId: string, isFinancialInstitution: boolean): Promise<AdminCompany> {
    const response = await orgApi.put<ItemEnvelope>(`/v1/company/financial-institution/${companyId}`, {
      is_financial_institution: isFinancialInstitution,
    });
    return mapAdminCompany(response.data?.data);
  },
};
