import { fiscalApi } from '../../../lib/api';
import type {
  PaginatedResponse,
  PaginationMeta,
  ProductCategory,
  ProductCategoryStatus,
} from '../types';

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

export interface ProductCategoryFilters {
  status?: ProductCategoryStatus;
  search?: string;
  page?: number;
  per_page?: number;
}

export const productCategoryService = {
  /**
   * Lista categorias (`GET /api/v1/product-categories/list`).
   *
   * As categorias são globais ao SaaS (sem empresa/header). Por omissão pede
   * `per_page=100` (máximo aceite pelo backend) para alimentar os dropdowns
   * sem paginação adicional.
   */
  async getCategories(
    filters: ProductCategoryFilters = {},
  ): Promise<PaginatedResponse<ProductCategory>> {
    const { status, search, page = 1, per_page = 100 } = filters;

    const response = await fiscalApi.get<PaginatedEnvelope<ProductCategory>>(
      '/product-categories/list',
      {
        params: {
          status: status || undefined,
          search: search || undefined,
          page,
          per_page,
        },
      },
    );

    const body = response.data;
    return {
      data: body.data ?? [],
      meta: body.meta ?? EMPTY_META,
    };
  },
};
