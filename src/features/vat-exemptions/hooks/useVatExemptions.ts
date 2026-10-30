import { useCallback, useEffect, useState } from 'react';

import { normalizeApiError } from '../../../features/auth/utils/apiError';
import { vatExemptionService } from '../services/vatExemptionService';
import type {
  PaginationMeta,
  VatExemption,
  VatExemptionFilters,
} from '../types';

const EMPTY_META: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
};

/**
 * A pesquisa é resolvida client-side (o endpoint `/list` não suporta `search`):
 * filtra por código ou descrição, sem distinguir maiúsculas/minúsculas.
 */
function matchesSearch(item: VatExemption, search?: string): boolean {
  const needle = search?.trim().toLowerCase();
  if (!needle) return true;
  return (
    item.code.toLowerCase().includes(needle) ||
    item.description.toLowerCase().includes(needle)
  );
}

/**
 * Estado da listagem de motivos de isenção de IVA, com filtros e paginação.
 * `status` é filtrado no servidor (`is_active`); `search` no cliente.
 */
export function useVatExemptions() {
  const [items, setItems] = useState<VatExemption[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(EMPTY_META);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<VatExemptionFilters>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await vatExemptionService.getVatExemptions({ ...filters, page });
      setItems(result.data.filter((item) => matchesSearch(item, filters.search)));
      setMeta(result.meta);
    } catch (err) {
      setError(normalizeApiError(err).message);
      setItems([]);
      setMeta(EMPTY_META);
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    items,
    meta,
    isLoading,
    error,
    page,
    filters,
    setPage,
    setFilters,
    refresh,
  };
}
