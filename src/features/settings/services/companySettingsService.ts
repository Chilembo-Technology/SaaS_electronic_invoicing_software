/**
 * Serviço da sub-secção "Empresa" (organization_service).
 *
 * Rotas espelhadas de `organization_service/routes/company_rooter/company_rooter.php`
 * (prefixo `v1/company`, somado à raiz `/api` do cliente central):
 *   - GET /v1/company/list    -> `listCompanies`
 *   - PUT /v1/company/update  -> `updateCompany`
 *
 * ⚠️ `company/list` NÃO filtra automaticamente pela empresa do token: é
 * obrigatório enviar `?company_id=<uuid>` (senão devolve TODAS as empresas).
 */

import { orgApi } from '../../../lib/api';
import type { CompanySettings, UpdateCompanyPayload } from '../types/company.types';
import { buildCompanyFormData } from './formData';

interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
}

/** Formato bruto devolvido pelo `CompanyListResource`. */
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
  private_key_path?: string | null;
  status?: string;
}

const COMPANY_LIST_PATH = '/v1/company/list';
const COMPANY_UPDATE_PATH = '/v1/company/update';

export function mapCompany(raw: RawCompany | null | undefined): CompanySettings {
  const company = raw ?? {};
  return {
    id: company.id != null ? String(company.id) : '',
    company_name: company.company_name ?? '',
    tax_number: company.tax_number ?? '',
    admin_email: company.admin_email ?? '',
    phone: company.phone ?? '',
    phone_number_alternative: company.phone_number_alternative ?? '',
    address: company.address ?? '',
    city: company.city ?? '',
    province: company.province ?? '',
    country: company.country ?? '',
    agt_certificate_number: company.agt_certificate_number ?? '',
    private_key_path: company.private_key_path ?? null,
    status: company.status ?? '',
  };
}

export const companySettingsService = {
  /** Devolve a empresa do `company_id` indicado (ou `null` se não existir). */
  async getCompany(companyId: string): Promise<CompanySettings | null> {
    const response = await orgApi.get<ApiEnvelope<RawCompany[]> | RawCompany[]>(COMPANY_LIST_PATH, {
      params: { company_id: companyId, per_page: 1, page: 1 },
    });

    const body = response.data;
    const list = Array.isArray(body) ? body : body?.data ?? [];
    const first = (list as RawCompany[])[0];

    return first ? mapCompany(first) : null;
  },

  /** Atualiza a empresa (multipart; `_method=PUT` para o Laravel). */
  async updateCompany(payload: UpdateCompanyPayload): Promise<CompanySettings> {
    const formData = buildCompanyFormData(payload);

    const response = await orgApi.post<ApiEnvelope<RawCompany>>(COMPANY_UPDATE_PATH, formData, {
      // Não deixar o axios serializar o FormData como JSON (default da instância).
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const body = response.data;
    const updated = Array.isArray(body) ? body[0] : body?.data ?? (body as unknown as RawCompany);

    return mapCompany(updated as RawCompany);
  },
};
