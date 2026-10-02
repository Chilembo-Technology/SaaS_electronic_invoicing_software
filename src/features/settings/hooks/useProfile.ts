import { useCallback, useEffect, useState } from 'react';

import { normalizeApiError } from '../../../features/auth/utils/apiError';
import { profileService } from '../services/profileService';
import type { ProfileData } from '../types/profile.types';

/** Carrega os dados do utilizador logado (`GET /v1/auth/me`). */
export function useProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      setProfile(await profileService.getProfile());
    } catch (err) {
      setError(normalizeApiError(err).message);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { profile, isLoading, error, refresh };
}
