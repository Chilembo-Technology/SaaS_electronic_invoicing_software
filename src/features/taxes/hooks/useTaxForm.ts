import { useCallback, useEffect, useState } from 'react';

import { toast } from 'sonner';

import { useAuth } from '../../../contexts/AuthContext';
import { normalizeApiError } from '../../../features/auth/utils/apiError';
import { getCompanyId } from '../../settings/utils/session';
import { taxService } from '../services/taxService';
import type { TaxCountryRegion, TaxEntry, TaxType } from '../types';

export interface TaxFormValues {
  tax_type: TaxType | '';
  tax_code: string;
  tax_country_region: TaxCountryRegion | '';
  description: string;
  tax_expiration_date: string;
  tax_percentage: string;
  tax_amount: string;
  is_active: boolean;
}

export const EMPTY_FORM: TaxFormValues = {
  tax_type: '',
  tax_code: '',
  tax_country_region: '',
  description: '',
  tax_expiration_date: '',
  tax_percentage: '',
  tax_amount: '',
  is_active: true,
};

/** Converte o texto do input numérico em number|null (vazio -> null). */
function toNumberOrNull(value: string): number | null {
  if (value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Validação local. Em modo de edição apenas `description` e
 * `tax_expiration_date` são editáveis (regra do backend), pelo que os restantes
 * campos não são validados.
 */
function validate(values: TaxFormValues, isEdit: boolean): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!isEdit) {
    if (!values.tax_type) {
      errors.tax_type = 'O tipo de imposto é obrigatório.';
    }

    if (!values.tax_code.trim()) {
      errors.tax_code = 'O código do imposto é obrigatório.';
    } else if (values.tax_code.trim().length > 10) {
      errors.tax_code = 'O código não pode exceder 10 caracteres.';
    }

    const percentage = values.tax_percentage.trim();
    const amount = values.tax_amount.trim();

    // R2 — TaxPercentage e TaxAmount são mutuamente exclusivos (XOR).
    if (percentage !== '' && amount !== '') {
      errors.tax_percentage = 'Preencha a percentagem OU o montante fixo, não ambos.';
      errors.tax_amount = 'Preencha a percentagem OU o montante fixo, não ambos.';
    }

    if (percentage !== '') {
      const value = Number(percentage);
      if (!Number.isFinite(value)) {
        errors.tax_percentage = 'A percentagem deve ser um número.';
      } else if (value < 0) {
        errors.tax_percentage = 'A percentagem não pode ser negativa.';
      }
    }

    if (amount !== '') {
      const value = Number(amount);
      if (!Number.isFinite(value)) {
        errors.tax_amount = 'O montante deve ser um número.';
      } else if (value < 0) {
        errors.tax_amount = 'O montante não pode ser negativo.';
      }
    }
  }

  if (values.description.trim().length > 255) {
    errors.description = 'A descrição não pode exceder 255 caracteres.';
  }

  if (values.tax_expiration_date.trim() !== '') {
    const date = new Date(values.tax_expiration_date);
    if (Number.isNaN(date.getTime())) {
      errors.tax_expiration_date = 'A data de expiração deve ser uma data válida.';
    }
  }

  return errors;
}

/**
 * Formulário de criação/edição de entradas da tabela de impostos. Em modo de
 * edição (`id` definido) carrega o registo e mantém tax_type/tax_code bloqueados.
 */
export function useTaxForm(id?: string) {
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const companyId = getCompanyId(user);

  const [values, setValues] = useState<TaxFormValues>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRecord, setIsLoadingRecord] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setIsLoadingRecord(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setIsLoadingRecord(true);
      setLoadError(null);

      try {
        const record = await taxService.getTaxById(id);
        if (cancelled) return;
        setValues({
          tax_type: record.tax_type,
          tax_code: record.tax_code,
          tax_country_region: record.tax_country_region ?? '',
          description: record.description ?? '',
          tax_expiration_date: record.tax_expiration_date ?? '',
          tax_percentage:
            record.tax_percentage != null ? String(record.tax_percentage) : '',
          tax_amount: record.tax_amount != null ? String(record.tax_amount) : '',
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
  }, [id]);

  const setField = useCallback(
    <K extends keyof TaxFormValues>(field: K, value: TaxFormValues[K]) => {
      setValues((current) => ({ ...current, [field]: value }));
    },
    [],
  );

  const submit = useCallback(async (): Promise<TaxEntry | null> => {
    const localErrors = validate(values, isEdit);
    setFieldErrors(localErrors);

    if (Object.keys(localErrors).length > 0) {
      setError('Alguns campos precisam de correção. Reveja os campos assinalados.');
      return null;
    }

    if (!companyId) {
      setError('Não foi possível identificar a empresa da sessão.');
      return null;
    }

    setIsLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      if (isEdit && id) {
        const record = await taxService.updateTax(id, companyId, {
          description: values.description.trim() || null,
          tax_expiration_date: values.tax_expiration_date.trim() || null,
        });
        toast.success('Imposto actualizado com sucesso.');
        return record;
      }

      const record = await taxService.createTax(companyId, {
        tax_type: values.tax_type as TaxType,
        tax_code: values.tax_code.trim().toUpperCase(),
        tax_country_region: (values.tax_country_region ||
          null) as TaxCountryRegion | null,
        description: values.description.trim() || null,
        tax_expiration_date: values.tax_expiration_date.trim() || null,
        tax_percentage: toNumberOrNull(values.tax_percentage),
        tax_amount: toNumberOrNull(values.tax_amount),
        is_active: values.is_active,
      });
      toast.success('Imposto criado com sucesso.');
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
  }, [companyId, id, isEdit, values]);

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

