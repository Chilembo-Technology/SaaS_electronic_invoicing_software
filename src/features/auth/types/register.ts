/**
 * Tipos do fluxo de auto-registo: empresa (organization_service) + utilizador
 * administrador (auth_service).
 *
 * O campo de contexto multi-empresa chama-se SEMPRE `company_id`.
 */

export type RegisterStep = 1 | 2;

/** Valores do passo 1 — dados da empresa (`POST /v1/company/store`). */
export interface CompanyFormValues {
  companyName: string;
  taxNumber: string;
  adminEmail: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  agtCertificateNumber: string;
  logo: File | null;
}

/** Valores do passo 2 — utilizador administrador (`POST /v1/users`). */
export interface AdminUserFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  biNumber: string;
  password: string;
  /** Confirmação de senha: apenas cliente (o backend não valida `confirmed`). */
  confirmPassword: string;
  /** Aceitação de termos: apenas cliente. */
  acceptTerms: boolean;
}

export type CompanyFieldErrors = Partial<Record<keyof CompanyFormValues, string>>;
export type AdminUserFieldErrors = Partial<Record<keyof AdminUserFormValues, string>>;

export const emptyCompanyValues: CompanyFormValues = {
  companyName: '',
  taxNumber: '',
  adminEmail: '',
  phone: '',
  address: '',
  city: '',
  province: '',
  agtCertificateNumber: '',
  logo: null,
};

export const emptyAdminUserValues: AdminUserFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  biNumber: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
};

/** Payload real enviado para `POST /v1/company/store` (nomes do Laravel). */
export interface CreateCompanyPayload {
  company_name: string;
  tax_number: string;
  admin_email: string;
  phone: string;
  address?: string;
  city?: string;
  province?: string;
  agt_certificate_number?: string;
}

/** Payload real enviado para `POST /v1/users` (nomes do Laravel). */
export interface CreateAdminUserPayload {
  /**
   * Token de onboarding devolvido no registo da empresa (30 min, uso único).
   * A empresa e a role ("administrator") vêm do token, não do pedido.
   */
  onboarding_token: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone_number: string;
  bi_number: string;
}

/** Empresa devolvida pelo organization_service (apenas o que o registo usa). */
export interface RegisteredCompany {
  id: string;
  company_name?: string;
  tax_number?: string;
  admin_email?: string;
  /** Token para criar o primeiro administrador (POST /v1/onboarding/admin). */
  onboarding_token: string;
}

/** Utilizador devolvido pelo auth_service após o registo. */
export interface RegisteredUser {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  company_id?: string;
}
