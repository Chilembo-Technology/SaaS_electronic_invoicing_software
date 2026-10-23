import { useCallback, useEffect, useState } from 'react';

import { toast } from 'sonner';

import { useAuth } from '../../../contexts/AuthContext';
import { normalizeApiError } from '../../../features/auth/utils/apiError';
import { getCompanyId } from '../../settings/utils/session';
import { customerService } from '../services/customerService';
import type { CreateCustomerPayload, Customer, CustomerType } from '../types';

/** Estado do formulário de cliente (todos os campos editáveis do backend). */
export interface CustomerFormValues {
  customer_code: string;
  customer_tax_id: string;
  company_name: string;
  type: CustomerType | '';
  contact: string;
  email: string;
  telephone: string;
  fax: string;
  website: string;
  billing_building_number: string;
  billing_street_name: string;
  billing_address_detail: string;
  billing_city: string;
  billing_postal_code: string;
  billing_province: string;
  billing_country: string;
  self_billing_indicator: boolean;
  is_active: boolean;
}

export const EMPTY_FORM: CustomerFormValues = {
  customer_code: '',
  customer_tax_id: '',
  company_name: '',
  type: '',
  contact: '',
  email: '',
  telephone: '',
  fax: '',
  website: '',
  billing_building_number: '',
  billing_street_name: '',
  billing_address_detail: '',
  billing_city: '',
  billing_postal_code: '',
  billing_province: '',
  billing_country: 'AO',
  self_billing_indicator: false,
  is_active: true,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: CustomerFormValues): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!values.customer_code.trim()) {
    errors.customer_code = 'O código do cliente é obrigatório.';
  } else if (values.customer_code.trim().length > 30) {
    errors.customer_code = 'O código não pode exceder 30 caracteres.';
  }

  if (!values.customer_tax_id.trim()) {
    errors.customer_tax_id = 'O NIF é obrigatório.';
  } else if (values.customer_tax_id.trim().length > 30) {
    errors.customer_tax_id = 'O NIF não pode exceder 30 caracteres.';
  }

  if (!values.company_name.trim()) {
    errors.company_name = 'O nome do cliente é obrigatório.';
  } else if (values.company_name.trim().length > 100) {
    errors.company_name = 'O nome não pode exceder 100 caracteres.';
  }

  if (!values.type) {
    errors.type = 'O tipo de cliente é obrigatório.';
  }

  if (!values.billing_address_detail.trim()) {
    errors.billing_address_detail = 'O detalhe do endereço é obrigatório.';
  } else if (values.billing_address_detail.trim().length > 250) {
    errors.billing_address_detail = 'O detalhe do endereço não pode exceder 250 caracteres.';
  }

  if (!values.billing_city.trim()) {
    errors.billing_city = 'A cidade é obrigatória.';
  } else if (values.billing_city.trim().length > 50) {
    errors.billing_city = 'A cidade não pode exceder 50 caracteres.';
  }

  if (values.email.trim() !== '') {
    if (!EMAIL_PATTERN.test(values.email.trim())) {
      errors.email = 'O email deve ser um endereço válido.';
    } else if (values.email.trim().length > 254) {
      errors.email = 'O email não pode exceder 254 caracteres.';
    }
  }

  const maxLengthRules: { field: keyof CustomerFormValues; max: number; label: string }[] = [
    { field: 'contact', max: 50, label: 'A pessoa de contacto' },
    { field: 'telephone', max: 20, label: 'O telefone' },
    { field: 'fax', max: 20, label: 'O fax' },
    { field: 'website', max: 60, label: 'O website' },
    { field: 'billing_building_number', max: 15, label: 'O número da porta' },
    { field: 'billing_street_name', max: 200, label: 'O nome da rua' },
    { field: 'billing_postal_code', max: 20, label: 'O código postal' },
    { field: 'billing_province', max: 50, label: 'A província' },
    { field: 'billing_country', max: 12, label: 'O país' },
  ];

  for (const rule of maxLengthRules) {
    const value = String(values[rule.field]).trim();
    if (value.length > rule.max) {
      errors[rule.field] = `${rule.label} não pode exceder ${rule.max} caracteres.`;
    }
  }

  return errors;
}

/** Converte o formulário no payload do backend (strings vazias → `null`). */
function toPayload(values: CustomerFormValues): CreateCustomerPayload {
  return {
    customer_code: values.customer_code.trim().toUpperCase(),
    customer_tax_id: values.customer_tax_id.trim(),
    company_name: values.company_name.trim(),
    type: values.type as CustomerType,
    contact: values.contact.trim() || null,
    email: values.email.trim() || null,
    telephone: values.telephone.trim() || null,
    fax: values.fax.trim() || null,
    website: values.website.trim() || null,
    billing_building_number: values.billing_building_number.trim() || null,
    billing_street_name: values.billing_street_name.trim() || null,
    billing_address_detail: values.billing_address_detail.trim(),
    billing_city: values.billing_city.trim(),
    billing_postal_code: values.billing_postal_code.trim() || null,
    billing_province: values.billing_province.trim() || null,
    billing_country: values.billing_country.trim() || 'AO',
    self_billing_indicator: values.self_billing_indicator,
    is_active: values.is_active,
  };
}

/**
 * Estado do formulário de criação/edição de clientes, com validação local e
 * submissão que normaliza erros 422 (campo-a-campo) através de `normalizeApiError`.
 */
export function useCustomerForm(id?: string) {
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const companyId = getCompanyId(user);

  const [values, setValues] = useState<CustomerFormValues>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRecord, setIsLoadingRecord] = useState(false);
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
        const record = await customerService.getCustomerById(id);
        if (cancelled) return;

        setValues({
          customer_code: record.customer_code ?? '',
          customer_tax_id: record.customer_tax_id ?? '',
          company_name: record.company_name ?? '',
          type: record.type ?? '',
          contact: record.contact ?? '',
          email: record.email ?? '',
          telephone: record.telephone ?? '',
          fax: record.fax ?? '',
          website: record.website ?? '',
          billing_building_number: record.billing_building_number ?? '',
          billing_street_name: record.billing_street_name ?? '',
          billing_address_detail: record.billing_address_detail ?? '',
          billing_city: record.billing_city ?? '',
          billing_postal_code: record.billing_postal_code ?? '',
          billing_province: record.billing_province ?? '',
          billing_country: record.billing_country ?? 'AO',
          self_billing_indicator: record.self_billing_indicator,
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
    <K extends keyof CustomerFormValues>(field: K, value: CustomerFormValues[K]) => {
      setValues((current) => ({ ...current, [field]: value }));
    },
    [],
  );

  const submit = useCallback(async (): Promise<Customer | null> => {
    const localErrors = validate(values);
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

    const payload = toPayload(values);

    try {
      if (isEdit && id) {
        const record = await customerService.updateCustomer(id, companyId, payload);
        toast.success('Cliente actualizado com sucesso.');
        return record;
      }

      const record = await customerService.createCustomer(companyId, payload);
      toast.success('Cliente criado com sucesso.');
      return record;
    } catch (err) {
      const normalized = normalizeApiError(err);
      setError(normalized.message);
      setFieldErrors(normalized.fieldErrors);

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

