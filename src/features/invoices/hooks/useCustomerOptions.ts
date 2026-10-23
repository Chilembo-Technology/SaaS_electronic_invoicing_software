import { useEffect, useState } from 'react';

import { useAuth } from '../../../contexts/AuthContext';
import { normalizeApiError } from '../../../features/auth/utils/apiError';
import { getCompanyId } from '../../settings/utils/session';
import { customerService } from '../../customers/services/customerService';
import type { Customer } from '../../customers/types';

/**
 * Carrega os clientes activos da empresa para usar como opções num Select
 * (ex.: formulário de criação de documentos). Pede uma página alargada em vez
 * de paginar — cobre o caso comum de empresas com até 200 clientes.
 */
export function useCustomerOptions() {
  const { user } = useAuth();
  const companyId = getCompanyId(user);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
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
          per_page: 200,
        });
        if (active) setCustomers(result.data);
      } catch (err) {
        if (active) {
          setCustomers([]);
          setError(normalizeApiError(err).message);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [companyId]);

  return { customers, isLoading, error };
}
