/**
 * Validação do formulário de auto-registo (página pública `/registar`).
 *
 * ⚠️ As regras e as mensagens deste ficheiro são o ESPELHO EXACTO do backend:
 *   - organization_service/app/Http/Requests/Company/StoreCompanyRequest.php
 *   - auth_service/app/Http/Requests/User/StoreUserRequest.php
 * Sempre que o Laravel devolve um 422, a mensagem do servidor substitui a do
 * cliente (ver `apiError.ts`), por isso o texto mantém-se coerente nos dois lados.
 */

import type {
  AdminUserFieldErrors,
  AdminUserFormValues,
  CompanyFieldErrors,
  CompanyFormValues,
} from '../types/register';

/* ------------------------------------------------------------------ */
/* Regras (copiadas do Laravel)                                        */
/* ------------------------------------------------------------------ */

export const PHONE_REGEX = /^(?:91|92|93|94|99|90|95|96|97)[0-9]{7}$/;
export const TAX_NUMBER_REGEX = /^(?:[0-9]{7,9}[A-Z]{2}[0-9]{3}|[125][0-9]{9})$/;
export const BI_NUMBER_REGEX = /^[0-9]{9}[A-Z]{2}[0-9]{3}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Limites das colunas na BD (mais restritos que o `max:255` da validação). */
export const COMPANY_NAME_MAX = 200; // companies.company_name = string(200)
export const TAX_NUMBER_MAX = 20; // companies.tax_number    = string(20)
export const AUTH_TEXT_MAX = 255;

export const COMPANY_PASSWORD_MIN = 8;

/** Tipos MIME aceites para o logotipo (`mimes:pdf,jpg,jpeg,png,gif,svg,webp`). */
export const LOGO_ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
export const LOGO_MAX_BYTES = 2 * 1024 * 1024; // max:2048 (KB)
/** Atributo `accept` do `<input type="file">` — derivado das mesmas extensões. */
export const LOGO_ACCEPT_ATTRIBUTE =
  'application/pdf,image/jpeg,image/png,image/gif,image/svg+xml,image/webp';
/** Etiqueta legível do limite de tamanho (para textos de apoio). */
export const LOGO_MAX_LABEL = '2 MB';

/** Mensagens — texto exacto devolvido pelo backend (PT). */
export const MESSAGES = {
  companyNameRequired: 'O nome da empresa é obrigatório.',
  companyNameMax: `O nome da empresa deve ter no máximo ${COMPANY_NAME_MAX} caracteres.`,
  taxNumberRequired: 'O número de imposto é obrigatório.',
  taxNumberFormat: 'O número de imposto deve seguir o formato válido.',
  taxNumberMax: `O número de imposto deve ter no máximo ${TAX_NUMBER_MAX} caracteres.`,
  adminEmailRequired: 'O email do administrador é obrigatório.',
  adminEmailInvalid: 'O email do administrador deve ser um endereço de email válido.',
  phoneRequired: 'O número de telefone é obrigatório.',
  phoneFormat: 'O número de telefone deve seguir o formato válido.',
  addressMax: 'O endereço deve ter no máximo 255 caracteres.',
  cityMax: 'A cidade deve ter no máximo 255 caracteres.',
  provinceMax: 'A província deve ter no máximo 255 caracteres.',
  agtMax: 'O número do certificado AGT deve ter no máximo 255 caracteres.',
  logoMimes: 'O logotipo deve ser um arquivo do tipo: PDF, JPG, JPEG, PNG, GIF, SVG ou WEBP.',
  logoMax: 'O logotipo não pode ter mais que 2MB (2048 kilobytes).',

  firstNameRequired: 'O campo nome é obrigatório.',
  firstNameMax: 'O campo nome não pode ter mais de 255 caracteres.',
  lastNameRequired: 'O campo sobrenome é obrigatório.',
  lastNameMax: 'O campo sobrenome não pode ter mais de 255 caracteres.',
  emailRequired: 'O campo email é obrigatório.',
  emailInvalid: 'O campo email deve ser um endereço de email válido.',
  passwordRequired: 'O campo senha é obrigatório.',
  passwordMin: 'A senha deve ter pelo menos 8 caracteres.',
  userPhoneRequired: 'O campo número de telefone é obrigatório.',
  userPhoneFormat:
    'O número de telefone deve começar com 91, 92, 93, 94, 99, 90, 95, 96 ou 97 e conter 9 dígitos.',
  biRequired: 'O campo número de BI é obrigatório.',
  biFormat:
    'O número de BI deve conter 9 dígitos, seguidos por 2 letras maiúsculas e 3 dígitos.',

  // Validações exclusivas do cliente
  confirmPasswordMismatch: 'As senhas não coincidem.',
  acceptTermsRequired: 'É necessário aceitar os Termos e Condições.',
} as const;

/* ------------------------------------------------------------------ */
/* Normalização de valores (o backend exige formatos estritos)         */
/* ------------------------------------------------------------------ */

/** Remove tudo o que não seja dígito e devolve no máximo 9 dígitos (prefixo 244 removido). */
export function sanitizeAngolanPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  const withoutCountryCode = digits.startsWith('244') && digits.length > 9 ? digits.slice(3) : digits;
  return withoutCountryCode.slice(0, 9);
}

/** Maiúsculas + apenas alfanuméricos (NIF aceita `[0-9]{7,9}[A-Z]{2}[0-9]{3}`). */
export function sanitizeTaxNumber(value: string): string {
  return value.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, TAX_NUMBER_MAX);
}

/** Maiúsculas + apenas alfanuméricos (BI: 9 dígitos + 2 letras + 3 dígitos). */
export function sanitizeBiNumber(value: string): string {
  return value.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 20);
}

/* ------------------------------------------------------------------ */
/* Etiquetas dos planos escolhidos na Landing Page                      */
/* ------------------------------------------------------------------ */

export const planLabels: Record<string, string> = {
  essencial: 'Essencial (pré-pago)',
  profissional: 'Profissional (pré-pago)',
  empresa: 'Empresa (pré-pago)',
  'pos-pago': 'Pós-Pago Flex',
  personalizado: 'Plano personalizado',
};

export function resolvePlanLabel(plan: string | null): string {
  if (!plan) {
    return planLabels.profissional;
  }
  return planLabels[plan] ?? planLabels.profissional;
}

/* ------------------------------------------------------------------ */
/* Validação campo a campo                                             */
/* ------------------------------------------------------------------ */

export type CompanyField = keyof CompanyFormValues;
export type AdminUserField = keyof AdminUserFormValues;

/** Valida um único campo da empresa (usado no `onBlur`). */
export function validateCompanyField(
  field: CompanyField,
  values: CompanyFormValues,
): string | undefined {
  switch (field) {
    case 'companyName': {
      const value = values.companyName.trim();
      if (!value) return MESSAGES.companyNameRequired;
      if (value.length > COMPANY_NAME_MAX) return MESSAGES.companyNameMax;
      return undefined;
    }
    case 'taxNumber': {
      const value = sanitizeTaxNumber(values.taxNumber);
      if (!value) return MESSAGES.taxNumberRequired;
      if (value.length > TAX_NUMBER_MAX) return MESSAGES.taxNumberMax;
      if (!TAX_NUMBER_REGEX.test(value)) return MESSAGES.taxNumberFormat;
      return undefined;
    }
    case 'adminEmail': {
      const value = values.adminEmail.trim();
      if (!value) return MESSAGES.adminEmailRequired;
      if (!EMAIL_REGEX.test(value)) return MESSAGES.adminEmailInvalid;
      return undefined;
    }
    case 'phone': {
      const value = sanitizeAngolanPhone(values.phone);
      if (!value) return MESSAGES.phoneRequired;
      if (!PHONE_REGEX.test(value)) return MESSAGES.phoneFormat;
      return undefined;
    }
    case 'address':
      return values.address.trim().length > AUTH_TEXT_MAX ? MESSAGES.addressMax : undefined;
    case 'city':
      return values.city.trim().length > AUTH_TEXT_MAX ? MESSAGES.cityMax : undefined;
    case 'province':
      return values.province.trim().length > AUTH_TEXT_MAX ? MESSAGES.provinceMax : undefined;
    case 'agtCertificateNumber':
      return values.agtCertificateNumber.trim().length > AUTH_TEXT_MAX ? MESSAGES.agtMax : undefined;
    case 'logo': {
      const file = values.logo;
      if (!file) return undefined; // opcional
      const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
      if (!LOGO_ALLOWED_EXTENSIONS.includes(extension)) return MESSAGES.logoMimes;
      if (file.size > LOGO_MAX_BYTES) return MESSAGES.logoMax;
      return undefined;
    }
    default:
      return undefined;
  }
}

/** Campos por ordem de apresentação — usado para focar o primeiro erro. */
export const COMPANY_FIELDS: CompanyField[] = [
  'companyName',
  'taxNumber',
  'adminEmail',
  'phone',
  'address',
  'city',
  'province',
  'agtCertificateNumber',
  'logo',
];

/** Valida todos os campos da empresa (usado no `onSubmit` do passo 1). */
export function validateCompanyForm(values: CompanyFormValues): CompanyFieldErrors {
  const errors: CompanyFieldErrors = {};
  COMPANY_FIELDS.forEach((field) => {
    const error = validateCompanyField(field, values);
    if (error) errors[field] = error;
  });
  return errors;
}

export function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean);
}

/** Primeiro campo inválido (para `focus()`), respeitando a ordem visual. */
export function firstErrorField<T extends string>(
  errors: Partial<Record<T, string>>,
  order: T[],
): T | undefined {
  return order.find((field) => Boolean(errors[field]));
}

/* ------------------------------------------------------------------ */
/* Utilizador administrador                                            */
/* ------------------------------------------------------------------ */

/** Valida um único campo do utilizador administrador (usado no `onBlur`). */
export function validateAdminUserField(
  field: AdminUserField,
  values: AdminUserFormValues,
): string | undefined {
  switch (field) {
    case 'firstName': {
      const value = values.firstName.trim();
      if (!value) return MESSAGES.firstNameRequired;
      if (value.length > AUTH_TEXT_MAX) return MESSAGES.firstNameMax;
      return undefined;
    }
    case 'lastName': {
      const value = values.lastName.trim();
      if (!value) return MESSAGES.lastNameRequired;
      if (value.length > AUTH_TEXT_MAX) return MESSAGES.lastNameMax;
      return undefined;
    }
    case 'email': {
      const value = values.email.trim();
      if (!value) return MESSAGES.emailRequired;
      if (!EMAIL_REGEX.test(value)) return MESSAGES.emailInvalid;
      return undefined;
    }
    case 'phoneNumber': {
      const value = sanitizeAngolanPhone(values.phoneNumber);
      if (!value) return MESSAGES.userPhoneRequired;
      if (!PHONE_REGEX.test(value)) return MESSAGES.userPhoneFormat;
      return undefined;
    }
    case 'biNumber': {
      const value = sanitizeBiNumber(values.biNumber);
      if (!value) return MESSAGES.biRequired;
      if (!BI_NUMBER_REGEX.test(value)) return MESSAGES.biFormat;
      return undefined;
    }
    case 'password': {
      if (!values.password) return MESSAGES.passwordRequired;
      if (values.password.length < COMPANY_PASSWORD_MIN) return MESSAGES.passwordMin;
      return undefined;
    }
    case 'confirmPassword': {
      if (!values.confirmPassword || values.confirmPassword !== values.password) {
        return MESSAGES.confirmPasswordMismatch;
      }
      return undefined;
    }
    case 'acceptTerms':
      return values.acceptTerms ? undefined : MESSAGES.acceptTermsRequired;
    default:
      return undefined;
  }
}

/** Campos por ordem de apresentação — usado para focar o primeiro erro. */
export const ADMIN_USER_FIELDS: AdminUserField[] = [
  'firstName',
  'lastName',
  'email',
  'phoneNumber',
  'biNumber',
  'password',
  'confirmPassword',
  'acceptTerms',
];

/** Valida todos os campos do utilizador (usado no `onSubmit` do passo 2). */
export function validateAdminUserForm(values: AdminUserFormValues): AdminUserFieldErrors {
  const errors: AdminUserFieldErrors = {};
  ADMIN_USER_FIELDS.forEach((field) => {
    const error = validateAdminUserField(field, values);
    if (error) errors[field] = error;
  });
  return errors;
}
