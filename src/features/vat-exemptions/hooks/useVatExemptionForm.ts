import { useCallback, useEffect, useState } from 'react';

import { toast } from 'sonner';

import { normalizeApiError } from '../../../features/auth/utils/apiError';
import { vatExemptionService } from '../services/vatExemptionService';
import type { VatExemption, VatExemptionType } from '../types';

export interface VatExemptionFormValues {
  code: string;
  description: string;
  legal_basis: string;
  exemption_type: VatExemptionType | '';
  description_detail: string;
  is_active: boolean;
}

export const EMPTY_FORM: VatExemptionFormValues = {
  code: '',
  description: '',
  legal_basis: '',
  exemption_type: '',
  description_detail: '',
  is_active: true,
};

function validate(values: VatExemptionFormValues): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!values.code.trim()) {
    errors.code = 'O código é obrigatório.';
  } else if (values.code.trim().length > 3) {
    errors.code = 'O código não pode exceder 3 caracteres.';
  }

  if (!values.description.trim()) {
    errors.description = 'A descrição é obrigatória.';
  } else if (values.description.trim().length > 500) {
    errors.description = 'A descrição não pode exceder 500 caracteres.';
  }

  if (values.legal_basis.trim().length > 255) {
    errors.legal_basis = 'A norma legal não pode exceder 255 caracteres.';
  }

  return errors;
}

/**
 * Formulário de criação/edição de motivos de isenção. Em modo de edição
 * (`code` definido) carrega o registo e mantém o campo `code` bloqueado.
 */
export function useVatExemptionForm(code?: string) {
  const isEdit = Boolean(code);

  const [values, setValues] = useState<VatExemptionFormValues>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRecord, setIsLoadingRecord] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) {
      setIsLoadingRecord(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setIsLoadingRecord(true);
      setLoadError(null);

      try {
        const record = await vatExemptionService.getVatExemptionByCode(code);
        if (cancelled) return;
        setValues({
          code: record.code,
          description: record.description ?? '',
          legal_basis: record.legal_basis ?? '',
          exemption_type: record.exemption_type ?? '',
          description_detail: record.description_detail ?? '',
          is_active: record.is_active,
        });
      } catch (err) {
        if (!cancelled) setLoadError(normalizeApiError(err).message);
      } finally {
        if (!cancelled) setIsLoadingRecord(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [code]);

  const setField = useCallback(
    <K extends keyof VatExemptionFormValues>(
      field: K,
      value: VatExemptionFormValues[K],
    ) => {
      setValues((current) => ({ ...current, [field]: value }));
    },
    [],
  );

  const submit = useCallback(async (): Promise<VatExemption | null> => {
    const localErrors = validate(values);
    setFieldErrors(localErrors);

    if (Object.keys(localErrors).length > 0) {
      setError('Alguns campos precisam de correção. Reveja os campos assinalados.');
      return null;
    }

    setIsLoading(true);
    setError(null);
    setFieldErrors({});

    const basePayload = {
      description: values.description.trim(),
      legal_basis: values.legal_basis.trim() || null,
      exemption_type: values.exemption_type || null,
      description_detail: values.description_detail.trim() || null,
      is_active: values.is_active,
    };

    try {
      if (isEdit && code) {
        const record = await vatExemptionService.updateVatExemption(code, basePayload);
        toast.success('Motivo de isenção atualizado com sucesso.');
        return record;
      }

      const record = await vatExemptionService.createVatExemption({
        ...basePayload,
        code: values.code.trim().toUpperCase(),
      });
      toast.success('Motivo de isenção criado com sucesso.');
      return record;
    } catch (err) {
      const normalized = normalizeApiError(err);
      setError(normalized.message);
      setFieldErrors(normalized.fieldErrors);

      // Erros de validação (422) ficam inline; falhas globais vão para toast.
      if (!normalized.isValidationError) {
        toast.error(normalized.message);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [code, isEdit, values]);

  return {
    isEdit,
    values,
    setField,
    submit,
    isLoading,
    isLoadingRecord,
    error,
    fieldErrors,
    loadError,
  };
}
