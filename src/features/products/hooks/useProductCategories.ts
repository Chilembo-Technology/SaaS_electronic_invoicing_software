import { useCallback, useEffect, useState } from 'react';

import { normalizeApiError } from '../../../features/auth/utils/apiError';
import { productCategoryService } from '../services/productCategoryService';
import type { ProductCategory } from '../types';

/**
 * Carrega as categorias activas para os dropdowns (listagem e formulário).
 * As categorias são globais ao SaaS, pelo que não dependem da empresa da sessão.
 */
export function useProductCategories() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await productCategoryService.getCategories({
        status: 'active',
        per_page: 100,
      });
      setCategories(result.data);
    } catch (err) {
      setError(normalizeApiError(err).message);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { categories, isLoading, error, reload: load };
}
