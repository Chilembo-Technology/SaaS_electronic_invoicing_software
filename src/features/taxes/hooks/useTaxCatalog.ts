import { useEffect, useState } from 'react';

import { normalizeApiError } from '../../auth/utils/apiError';
import { fetchTaxCatalog, type TaxCatalog } from '../catalog';

const EMPTY: TaxCatalog = { options: [], defaultId: null, exemptionReasons: [] };

/**
 * Catálogo de impostos (opções + motivos de isenção) para os seletores do
 * produto e das linhas dos documentos.
 */
export function useTaxCatalog() {
  const [catalog, setCatalog] = useState<TaxCatalog>(EMPTY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchTaxCatalog()
      .then((result) => {
        if (!cancelled) setCatalog(result);
      })
      .catch((err) => {
        if (!cancelled) setError(normalizeApiError(err).message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { ...catalog, isLoading, error };
}
