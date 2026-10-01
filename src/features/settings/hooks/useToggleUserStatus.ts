import { useCallback, useState } from 'react';

import { normalizeApiError } from '../../../features/auth/utils/apiError';
import { usersSettingsService } from '../services/usersSettingsService';

/**
 * Ativa/desativa um utilizador (`PUT /v1/users/active|desactive`).
 * O backend espera sempre um array `ids` — aqui enviamos sempre um só.
 */
export function useToggleUserStatus() {
  const [isToggling, setIsToggling] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const setStatus = useCallback(async (userId: string, activate: boolean): Promise<void> => {
    setIsToggling(true);
    setError(null);

    try {
      if (activate) {
        await usersSettingsService.activateUsers([userId]);
      } else {
        await usersSettingsService.deactivateUsers([userId]);
      }
    } catch (err) {
      const normalized = normalizeApiError(err);
      setError(normalized.message);
      throw normalized;
    } finally {
      setIsToggling(false);
    }
  }, []);

  return { setStatus, isToggling, error };
}
