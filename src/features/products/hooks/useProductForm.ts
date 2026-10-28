import { useCallback, useEffect, useState } from 'react';

import { toast } from 'sonner';

import { useAuth } from '../../../contexts/AuthContext';
import { normalizeApiError } from '../../../features/auth/utils/apiError';
import { getCompanyId } from '../../settings/utils/session';
import { productService } from '../services/productService';
import type { Product, ProductType } from '../types';

export interface ProductFormValues {
  product_type: ProductType | ''; 
  product_group: string;
  product_description: string;
  product_number_code: string;
  un_number: string;
  category_id: string;
  is_active: boolean;
  is_stockable: boolean;
  is_inventory_only: boolean;
  is_on_promotion: boolean;
  unit_of_measure: string;
  unit_price: string;
  expiration_date: string;
  image: File | null;
}

export const EMPTY_FORM: ProductFormValues = {
  product_type: '', 
  product_group: '',
  product_description: '',
  product_number_code: '',
  un_number: '',
  category_id: '',
  is_active: true,
  is_stockable: true,
  is_inventory_only: false,
  is_on_promotion: false,
  unit_of_measure: 'UN',
  unit_price: '',
  expiration_date: '',
  image: null,
};

function toNumberOrNull(value: string): number | null {
  if (value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function validate(values: ProductFormValues): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!values.product_type) {
    errors.product_type = 'O tipo é obrigatório.';
  }
 

  if (!values.product_description.trim()) {
    errors.product_description = 'A descrição é obrigatória.';
  } else if (values.product_description.trim().length > 200) {
    errors.product_description = 'A descrição não pode exceder 200 caracteres.';
  }

  if (values.product_group.trim().length > 50) {
    errors.product_group = 'O grupo não pode exceder 50 caracteres.';
  }

  if (values.product_number_code.trim().length > 60) {
    errors.product_number_code = 'O código numérico não pode exceder 60 caracteres.';
  }

  if (values.un_number.trim().length > 6) {
    errors.un_number = 'O número ONU não pode exceder 6 caracteres.';
  }

  if (!values.unit_of_measure.trim()) {
    errors.unit_of_measure = 'A unidade de medida é obrigatória.';
  } else if (values.unit_of_measure.trim().length > 20) {
    errors.unit_of_measure = 'A unidade de medida não pode exceder 20 caracteres.';
  }

  if (values.unit_price.trim() !== '') {
    const price = Number(values.unit_price);
    if (!Number.isFinite(price)) {
      errors.unit_price = 'O preço deve ser um número.';
    } else if (price < 0) {
      errors.unit_price = 'O preço não pode ser negativo.';
    }
  }

  if (values.expiration_date.trim() !== '') {
    const date = new Date(values.expiration_date);
    if (Number.isNaN(date.getTime())) {
      errors.expiration_date = 'A data de validade deve ser uma data válida.';
    }
  }

  return errors;
}
export function useProductForm(id?: string) {
  const isEdit = Boolean(id);

  const { user } = useAuth();
  const companyId = getCompanyId(user);

  const [values, setValues] = useState<ProductFormValues>(EMPTY_FORM);
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
        if (!companyId) {
          throw new Error('Não foi possível identificar a empresa da sessão.');
        }
        const record = await productService.getProductById(id, companyId);
        if (cancelled) return;

        setValues({
          product_type: record.product_type, 
          product_group: record.product_group ?? '',
          product_description: record.product_description,
          product_number_code: record.product_number_code ?? '',
          un_number: record.un_number ?? '',
          category_id: record.category_id ?? '',
          is_active: record.is_active,
          is_stockable: record.is_stockable,
          is_inventory_only: record.is_inventory_only,
          is_on_promotion: record.is_on_promotion,
          unit_of_measure: record.unit_of_measure ?? 'UN',
          unit_price: record.unit_price != null ? String(record.unit_price) : '',
          expiration_date: record.expiration_date ?? '',
          image: null,
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
  }, [companyId, id]);

  const setField = useCallback(
    <K extends keyof ProductFormValues>(field: K, value: ProductFormValues[K]) => {
      setValues((current) => ({ ...current, [field]: value }));
    },
    [],
  );

  const submit = useCallback(async (): Promise<Product | null> => {
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

    const basePayload = {
      product_type: values.product_type as ProductType,
       product_group: values.product_group.trim() || null,
      product_description: values.product_description.trim(),
      product_number_code: values.product_number_code.trim() || null,
      un_number: values.un_number.trim() || null,
      category_id: values.category_id || null,
      is_stockable: values.is_stockable,
      is_inventory_only: values.is_inventory_only,
      is_on_promotion: values.is_on_promotion,
      unit_of_measure: values.unit_of_measure.trim(),
      unit_price: toNumberOrNull(values.unit_price),
      expiration_date: values.expiration_date.trim() || null,
    };

    try {
      if (isEdit && id) {
        const record = await productService.updateProduct(
          id,
          companyId,
          basePayload,
          values.image,
        );
        toast.success('Produto actualizado com sucesso.');
        return record;
      }

      const record = await productService.createProduct(
        companyId,
        { ...basePayload, is_active: values.is_active },
        values.image,
      );
      toast.success('Produto criado com sucesso.');
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

