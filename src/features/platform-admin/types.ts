/**
 * Gestão de empresas da plataforma (super-admin) — organization_service.
 */

/** Empresa na listagem do super-admin (subconjunto do `CompanyListResource`). */
export interface AdminCompany {
  id: string;
  company_name: string;
  tax_number: string;
  admin_email: string;
  phone: string;
  city: string;
  province: string;
  status: string;
  /** Instituição financeira (banco) — única que pode emitir Factura Genérica. */
  is_financial_institution: boolean;
  created_at: string | null;
}

export type FinancialInstitutionFilter = 'all' | 'banks' | 'non-banks';

export interface AdminCompanyFilters {
  search?: string;
  status?: string;
  financialInstitution?: FinancialInstitutionFilter;
}

export interface AdminCompanyPage {
  data: AdminCompany[];
  total: number;
  currentPage: number;
  isLastPage: boolean;
}
