/**
 * Construção de `FormData` para os endpoints que aceitam ficheiros.
 *
 * Regra: campos de texto vazios são OMITIDOS (o backend devolve 422 quando
 * recebe `''` em campos sem `nullable` e é o omitir que os "limpa"). Ficheiros
 * só são anexados quando existem e têm conteúdo.
 */

import type { UpdateCompanyPayload } from '../types/company.types';
import type { UpdateProfilePayload } from '../types/profile.types';
import type { UpdateUserPayload } from '../types/user.types';

export function appendIfPresent(form: FormData, key: string, value?: string | null): void {
  if (value === undefined || value === null) return;
  const trimmed = String(value).trim();
  if (trimmed === '') return;
  form.append(key, trimmed);
}

export function appendFileIfPresent(form: FormData, key: string, file?: File | null): void {
  if (file instanceof File && file.size > 0) {
    form.append(key, file);
  }
}

/**
 * `PUT /v1/company/update` — enviado como POST com `_method=PUT` porque o
 * Laravel não faz parse de `multipart/form-data` em pedidos PUT.
 */
export function buildCompanyFormData(payload: UpdateCompanyPayload): FormData {
  const form = new FormData();
  form.append('_method', 'PUT');
  form.append('company_id', payload.company_id);

  appendIfPresent(form, 'company_name', payload.company_name);
  appendIfPresent(form, 'tax_number', payload.tax_number);
  appendIfPresent(form, 'admin_email', payload.admin_email);
  appendIfPresent(form, 'phone', payload.phone);
  appendIfPresent(form, 'phone_number_alternative', payload.phone_number_alternative);
  appendIfPresent(form, 'address', payload.address);
  appendIfPresent(form, 'city', payload.city);
  appendIfPresent(form, 'province', payload.province);
  appendIfPresent(form, 'agt_certificate_number', payload.agt_certificate_number);

  // Dados bancários (corporate account)
  appendIfPresent(form, 'corporate_account_id', payload.corporate_account_id);
  appendIfPresent(form, 'bank_id', payload.bank_id);
  appendIfPresent(form, 'account_number', payload.account_number);
  appendIfPresent(form, 'holder', payload.holder);
  appendIfPresent(form, 'iban', payload.iban);

  appendFileIfPresent(form, 'private_key', payload.private_key);
  appendFileIfPresent(form, 'logo', payload.logo);

  return form;
}

/** `POST /v1/users/update/{user_id}` — usa o mesmo corpo para perfil e gestão. */
export function buildUserUpdateFormData(
  payload: UpdateProfilePayload | UpdateUserPayload,
  options?: { includeStatus?: boolean },
): FormData {
  const form = new FormData();
  form.append('company_id', payload.company_id);

  appendIfPresent(form, 'first_name', payload.first_name);
  appendIfPresent(form, 'last_name', payload.last_name);
  appendIfPresent(form, 'email', payload.email);
  appendIfPresent(form, 'phone_number', payload.phone_number);
  appendIfPresent(form, 'bi_number', payload.bi_number);
  appendIfPresent(form, 'password', payload.password);

  if (options?.includeStatus && 'status' in payload) {
    appendIfPresent(form, 'status', (payload as UpdateUserPayload).status);
  }

  appendFileIfPresent(form, 'photo', payload.photo);

  return form;
}
