import { useCallback, useEffect, useState } from 'react';

import { normalizeApiError } from '../../auth/utils/apiError';
import { coreDataService } from '../services/coreDataService';
import type { Bank } from '../types/company.types';

/** Prefixo comum das falhas de carregamento do catálogo. */
export const BANKS_LOAD_ERROR = 'Falha ao carregar a lista de bancos.';

/**
 * Carrega o catálogo de bancos do Angola-Core-Data.
 *
 * Uma falha aqui NÃO pode bloquear o formulário da empresa: o erro é devolvido
 * em `error` para o `BankSelect` mostrar um aviso com botão de nova tentativa.
 */
export function useBanks() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      setBanks(await coreDataService.listBanks());
    } catch (err) {
      setBanks([]);
      setError(`${BANKS_LOAD_ERROR} ${normalizeApiError(err).message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { banks, isLoading, error, reload };
}
