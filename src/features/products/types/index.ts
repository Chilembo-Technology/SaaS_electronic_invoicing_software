/**
 * Tipos do domínio de produtos (fiscal_core — SAF-T 2.4 Product).
 *
 * Espelham o contrato devolvido por `ProductResource` e o payload aceite por
 * `POST/PUT /api/v1/products`, bem como as categorias (`ProductCategoryResource`).
 */

export type ProductType = 'P' | 'S' | 'O' | 'E' | 'I';

export type ProductStatusFilter = 'active' | 'inactive';

export type ProductCategoryStatus = 'active' | 'inactive';

/** Produto (SAF-T MasterFiles — Product) + campos comerciais SaaS. */
export interface Product {
  id: string;
  header_id: string;
  product_type: ProductType;
  product_code: string;
  product_group: string | null;
  product_description: string;
  product_number_code: string | null;
  un_number: string | null;
  category_id: string | null;
  is_active: boolean;
  is_stockable: boolean;
  is_inventory_only: boolean;
  is_on_promotion: boolean;
  unit_of_measure: string;
  unit_price: number | null;
  /** Imposto proposto nas linhas (catálogo global ou da empresa). */
  tax_table_entry_id: string | null;
  /** Motivo de isenção (taxa 0 %). */
  tax_exemption_code: string | null;
  tax: ProductTax | null;
  tax_exemption: { code: string; description: string } | null;
  expiration_date: string | null;
  image_path: string | null;
  created_at: string | null;
  updated_at: string | null;
}

/** Imposto do produto, tal como devolvido pelo `ProductResource`. */
export interface ProductTax {
  id: string;
  tax_type: 'IVA' | 'IS' | 'NS';
  tax_country_region: string;
  tax_code: string;
  tax_percentage: number;
  label: string;
  requires_exemption_reason: boolean;
}

/** Categoria comercial (global ao SaaS — sem dependência de empresa/header). */
export interface ProductCategory {
  id: string;
  name: string;
  description: string | null;
  status: ProductCategoryStatus;
  created_at: string | null;
  updated_at: string | null;
}

/** Filtros da listagem. Todos são resolvidos no servidor (endpoint `/list`). */
export interface ProductFilters {
  search?: string;
  product_type?: ProductType;
  category_id?: string;
  status?: ProductStatusFilter;
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

/** Campos comuns à criação e à actualização. */
export interface ProductPayloadBase {
  product_type: ProductType;
  product_group: string | null;
  product_description: string;
  product_number_code: string | null;
  un_number: string | null;
  category_id: string | null;
  is_stockable: boolean;
  is_inventory_only: boolean;
  is_on_promotion: boolean;
  unit_of_measure: string;
  unit_price: number | null;
  /** Vazio = IVA à taxa normal (14 %) por omissão no backend. */
  tax_table_entry_id: string | null;
  /** Obrigatório quando a taxa é 0 %. */
  tax_exemption_code: string | null;
  expiration_date: string | null;
}

/** Payload de criação (POST). O `is_active` só é definido na criação. */
export interface CreateProductPayload extends ProductPayloadBase {
  is_active: boolean;
}

/** Payload de actualização (PUT). O `is_active` é gerido via activate/desactivate. */
export type UpdateProductPayload = ProductPayloadBase;
