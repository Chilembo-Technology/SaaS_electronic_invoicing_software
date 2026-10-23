import { fiscalApi } from '../../../lib/api';
import type {
  CreateProductPayload,
  PaginatedResponse,
  PaginationMeta,
  Product,
  ProductFilters,
  UpdateProductPayload,
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

/**
 * Monta o corpo multipart/form-data do produto. O backend aceita os campos
 * como `application/json` mas a imagem exige multipart; para manter um único
 * caminho de escrita, enviamos sempre FormData. Campos opcionais vazios são
 * omitidos (o Laravel converte-os em `null` no DTO).
 */
function buildProductFormData(
  companyId: string,
  data: CreateProductPayload | UpdateProductPayload,
  image?: File | null,
): FormData {
  const form = new FormData();

  form.append('company_id', companyId);
  form.append('product_type', data.product_type);
  form.append('product_code', data.product_code);
  form.append('product_description', data.product_description);
  form.append('unit_of_measure', data.unit_of_measure);

  if (data.product_group) form.append('product_group', data.product_group);
  if (data.product_number_code) {
    form.append('product_number_code', data.product_number_code);
  }
  if (data.un_number) form.append('un_number', data.un_number);
  if (data.category_id) form.append('category_id', data.category_id);

  if (data.unit_price !== null) {
    form.append('unit_price', String(data.unit_price));
  }
  if (data.expiration_date) form.append('expiration_date', data.expiration_date);

  form.append('is_stockable', data.is_stockable ? 'true' : 'false');
  form.append('is_inventory_only', data.is_inventory_only ? 'true' : 'false');
  form.append('is_on_promotion', data.is_on_promotion ? 'true' : 'false');

  if ('is_active' in data) {
    form.append('is_active', data.is_active ? 'true' : 'false');
  }

  if (image) form.append('image', image);

  return form;
}

export const productService = {
  /**
   * Lista produtos (`GET /api/v1/products/list`).
   *
   * O backend resolve `company_id -> header_id` internamente e suporta os
   * filtros de `search`, `product_type`, `category_id` e `is_active` no servidor.
   */
  async getProducts(
    companyId: string,
    filters: ProductFilters = {},
  ): Promise<PaginatedResponse<Product>> {
    const {
      search,
      product_type,
      category_id,
      status,
      page = 1,
      per_page = 15,
    } = filters;

    const response = await fiscalApi.get<PaginatedEnvelope<Product>>(
      '/products/list',
      {
        params: {
          company_id: companyId,
          page,
          per_page,
          search: search || undefined,
          product_type: product_type || undefined,
          category_id: category_id || undefined,
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

  /** Devolve um produto (`GET /api/v1/products/{id}`). O `company_id` vai na query. */
  async getProductById(id: string, companyId: string): Promise<Product> {
    const response = await fiscalApi.get<ApiEnvelope<Product>>(
      `/products/${encodeURIComponent(id)}`,
      { params: { company_id: companyId } },
    );
    const body = response.data;
    return body.data ?? (body as unknown as Product);
  },

  /** Cria um produto (`POST /api/v1/products`) — multipart para suportar imagem. */
  async createProduct(
    companyId: string,
    data: CreateProductPayload,
    image?: File | null,
  ): Promise<Product> {
    const response = await fiscalApi.post<ApiEnvelope<Product>>(
      '/products',
      buildProductFormData(companyId, data, image),
    );
    const body = response.data;
    return body.data ?? (body as unknown as Product);
  },

  /** Actualiza um produto (`PUT /api/v1/products/{id}`). */
  async updateProduct(
    id: string,
    companyId: string,
    data: UpdateProductPayload,
    image?: File | null,
  ): Promise<Product> {
    const response = await fiscalApi.put<ApiEnvelope<Product>>(
      `/products/${encodeURIComponent(id)}`,
      buildProductFormData(companyId, data, image),
    );
    const body = response.data;
    return body.data ?? (body as unknown as Product);
  },

  /** Activa um produto (`PATCH /api/v1/products/{id}/activate`). */
  async activateProduct(id: string): Promise<Product> {
    const response = await fiscalApi.patch<ApiEnvelope<Product>>(
      `/products/${encodeURIComponent(id)}/activate`,
    );
    const body = response.data;
    return body.data ?? (body as unknown as Product);
  },

  /** Desactiva um produto (`PATCH /api/v1/products/{id}/desactivate`). */
  async deactivateProduct(id: string): Promise<Product> {
    const response = await fiscalApi.patch<ApiEnvelope<Product>>(
      `/products/${encodeURIComponent(id)}/desactivate`,
    );
    const body = response.data;
    return body.data ?? (body as unknown as Product);
  },
};
