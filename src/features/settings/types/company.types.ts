/**
 * Tipos da sub-secção "Empresa" (organization_service — `/v1/company/*`).
 *
 * Os nomes espelham EXACTAMENTE o `CompanyListResource` e o
 * `UpdateCompanyRequest` do Laravel (ver Fase 1), para não haver traduções na
 * camada de componentes — o mapeamento vive no serviço.
 */

/** Conta bancária corporativa (`corporate_accounts[]` do resource). */
export interface CorporateAccount {
  id: string;
  /**
   * UUID do banco (`banks.id` do Angola-Core-Data) — ver `Bank` e o
   * `coreDataService`. A API envia/devolve SEMPRE só o UUID, nunca o objeto.
   */
  bank_id: string;
  account_number: string;
  holder: string;
  iban: string;
  /** Data de criação (ISO) — usada para escolher a conta mais recente. */
  created_at: string | null;
  updated_at: string | null;
}

/**
 * Banco do catálogo central (Angola-Core-Data — `GET /api/v1/banks`).
 *
 * Os nomes espelham EXACTAMENTE o que o endpoint devolve (snake_case), tal como
 * os restantes tipos desta secção — o mapeamento vive no `coreDataService`.
 */
export interface Bank {
  /** UUID que é guardado em `CorporateAccount.bank_id`. */
  id: string;
  /** Nome visível no `<select>`. */
  bank_name: string;
  short_name: string | null;
  /** Prefixo de país (ex.: `AO06`). */
  country_prefix: string | null;
  /** Prefixo do banco (4 dígitos, ex.: `0040`) — 1.º grupo do IBAN angolano. */
  bank_prefix: string | null;
}

/** Campos devolvidos por `GET /v1/company/list` (`CompanyListResource`). */
export interface CompanySettings {
  id: string;
  company_name: string;
  tax_number: string;
  admin_email: string;
  phone: string;
  phone_number_alternative: string;
  address: string;
  city: string;
  province: string;
  country: string;
  agt_certificate_number: string;
  /** Caminho do ficheiro da chave privada (dado sensível, só leitura). */
  private_key_path: string | null;
  status: string;
  created_at: string | null;
  updated_at: string | null;
  /** Contas bancárias associadas (pode vir vazio). */
  corporate_accounts: CorporateAccount[];
}

/** Corpo de `PUT /v1/company/update` (enviado em `multipart/form-data`). */
export interface UpdateCompanyPayload {
  company_id: string;
  company_name?: string;
  tax_number?: string;
  admin_email?: string;
  phone?: string;
  phone_number_alternative?: string;
  address?: string;
  city?: string;
  province?: string;
  agt_certificate_number?: string;
  private_key?: File | null;
  logo?: File | null;
  /**
   * Dados bancários (`corporate_accounts`).
   * ⚠️ Enviar `corporate_account_id` da conta existente — sem ele o backend
   * CRIA uma nova linha a cada gravação (a tabela não tem chave única por empresa).
   */
  corporate_account_id?: string;
  bank_id?: string;
  account_number?: string;
  holder?: string;
  iban?: string;
}

/** Valores editáveis no formulário da empresa (sem os ficheiros). */
export interface CompanyFormValues {
  company_name: string;
  tax_number: string;
  admin_email: string;
  phone: string;
  phone_number_alternative: string;
  address: string;
  city: string;
  province: string;
  country: string;
  agt_certificate_number: string;
  bank_id: string;
  account_number: string;
  holder: string;
  iban: string;
}

export type CompanyField = keyof CompanyFormValues;
export type CompanyFieldErrors = Partial<Record<CompanyField, string>>;
