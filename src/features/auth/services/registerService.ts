import { authApi, orgApi } from '../../../lib/api';
import type {
  AdminUserFormValues,
  CompanyFormValues,
  CreateAdminUserPayload,
  CreateCompanyPayload,
  RegisteredCompany,
  RegisteredUser,
} from '../types/register';
import {
  sanitizeAngolanPhone,
  sanitizeBiNumber,
  sanitizeTaxNumber,
} from '../utils/registerValidation';

/**
 * Serviço de auto-registo.
 *
 * ⚠️ Único ponto do fluxo de registo que fala HTTP. Os componentes e o hook
 * (`useRegisterForm`) nunca importam axios nem as instâncias da API.
 *
 * Rotas:
 *   - POST /v1/company/store  (organization_service) -> devolve `data.id` (UUID da empresa)
 *   - POST /v1/users          (auth_service)         -> recebe esse id como `company_id`
 */

interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

/** Converte os valores do formulário nos nomes de campo exigidos pelo Laravel. */
export function toCompanyPayload(values: CompanyFormValues): CreateCompanyPayload {
  const payload: CreateCompanyPayload = {
    company_name: values.companyName.trim(),
    tax_number: sanitizeTaxNumber(values.taxNumber),
    admin_email: values.adminEmail.trim().toLowerCase(),
    phone: sanitizeAngolanPhone(values.phone),
  };

  const address = values.address.trim();
  const city = values.city.trim();
  const province = values.province.trim();
  const agtCertificate = values.agtCertificateNumber.trim();

  if (address) payload.address = address;
  if (city) payload.city = city;
  if (province) payload.province = province;
  if (agtCertificate) payload.agt_certificate_number = agtCertificate;

  return payload;
}

/**
 * Converte os valores do passo 2 no payload de `POST /v1/users`.
 * `role` é fixado em "Administrator" (único valor válido para o admin da empresa)
 * e `status` em "active" — evita os defaults inconsistentes do DTO do backend.
 */
export function toAdminUserPayload(
  values: AdminUserFormValues,
  companyId: string,
): CreateAdminUserPayload {
  return {
    first_name: values.firstName.trim(),
    last_name: values.lastName.trim(),
    email: values.email.trim().toLowerCase(),
    password: values.password,
    phone_number: sanitizeAngolanPhone(values.phoneNumber),
    bi_number: sanitizeBiNumber(values.biNumber),
    company_id: companyId,
    role: 'Administrator',
    status: 'active',
  };
}

/** Quando existe logotipo o pedido tem de ser `multipart/form-data`. */
function toCompanyFormData(payload: CreateCompanyPayload, logo: File): FormData {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });
  formData.append('logo', logo);
  return formData;
}

export const registerService = {
  /** Passo 1: cria a empresa e devolve o UUID (`company_id`) usado no passo 2. */
  async createCompany(
    payload: CreateCompanyPayload,
    logo?: File | null,
  ): Promise<RegisteredCompany> {
    const useMultipart = Boolean(logo);

    const response = await orgApi.post<ApiEnvelope<RegisteredCompany>>(
      '/v1/company/store',
      useMultipart ? toCompanyFormData(payload, logo as File) : payload,
      // ⚠️ Obrigatório: as instâncias do axios têm `Content-Type: application/json`
      // por omissão e, nesse caso, o axios converte o FormData em JSON (o ficheiro
      // do logotipo perder-se-ia). Declarar `multipart/form-data` deixa o browser
      // definir o boundary correcto e envia os bytes do ficheiro.
      useMultipart ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined,
    );

    const company = response.data?.data;
    if (!company?.id) {
      throw new Error(
        'A empresa foi criada, mas a API não devolveu o identificador (company_id).',
      );
    }

    return company;
  },

  /** Passo 2: cria o utilizador administrador associado à empresa. */
  async createAdminUser(payload: CreateAdminUserPayload): Promise<RegisteredUser> {
    const response = await authApi.post<ApiEnvelope<RegisteredUser>>('/v1/users', payload);
    return response.data?.data as RegisteredUser;
  },
};
