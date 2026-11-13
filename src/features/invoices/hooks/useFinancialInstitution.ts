import { useEffect, useState } from 'react';

import { useAuth } from '../../../contexts/AuthContext';
import { companySettingsService } from '../../settings/services/companySettingsService';
import { getCompanyId } from '../../settings/utils/session';

/**
 * Indica se a empresa da sessão é uma instituição financeira (banco) — a única
 * que pode emitir Factura Genérica (GF).
 *
 * Serve apenas para a UI (esconder opções / proteger a rota). A regra é
 * aplicada no backend: o fiscal_core devolve 403 às restantes empresas.
 * Em caso de erro assume `false` (fail-closed).
 */
export function useFinancialInstitution() {
  const { user } = useAuth();
  const companyId = getCompanyId(user);

  const [isFinancialInstitution, setIsFinancialInstitution] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    if (!companyId) {
      setIsFinancialInstitution(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    companySettingsService
      .getCompany(companyId)
      .then((company) => {
        if (!cancelled) setIsFinancialInstitution(company?.is_financial_institution === true);
      })
      .catch(() => {
        if (!cancelled) setIsFinancialInstitution(false);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [companyId]);

  return { isFinancialInstitution, isLoading };
}
