import { useCallback, useState } from 'react';

import { normalizeApiError } from '../../../features/auth/utils/apiError';
import { usersSettingsService } from '../services/usersSettingsService';
import type { CreateUserPayload, UserListItem } from '../types/user.types';

/**
 * Submete `POST /v1/users` com o erro normalizado (422 incluído).
 * Espelho exacto de `useUpdateUser` — mesmos estados e mesma semântica de erro.
 */
export function useCreateUser() {
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const resetErrors = useCallback(() => {
    setError(null);
    setFieldErrors({});
  }, []);

  const create = useCallback(
    async (payload: CreateUserPayload): Promise<UserListItem> => {
      setIsCreating(true);
      setError(null);
      setFieldErrors({});

      try {
        return await usersSettingsService.createUser(payload);
      } catch (err) {
        const normalized = normalizeApiError(err);
        setError(normalized.message);
        setFieldErrors(normalized.fieldErrors);
        throw normalized;
      } finally {
        setIsCreating(false);
      }
    },
    [],
  );

  return { create, isCreating, error, fieldErrors, resetErrors };
}