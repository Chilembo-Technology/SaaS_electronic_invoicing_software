import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Confirmação antes de emitir um documento com data muito anterior a hoje.
 * O serviço é substituído por um espião; o hook nunca bloqueia a emissão.
 */

const { serviceMocks } = vi.hoisted(() => ({
  serviceMocks: { checkInvoiceDate: vi.fn() },
}));

vi.mock('../services/invoiceService', () => ({ invoiceService: serviceMocks }));

import { useBackdatedDateConfirmation } from './useBackdatedDateConfirmation';

const backdated = {
  invoice_date: '2026-11-10',
  business_days_before_today: 6,
  limit_business_days: 5,
  warning: true,
  message: 'A data do documento (10/11/2026) é 6 dias úteis anterior a hoje (o habitual é até 5). Confirme que a data está correcta antes de emitir.',
};

describe('useBackdatedDateConfirmation', () => {
  beforeEach(() => {
    serviceMocks.checkInvoiceDate.mockReset();
  });

  it('segue sem perguntar quando a data está dentro do limite', async () => {
    serviceMocks.checkInvoiceDate.mockResolvedValue({ ...backdated, warning: false, message: null });
    const { result } = renderHook(() => useBackdatedDateConfirmation());

    let confirmed = false;
    await act(async () => {
      confirmed = await result.current.confirmDate('2026-11-11');
    });

    expect(confirmed).toBe(true);
    expect(serviceMocks.checkInvoiceDate).toHaveBeenCalledWith('2026-11-11');
    expect(result.current.dialogProps.check).toBeNull();
  });

  it('com aviso abre o diálogo e emite só se o utilizador confirmar', async () => {
    serviceMocks.checkInvoiceDate.mockResolvedValue(backdated);
    const { result } = renderHook(() => useBackdatedDateConfirmation());

    let pending!: Promise<boolean>;
    act(() => {
      pending = result.current.confirmDate('2026-11-10');
    });
    await waitFor(() => expect(result.current.dialogProps.check).toEqual(backdated));

    act(() => result.current.dialogProps.onConfirm());

    await expect(pending).resolves.toBe(true);
    expect(result.current.dialogProps.check).toBeNull();
  });

  it('com aviso não emite se o utilizador cancelar', async () => {
    serviceMocks.checkInvoiceDate.mockResolvedValue(backdated);
    const { result } = renderHook(() => useBackdatedDateConfirmation());

    let pending!: Promise<boolean>;
    act(() => {
      pending = result.current.confirmDate('2026-11-10');
    });
    await waitFor(() => expect(result.current.dialogProps.check).not.toBeNull());

    act(() => result.current.dialogProps.onCancel());

    await expect(pending).resolves.toBe(false);
  });

  it('não bloqueia a emissão se a verificação falhar', async () => {
    serviceMocks.checkInvoiceDate.mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useBackdatedDateConfirmation());

    let confirmed = false;
    await act(async () => {
      confirmed = await result.current.confirmDate('2026-11-10');
    });

    expect(confirmed).toBe(true);
  });
});
