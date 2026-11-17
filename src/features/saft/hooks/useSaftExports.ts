import { useCallback, useEffect, useRef, useState } from 'react';

import { normalizeApiError } from '../../auth/utils/apiError';
import { saftExportService } from '../services/saftExportService';
import type { SaftExport, SaftExportRequest } from '../types';

/** Intervalo do polling enquanto houver exports pendentes ou em curso. */
export const SAFT_POLL_INTERVAL_MS = 4000;

export function isSaftExportRunning(item: SaftExport): boolean {
  return item.status === 'pending' || item.status === 'processing';
}

/**
 * Histórico de exports SAF-T com polling automático enquanto algum estiver a
 * ser gerado, e o pedido de um novo export.
 */
export function useSaftExports() {
  const [items, setItems] = useState<SaftExport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    try {
      const { data } = await saftExportService.list();
      setItems(data);
      setError(null);
    } catch (err) {
      setError(normalizeApiError(err).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (items.some(isSaftExportRunning)) {
      timer.current = setTimeout(() => void load(), SAFT_POLL_INTERVAL_MS);
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [items, load]);

  const requestExport = useCallback(
    async (period: SaftExportRequest): Promise<boolean> => {
      setIsRequesting(true);
      setError(null);
      setFieldErrors({});
      try {
        await saftExportService.request(period);
        await load();
        return true;
      } catch (err) {
        const normalized = normalizeApiError(err);
        // 409: já há um export em curso para o período (o backend explica).
        const body = (err as { response?: { data?: { message?: string } } })?.response?.data;
        setError(normalized.status === 409 && body?.message ? body.message : normalized.message);
        setFieldErrors(normalized.fieldErrors);
        await load();
        return false;
      } finally {
        setIsRequesting(false);
      }
    },
    [load],
  );

  const download = useCallback(async (id: string) => {
    try {
      const { url } = await saftExportService.downloadUrl(id);
      window.location.assign(url);
    } catch (err) {
      setError(normalizeApiError(err).message);
    }
  }, []);

  return { items, isLoading, isRequesting, error, fieldErrors, requestExport, download, reload: load };
}
