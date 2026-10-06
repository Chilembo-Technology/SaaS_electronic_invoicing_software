/**
 * Validação da secção de Configurações.
 *
 * Reutiliza as regras/mensagens de `features/auth/utils/registerValidation.ts`
 * (que espelham o Laravel) — não duplica regexes nem textos do backend.
 */

import {
  AUTH_TEXT_MAX,
  BI_NUMBER_REGEX,
  COMPANY_NAME_MAX,
  COMPANY_PASSWORD_MIN,
  EMAIL_REGEX,
  LOGO_ALLOWED_EXTENSIONS,
  LOGO_MAX_BYTES,
  MESSAGES,
  PHONE_REGEX,
  TAX_NUMBER_MAX,
  TAX_NUMBER_REGEX,
  sanitizeAngolanPhone,
  sanitizeBiNumber,
  sanitizeTaxNumber,
} from '../../auth/utils/registerValidation';
import type { CompanyFieldErrors, CompanyFormValues } from '../types/company.types';
import type {
  PasswordFieldErrors,
  PasswordFormValues,
  ProfileFieldErrors,
  ProfileFormValues,
} from '../types/profile.types';
import type {
  CreateUserFieldErrors,
  CreateUserFormValues,
  EditUserFieldErrors,
  EditUserFormValues,
} from '../types/user.types';
import { CREATE_USER_ROLES } from '../types/user.types';

/** UUID (mesma regra `uuid` do Laravel). */
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** `account_number`: `regex:/^\d{11}$/`. */
export const ACCOUNT_NUMBER_REGEX = /^\d{11}$/;
/** `iban`: `regex:/^\d{4}\.\d{4}\.\d{4}\.\d{4}\.\d{4}\.\d{1}$/i`. */
export const IBAN_REGEX = /^\d{4}\.\d{4}\.\d{4}\.\d{4}\.\d{4}\.\d{1}$/;

/** Mensagens alinhadas com o texto devolvido pelo backend (PT). */
export const SETTINGS_MESSAGES = {
  nameRequired: MESSAGES.firstNameRequired,
  nameMax: MESSAGES.firstNameMax,
  lastNameRequired: MESSAGES.lastNameRequired,
  lastNameMax: MESSAGES.lastNameMax,
  emailRequired: MESSAGES.emailRequired,
  emailInvalid: MESSAGES.emailInvalid,
  phoneRequired: MESSAGES.userPhoneRequired,
  phoneFormat: MESSAGES.userPhoneFormat,
  biFormat: MESSAGES.biFormat,
  passwordRequired: MESSAGES.passwordRequired,
  passwordMin: MESSAGES.passwordMin,
  confirmMismatch: MESSAGES.confirmPasswordMismatch,
  privateKeyMimes: 'A chave privada deve ser um ficheiro PDF, JPG, JPEG, PNG, GIF, SVG ou WEBP.',
  privateKeyMax: 'A chave privada não pode ter mais que 2MB (2048 kilobytes).',
  bankIdInvalid: 'O ID do banco deve ser um UUID (identificador universal) válido.',
  accountNumberFormat: 'O número da conta deve conter apenas 11 dígitos numéricos.',
  holderMax: 'O titular deve ter no máximo 255 caracteres.',
  ibanFormat: 'Iban inválido. Ex.: 0005.0000.7998.9111.1019.7',
  photoMimes: 'A foto deve ser um arquivo do tipo: jpeg, png, jpg, gif, bmp, svg, webp ou heic.',
  photoMax: 'A foto não pode ser maior que 2MB.',
  roleInvalid: 'A função deve ser "Administrator", "Viewer" ou "Operator".',
  statusInvalid: 'O status deve ser "active" ou "inactive".',
} as const;

/* ------------------------------------------------------------------ */
/* Empresa                                                             */
/* ------------------------------------------------------------------ */

export function validateCompanyFields(values: CompanyFormValues): CompanyFieldErrors {
  const errors: CompanyFieldErrors = {};

  const name = values.company_name.trim();
  if (!name) errors.company_name = MESSAGES.companyNameRequired;
  else if (name.length > COMPANY_NAME_MAX) errors.company_name = MESSAGES.companyNameMax;

  const tax = sanitizeTaxNumber(values.tax_number);
  if (!tax) errors.tax_number = MESSAGES.taxNumberRequired;
  else if (tax.length > TAX_NUMBER_MAX) errors.tax_number = MESSAGES.taxNumberMax;
  else if (!TAX_NUMBER_REGEX.test(tax)) errors.tax_number = MESSAGES.taxNumberFormat;

  const email = values.admin_email.trim();
  if (!email) errors.admin_email = MESSAGES.adminEmailRequired;
  else if (!EMAIL_REGEX.test(email)) errors.admin_email = MESSAGES.adminEmailInvalid;

  const phone = sanitizeAngolanPhone(values.phone);
  if (!phone) errors.phone = MESSAGES.phoneRequired;
  else if (!PHONE_REGEX.test(phone)) errors.phone = MESSAGES.phoneFormat;

  const alt = sanitizeAngolanPhone(values.phone_number_alternative);
  if (values.phone_number_alternative.trim() && !PHONE_REGEX.test(alt)) {
    errors.phone_number_alternative = MESSAGES.phoneFormat;
  }

  if (values.address.trim().length > AUTH_TEXT_MAX) errors.address = MESSAGES.addressMax;
  if (values.city.trim().length > AUTH_TEXT_MAX) errors.city = MESSAGES.cityMax;
  if (values.province.trim().length > AUTH_TEXT_MAX) errors.province = MESSAGES.provinceMax;
  if (values.agt_certificate_number.trim().length > AUTH_TEXT_MAX) {
    errors.agt_certificate_number = MESSAGES.agtMax;
  }

  // Dados bancários (corporate account) — opcionais, mas validados se preenchidos.
  if (values.bank_id.trim() && !UUID_REGEX.test(values.bank_id.trim())) {
    errors.bank_id = SETTINGS_MESSAGES.bankIdInvalid;
  }

  if (values.account_number.trim() && !ACCOUNT_NUMBER_REGEX.test(values.account_number.trim())) {
    errors.account_number = SETTINGS_MESSAGES.accountNumberFormat;
  }

  if (values.holder.trim().length > AUTH_TEXT_MAX) {
    errors.holder = SETTINGS_MESSAGES.holderMax;
  }

  if (values.iban.trim() && !IBAN_REGEX.test(values.iban.trim())) {
    errors.iban = SETTINGS_MESSAGES.ibanFormat;
  }

  return errors;
}

/** Valida um ficheiro pelo mimetype/extensão e tamanho (logo). */
export function validateLogoFile(file: File | null): string | undefined {
  if (!file) return undefined;
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!LOGO_ALLOWED_EXTENSIONS.includes(extension)) return MESSAGES.logoMimes;
  if (file.size > LOGO_MAX_BYTES) return MESSAGES.logoMax;
  return undefined;
}

/** Valida a chave privada (mesmas restrições `mimes`/`max` do logo). */
export function validatePrivateKeyFile(file: File | null): string | undefined {
  if (!file) return undefined;
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!LOGO_ALLOWED_EXTENSIONS.includes(extension)) return SETTINGS_MESSAGES.privateKeyMimes;
  if (file.size > LOGO_MAX_BYTES) return SETTINGS_MESSAGES.privateKeyMax;
  return undefined;
}

/* ------------------------------------------------------------------ */
/* Perfil                                                              */
/* ------------------------------------------------------------------ */

export function validateProfileFields(values: ProfileFormValues): ProfileFieldErrors {
  const errors: ProfileFieldErrors = {};

  const first = values.first_name.trim();
  if (!first) errors.first_name = SETTINGS_MESSAGES.nameRequired;
  else if (first.length > AUTH_TEXT_MAX) errors.first_name = SETTINGS_MESSAGES.nameMax;

  const last = values.last_name.trim();
  if (!last) errors.last_name = SETTINGS_MESSAGES.lastNameRequired;
  else if (last.length > AUTH_TEXT_MAX) errors.last_name = SETTINGS_MESSAGES.lastNameMax;

  const email = values.email.trim();
  if (!email) errors.email = SETTINGS_MESSAGES.emailRequired;
  else if (!EMAIL_REGEX.test(email)) errors.email = SETTINGS_MESSAGES.emailInvalid;

  const phone = sanitizeAngolanPhone(values.phone_number);
  if (!phone) errors.phone_number = SETTINGS_MESSAGES.phoneRequired;
  else if (!PHONE_REGEX.test(phone)) errors.phone_number = SETTINGS_MESSAGES.phoneFormat;

  if (values.bi_number.trim() && !BI_NUMBER_REGEX.test(sanitizeBiNumber(values.bi_number))) {
    errors.bi_number = SETTINGS_MESSAGES.biFormat;
  }

  return errors;
}

export function validatePasswordFields(values: PasswordFormValues): PasswordFieldErrors {
  const errors: PasswordFieldErrors = {};
  if (!values.password) errors.password = SETTINGS_MESSAGES.passwordRequired;
  else if (values.password.length < COMPANY_PASSWORD_MIN) errors.password = SETTINGS_MESSAGES.passwordMin;
  if (values.confirmPassword !== values.password) errors.confirmPassword = SETTINGS_MESSAGES.confirmMismatch;
  return errors;
}

/* ------------------------------------------------------------------ */
/* Utilizadores                                                        */
/* ------------------------------------------------------------------ */

export function validateEditUserFields(values: EditUserFormValues): EditUserFieldErrors {
  const errors = validateProfileFields({
    first_name: values.first_name,
    last_name: values.last_name,
    email: values.email,
    phone_number: values.phone_number,
    bi_number: values.bi_number,
  }) as EditUserFieldErrors;

  if (values.password && values.password.length < COMPANY_PASSWORD_MIN) {
    errors.password = SETTINGS_MESSAGES.passwordMin;
  }

  return errors;
}

export function hasAnyError(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean);
}

/** Extensões aceites para `photo` no `StoreUserRequest` (`mimes:…,heic`). */
export const PHOTO_ALLOWED_EXTENSIONS = ['jpeg', 'png', 'jpg', 'gif', 'bmp', 'svg', 'webp', 'heic'];
/** `max:2048` (KB) do `StoreUserRequest`. */
export const PHOTO_MAX_BYTES = 2 * 1024 * 1024;
/** Atributo `accept` do `<input type="file">` da fotografia. */
export const PHOTO_ACCEPT_ATTRIBUTE =
  'image/jpeg,image/png,image/gif,image/bmp,image/svg+xml,image/webp,image/heic';

/** Valida a fotografia opcional (mesmas mimes/max do backend). */
export function validateCreateUserPhoto(file: File | null): string | undefined {
  if (!file) return undefined;
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!PHOTO_ALLOWED_EXTENSIONS.includes(extension)) return SETTINGS_MESSAGES.photoMimes;
  if (file.size > PHOTO_MAX_BYTES) return SETTINGS_MESSAGES.photoMax;
  return undefined;
}

/**
 * Valida o formulário de CRIAÇÃO (`StoreUserRequest`).
 * Diferenças face à edição: `password` e `bi_number` são OBRIGATÓRIOS e há
 * validação de `role`/`status`. Os `unique` (email/telefone/BI) só existem no
 * servidor — chegam como 422 e são mapeados em `fieldErrors`.
 */
export function validateCreateUserFields(values: CreateUserFormValues): CreateUserFieldErrors {
  const errors = validateProfileFields({
    first_name: values.first_name,
    last_name: values.last_name,
    email: values.email,
    phone_number: values.phone_number,
    bi_number: values.bi_number,
  }) as CreateUserFieldErrors;

  // No criação o BI é obrigatório (`validateProfileFields` só valida se preenchido).
  if (!values.bi_number.trim()) errors.bi_number = MESSAGES.biRequired;

  if (!values.password) errors.password = SETTINGS_MESSAGES.passwordRequired;
  else if (values.password.length < COMPANY_PASSWORD_MIN) errors.password = SETTINGS_MESSAGES.passwordMin;

  if (!CREATE_USER_ROLES.includes(values.role)) errors.role = SETTINGS_MESSAGES.roleInvalid;
  if (values.status !== 'active' && values.status !== 'inactive') {
    errors.status = SETTINGS_MESSAGES.statusInvalid;
  }

  return errors;
}
