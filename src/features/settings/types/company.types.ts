/**
 * Tipos da sub-secção "Empresa" (organization_service — `/v1/company/*`).
 *
 * Os nomes espelham EXACTAMENTE o `CompanyListResource` e o
 * `UpdateCompanyRequest` do Laravel (ver Fase 1), para não haver traduções na
 * camada de componentes — o mapeamento vive no serviço.
 */

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
  agt_certificate_number: string;
}

export type CompanyField = keyof CompanyFormValues;
export type CompanyFieldErrors = Partial<Record<CompanyField, string>>;
