import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '../../../contexts/AuthContext';
import { normalizeApiError } from '../../../features/auth/utils/apiError';
import { getCompanyId } from '../../settings/utils/session';
import { invoiceService } from '../services/invoiceService';
import type { Invoice, InvoiceFilters, PaginationMeta } from '../types';

const EMPTY_META: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
};

/** Remove filtros vazios para não enviar `undefined`/strings vazias à API. */
function sanitizeFilters(filters: InvoiceFilters): InvoiceFilters {
  const clean: InvoiceFilters = {};
  (Object.entries(filters) as [keyof InvoiceFilters, unknown][]).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      (clean as Record<string, unknown>)[key] = value;
    }
  });
  return clean;
}

/**
 * Estado da listagem de documentos fiscais (faturas), com filtros e paginação.
 */
export function useInvoices() {
  const { user } = useAuth();
  const companyId = getCompanyId(user);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(EMPTY_META);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<InvoiceFilters>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!companyId) {
      setInvoices([]);
      setMeta(EMPTY_META);
      setError('Não foi possível identificar a empresa da sessão.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await invoiceService.getInvoices(
        companyId,
        sanitizeFilters(filters),
        page,
      );
      setInvoices(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(normalizeApiError(err).message);
      setInvoices([]);
      setMeta(EMPTY_META);
    } finally {
      setIsLoading(false);
    }
  }, [companyId, filters, page]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    invoices,
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
