import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '../../../contexts/AuthContext';
import { normalizeApiError } from '../../../features/auth/utils/apiError';
import { companySettingsService } from '../services/companySettingsService';
import type { CompanySettings } from '../types/company.types';
import { getCompanyId } from '../utils/session';

/**
 * Carrega a empresa do utilizador autenticado (`GET /v1/company/list`).
 * O `company_id` vem do `AuthContext` (contexto multi-tenant).
 */
export function useCompany() {
  const { user } = useAuth();
  const companyId = getCompanyId(user);

  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!companyId) {
      setCompany(null);
      setError('Não foi possível identificar a empresa da sessão.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await companySettingsService.getCompany(companyId);
      setCompany(result);
    } catch (err) {
      setError(normalizeApiError(err).message);
      setCompany(null);
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { company, companyId, isLoading, error, refresh, setCompany };
}
