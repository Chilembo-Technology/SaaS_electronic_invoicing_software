import { useCallback, useEffect, useState } from 'react';

import { normalizeApiError } from '../../../features/auth/utils/apiError';
import { usersSettingsService } from '../services/usersSettingsService';
import type { UserListItem } from '../types/user.types';

/**
 * Lista os utilizadores (`GET /v1/users/list`, `per_page=100`).
 * A filtragem por papel/estado é feita no cliente (o backend não filtra por
 * `role`).
 */
export function useUsers() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { users: list } = await usersSettingsService.listUsers({ per_page: 100, page: 1 });
      setUsers(list);
    } catch (err) {
      setError(normalizeApiError(err).message);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { users, isLoading, error, refresh, setUsers };
}
