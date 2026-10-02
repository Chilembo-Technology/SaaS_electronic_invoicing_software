import { useCallback, useState } from 'react';

import { normalizeApiError } from '../../../features/auth/utils/apiError';
import { companySettingsService } from '../services/companySettingsService';
import type { CompanySettings, UpdateCompanyPayload } from '../types/company.types';

/**
 * Submete `PUT /v1/company/update`. Devolve o erro normalizado (incl. 422 por
 * campo) para o formulário poder mostrá-lo inline / no `FormAlert`.
 */
export function useUpdateCompany() {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const resetErrors = useCallback(() => {
    setError(null);
    setFieldErrors({});
  }, []);

  const save = useCallback(async (payload: UpdateCompanyPayload): Promise<CompanySettings> => {
    setIsSaving(true);
    setError(null);
    setFieldErrors({});

    try {
      return await companySettingsService.updateCompany(payload);
    } catch (err) {
      const normalized = normalizeApiError(err);
      setError(normalized.message);
      setFieldErrors(normalized.fieldErrors);
      throw normalized;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return { save, isSaving, error, fieldErrors, resetErrors };
}
