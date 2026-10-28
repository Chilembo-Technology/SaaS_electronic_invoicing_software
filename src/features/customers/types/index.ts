/** Tipos da feature de clientes (SAF-T 2.5 MasterFiles → Customer). */

/** Tipo de cliente conforme o backend (`normal` ou `empresa`). */
export type CustomerType = 'normal' | 'empresa';

/** Estado de activação usado nos filtros da lista. */
export type CustomerStatusFilter = 'active' | 'inactive';

/** Registo devolvido pelo backend (CustomerResource). */
export interface Customer {
  id: string;
  header_id: string;
  customer_code: string;
  account_id: string | null;
  customer_tax_id: string;
  company_name: string;
  type: CustomerType;
  contact: string | null;
  billing_building_number: string | null;
  billing_street_name: string | null;
  billing_address_detail: string;
  billing_city: string;
  billing_postal_code: string | null;
  billing_province: string | null;
  billing_country: string | null;
  telephone: string | null;
  fax: string | null;
  email: string | null;
  website: string | null;
  self_billing_indicator: boolean;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

/** Filtros suportados pelo endpoint `GET /customers/list`. */
export interface CustomerFilters {
  search?: string;
  is_active?: boolean;
  type?: CustomerType;
  page?: number;
  per_page?: number;
}

/** Metadados de paginação devolvidos pelo Laravel (`paginate()`). */
export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

/** Resposta paginada normalizada pelo serviço. */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/** Payload de criação (`POST /customers`). */
export interface CreateCustomerPayload { 
  customer_tax_id: string;
  company_name: string;
  type: CustomerType;
  billing_address_detail: string;
  billing_city: string;
  contact?: string | null;
  email?: string | null;
  telephone?: string | null;
  fax?: string | null;
  website?: string | null;
  billing_building_number?: string | null;
  billing_street_name?: string | null;
  billing_postal_code?: string | null;
  billing_province?: string | null;
  billing_country?: string | null;
  self_billing_indicator?: boolean;
  is_active?: boolean;
}

/** Payload de actualização (`PUT /customers/{id}`). */
export type UpdateCustomerPayload = Partial<CreateCustomerPayload>;
