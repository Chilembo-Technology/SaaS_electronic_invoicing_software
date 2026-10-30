import { useCallback, useEffect, useState } from 'react';

import { toast } from 'sonner';

import { useAuth } from '../../../contexts/AuthContext';
import { normalizeApiError } from '../../../features/auth/utils/apiError';
import { getCompanyId } from '../../settings/utils/session';
import { productService } from '../services/productService';
import type { PaginationMeta, Product, ProductFilters } from '../types';

const EMPTY_META: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
};

/**
 * Estado da listagem de produtos, com filtros, paginação e a mutação de
 * activar/desactivar (`PATCH /{id}/activate|desactivate`). Ao contrário da
 * tabela de impostos, todos os filtros (incluindo `search`) são resolvidos
 * no servidor.
 */
export function useProducts() {
  const { user } = useAuth();
  const companyId = getCompanyId(user);

  const [items, setItems] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(EMPTY_META);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ProductFilters>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!companyId) {
      setItems([]);
      setMeta(EMPTY_META);
      setError('Não foi possível identificar a empresa da sessão.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await productService.getProducts(companyId, { ...filters, page });
      setItems(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(normalizeApiError(err).message);
      setItems([]);
      setMeta(EMPTY_META);
    } finally {
      setIsLoading(false);
    }
  }, [companyId, filters, page]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const toggleActive = useCallback(
    async (id: string, active: boolean): Promise<boolean> => {
      setTogglingId(id);
      try {
        if (active) {
          await productService.activateProduct(id);
          toast.success('Produto activado com sucesso.');
        } else {
          await productService.deactivateProduct(id);
          toast.success('Produto desactivado com sucesso.');
        }
        await refresh();
        return true;
      } catch (err) {
        toast.error(normalizeApiError(err).message);
        return false;
      } finally {
        setTogglingId(null);
      }
    },
    [refresh],
  );

  return {
    items,
    meta,
    isLoading,
    error,
    page,
    filters,
    togglingId,
    setPage,
    setFilters,
    refresh,
    toggleActive,
  };
}
