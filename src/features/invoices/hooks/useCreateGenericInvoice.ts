import { useState } from 'react';

import { useAuth } from '../../../contexts/AuthContext';
import { normalizeApiError } from '../../../features/auth/utils/apiError';
import { getCompanyId } from '../../settings/utils/session';
import { invoiceService } from '../services/invoiceService';
import type { CreateGenericInvoicePayload, Invoice } from '../types';

/**
 * Mapa `campo_do_backend -> campo_do_formulário` para os erros 422 de topo.
 * Os erros por conta/movimento mantêm a chave do Laravel
 * (ex.: `accounts.0.currency_code`, `accounts.0.lines.1.movement_at`).
 */
const FIELD_MAP: Record<string, string> = {
  customer_code: 'customerCode',
  invoice_date: 'invoiceDate',
  currency_code: 'currencyCode',
  billing_period_start: 'billingPeriodStart',
  billing_period_end: 'billingPeriodEnd',
  accounts: 'accounts',
};

/** Submissão de uma Factura Genérica (GF). */
export function useCreateGenericInvoice() {
  const { user } = useAuth();
  const companyId = getCompanyId(user);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);

  const createGenericInvoice = async (payload: CreateGenericInvoicePayload): Promise<Invoice | null> => {
    if (!companyId) {
      setError('Não foi possível identificar a empresa da sessão.');
      return null;
    }

    setIsLoading(true);
    setError(null);
    setFieldErrors({});
    setCreatedInvoice(null);

    try {
      const invoice = await invoiceService.createGenericInvoice(companyId, payload);
      setCreatedInvoice(invoice);
      return invoice;
    } catch (err) {
      const normalized = normalizeApiError(err, FIELD_MAP);
      setError(normalized.message);
      setFieldErrors(normalized.fieldErrors);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = (): void => {
    setCreatedInvoice(null);
    setError(null);
    setFieldErrors({});
  };

  return { createGenericInvoice, isLoading, error, fieldErrors, createdInvoice, reset };
}
