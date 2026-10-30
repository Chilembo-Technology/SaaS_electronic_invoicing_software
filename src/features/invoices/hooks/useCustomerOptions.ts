import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '../../../contexts/AuthContext';
import { normalizeApiError } from '../../../features/auth/utils/apiError';
import { getCompanyId } from '../../settings/utils/session';
import { customerService } from '../../customers/services/customerService';
import type { Customer } from '../../customers/types';

/**
 * Carrega os clientes activos da empresa para usar como opções num Select
 * (ex.: formulário de criação de documentos). Pede uma página alargada
 * (per_page=100, máximo aceite pelo backend) em vez de paginar.
 */
export function useCustomerOptions() {
  const { user } = useAuth();
  const companyId = getCompanyId(user);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!companyId) {
      setCustomers([]);
      setError('Não foi possível identificar a empresa da sessão.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await customerService.getCustomers(companyId, {
        is_active: true,
        per_page: 100,
      });
      setCustomers(result.data);
    } catch (err) {
      setCustomers([]);
      setError(normalizeApiError(err).message);
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { customers, isLoading, error, reload };
}
