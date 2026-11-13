import { useCallback, useEffect, useState } from 'react';

import { normalizeApiError } from '../../auth/utils/apiError';
import { platformCompaniesService } from '../services/platformCompaniesService';
import type { AdminCompany, AdminCompanyFilters } from '../types';

/**
 * Listagem de empresas do super-admin, com filtros, paginação e substituição
 * imediata de uma linha depois de uma alteração (sem recarregar a lista).
 */
export function useAdminCompanies() {
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [filters, setFilters] = useState<AdminCompanyFilters>({ financialInstitution: 'all' });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLastPage, setIsLastPage] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await platformCompaniesService.listCompanies(filters, page);
      setCompanies(result.data);
      setTotal(result.total);
      setIsLastPage(result.isLastPage);
    } catch (err) {
      setError(normalizeApiError(err).message);
      setCompanies([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const applyFilters = (next: AdminCompanyFilters) => {
    setPage(1);
    setFilters(next);
  };

  /** Substitui a empresa alterada na lista (ou remove-a se deixar de cumprir o filtro). */
  const replaceCompany = (updated: AdminCompany) => {
    setCompanies((current) =>
      current
        .map((company) => (company.id === updated.id ? { ...company, ...updated } : company))
        .filter((company) => {
          if (filters.financialInstitution === 'banks') return company.is_financial_institution;
          if (filters.financialInstitution === 'non-banks') return !company.is_financial_institution;
          return true;
        }),
    );
  };

  return {
    companies,
    filters,
    applyFilters,
    page,
    setPage,
    total,
    isLastPage,
    isLoading,
    error,
    refresh,
    replaceCompany,
  };
}
