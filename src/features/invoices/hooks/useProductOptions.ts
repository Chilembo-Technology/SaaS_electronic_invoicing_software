import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '../../../contexts/AuthContext';
import { normalizeApiError } from '../../../features/auth/utils/apiError';
import { getCompanyId } from '../../settings/utils/session';
import { productService } from '../../products/services/productService';
import type { Product } from '../../products/types';

/**
 * Carrega os produtos activos da empresa para usar como opções num Select
 * (ex.: linhas do formulário de criação de documentos). Pede uma página
 * alargada (per_page=100, máximo aceite pelo backend) em vez de paginar.
 */
export function useProductOptions() {
  const { user } = useAuth();
  const companyId = getCompanyId(user);

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!companyId) {
      setProducts([]);
      setError('Não foi possível identificar a empresa da sessão.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await productService.getProducts(companyId, {
        status: 'active',
        per_page: 100,
      });
      setProducts(result.data);
    } catch (err) {
      setProducts([]);
      setError(normalizeApiError(err).message);
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { products, isLoading, error, reload };
}
