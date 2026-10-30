/**
 * Tipos do domínio da tabela de impostos (fiscal_core — SAF-T 2.5 TaxTableEntry).
 *
 * Espelham o contrato devolvido por `TaxTableEntryResource` e o payload aceite
 * por `POST/PUT /api/v1/tax-table-entries`.
 */

export type TaxType = 'IVA' | 'IS' | 'NS';

export type TaxCountryRegion = 'AO' | 'AO-CABI';

export type TaxStatusFilter = 'active' | 'inactive';

/** Entrada da tabela de impostos (SAF-T TaxTableEntry). */
export interface TaxEntry {
  id: string;
  header_id: string;
  tax_type: TaxType;
  tax_country_region: TaxCountryRegion | null;
  tax_code: string;
  description: string | null;
  tax_expiration_date: string | null;
  /** `decimal(4)` no Laravel — pode vir como string ("14.0000") ou number. */
  tax_percentage: number | string | null;
  tax_amount: number | string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

/** Filtros da listagem. `search` é resolvido no cliente; os restantes no servidor. */
export interface TaxFilters {
  search?: string;
  tax_type?: TaxType;
  status?: TaxStatusFilter;
  page?: number;
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

/** Payload de criação (POST). O `company_id` é adicionado pelo serviço. */
export interface CreateTaxEntryPayload {
  tax_type: TaxType;
  tax_code: string;
  tax_country_region: TaxCountryRegion | null;
  description: string | null;
  tax_expiration_date: string | null;
  tax_percentage: number | null;
  tax_amount: number | null;
  is_active: boolean;
}

/**
 * Payload de actualização (PUT). O backend só permite alterar `description` e
 * `tax_expiration_date` (tax_type/tax_code são imutáveis — regra do sistema).
 */
export interface UpdateTaxEntryPayload {
  description: string | null;
  tax_expiration_date: string | null;
}
