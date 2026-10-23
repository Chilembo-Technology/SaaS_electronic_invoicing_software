import { useCallback, useEffect, useState } from 'react';

import { toast } from 'sonner';

import { useAuth } from '../../../contexts/AuthContext';
import { normalizeApiError } from '../../../features/auth/utils/apiError';
import { getCompanyId } from '../../settings/utils/session';
import { customerService } from '../services/customerService';
import type { Customer, CustomerFilters, PaginationMeta } from '../types';

const EMPTY_META: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
};

/**
 * Estado da listagem de clientes, com filtros, paginação e a mutação de
 * activar/desactivar (`PATCH /customers/{id}/activate|desactivate`).
 *
 * Ao contrário de `taxes`, a pesquisa é resolvida server-side (o endpoint
 * `/customers/list` suporta `search`, `type` e `is_active`).
 */
export function useCustomers() {
  const { user } = useAuth();
  const companyId = getCompanyId(user);

  const [items, setItems] = useState<Customer[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(EMPTY_META);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<CustomerFilters>({});
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
      const result = await customerService.getCustomers(companyId, { ...filters, page });
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

  const toggleStatus = useCallback(
    async (id: string, active: boolean): Promise<boolean> => {
      setTogglingId(id);
      try {
        await customerService.toggleCustomerStatus(id, active ? 'activate' : 'desactivate');
        toast.success(active ? 'Cliente activado com sucesso.' : 'Cliente desactivado com sucesso.');
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
    toggleStatus,
  };
}
