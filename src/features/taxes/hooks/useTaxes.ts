import { useCallback, useEffect, useState } from 'react';

import { toast } from 'sonner';

import { useAuth } from '../../../contexts/AuthContext';
import { normalizeApiError } from '../../../features/auth/utils/apiError';
import { getCompanyId } from '../../settings/utils/session';
import { taxService } from '../services/taxService';
import type { PaginationMeta, TaxEntry, TaxFilters } from '../types';

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
function matchesSearch(item: TaxEntry, search?: string): boolean {
  const needle = search?.trim().toLowerCase();
  if (!needle) return true;
  return (
    item.tax_code.toLowerCase().includes(needle) ||
    (item.description ?? '').toLowerCase().includes(needle)
  );
}

/**
 * Estado da listagem da tabela de impostos, com filtros, paginação e a mutação
 * de activar/desactivar (`PATCH /{id}/activate|desactivate`).
 */
export function useTaxes() {
  const { user } = useAuth();
  const companyId = getCompanyId(user);

  const [items, setItems] = useState<TaxEntry[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(EMPTY_META);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<TaxFilters>({});
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
      const result = await taxService.getTaxes(companyId, { ...filters, page });
      setItems(result.data.filter((item) => matchesSearch(item, filters.search)));
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

  /** Activa (`active=true`) ou desactiva (`active=false`) e recarrega a lista. */
  const toggleActive = useCallback(
    async (id: string, active: boolean): Promise<boolean> => {
      setTogglingId(id);
      try {
        if (active) {
          await taxService.activateTax(id);
          toast.success('Imposto activado com sucesso.');
        } else {
          await taxService.deactivateTax(id);
          toast.success('Imposto desactivado com sucesso.');
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
