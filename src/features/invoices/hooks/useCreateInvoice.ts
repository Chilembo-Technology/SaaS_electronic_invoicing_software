import { useState } from 'react';

import { useAuth } from '../../../contexts/AuthContext';
import { normalizeApiError } from '../../../features/auth/utils/apiError';
import { getCompanyId } from '../../settings/utils/session';
import { invoiceService } from '../services/invoiceService';
import type { CreateInvoicePayload, Invoice } from '../types';

/** Mapa `campo_do_backend -> campo_do_formulário` para os erros 422 de topo. */
const FIELD_MAP: Record<string, string> = {
  customer_code: 'customerCode',
  customer_name: 'customerName',
  customer_tax_id: 'customerTaxId',
  invoice_date: 'invoiceDate',
  eac_code: 'eacCode',
};

/**
 * Submissão de uma nova factura (FT). Expõe o estado de carregamento, o erro
 * global, os erros por campo (422) e a factura criada (para o ecrã de sucesso).
 */
export function useCreateInvoice() {
  const { user } = useAuth();
  const companyId = getCompanyId(user);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);

  const createInvoice = async (
    payload: CreateInvoicePayload,
  ): Promise<Invoice | null> => {
    if (!companyId) {
      setError('Não foi possível identificar a empresa da sessão.');
      return null;
    }

    setIsLoading(true);
    setError(null);
    setFieldErrors({});
    setCreatedInvoice(null);

    try {
      const invoice = await invoiceService.createInvoice(companyId, payload, 'FT');
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

  return { createInvoice, isLoading, error, fieldErrors, createdInvoice, reset };
}
