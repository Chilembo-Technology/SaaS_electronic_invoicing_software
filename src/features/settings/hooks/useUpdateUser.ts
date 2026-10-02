import { useCallback, useState } from 'react';

import { normalizeApiError } from '../../../features/auth/utils/apiError';
import { usersSettingsService } from '../services/usersSettingsService';
import type { UpdateUserPayload, UserListItem } from '../types/user.types';

/** Submete `POST /v1/users/update/{user_id}` com o erro normalizado (422 incluído). */
export function useUpdateUser() {
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const resetErrors = useCallback(() => {
    setError(null);
    setFieldErrors({});
  }, []);

  const update = useCallback(
    async (userId: string, payload: UpdateUserPayload): Promise<UserListItem> => {
      setIsUpdating(true);
      setError(null);
      setFieldErrors({});

      try {
        return await usersSettingsService.updateUser(userId, payload);
      } catch (err) {
        const normalized = normalizeApiError(err);
        setError(normalized.message);
        setFieldErrors(normalized.fieldErrors);
        throw normalized;
      } finally {
        setIsUpdating(false);
      }
    },
    [],
  );

  return { update, isUpdating, error, fieldErrors, resetErrors };
}
