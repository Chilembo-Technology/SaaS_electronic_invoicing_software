import { useCallback, useRef, useState } from 'react';

import { invoiceService } from '../services/invoiceService';
import type { InvoiceDateCheck } from '../types';

/**
 * Antes de emitir: se a data do documento for anterior a hoje em mais dias
 * úteis do que o configurado no fiscal_core, pede confirmação ao utilizador.
 * Nunca bloqueia: se a verificação falhar, a emissão segue (o backend regista
 * a emissão em log de qualquer forma).
 *
 * Uso: `if (!(await confirmDate(invoiceDate))) return;` e
 * `<BackdatedDateDialog {...dialogProps} />` na página.
 */
export function useBackdatedDateConfirmation() {
  const [pendingCheck, setPendingCheck] = useState<InvoiceDateCheck | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const resolverRef = useRef<((confirmed: boolean) => void) | null>(null);

  const confirmDate = useCallback(async (invoiceDate: string): Promise<boolean> => {
    let check: InvoiceDateCheck;
    setIsChecking(true);
    try {
      check = await invoiceService.checkInvoiceDate(invoiceDate);
    } catch {
      return true;
    } finally {
      setIsChecking(false);
    }

    if (!check.warning) return true;

    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setPendingCheck(check);
    });
  }, []);

  const settle = useCallback((confirmed: boolean) => {
    resolverRef.current?.(confirmed);
    resolverRef.current = null;
    setPendingCheck(null);
  }, []);

  return {
    confirmDate,
    isChecking,
    dialogProps: {
      check: pendingCheck,
      onConfirm: () => settle(true),
      onCancel: () => settle(false),
    },
  };
}
