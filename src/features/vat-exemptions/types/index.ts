/**
 * Tipos do domínio de motivos de isenção de IVA (fiscal_core).
 *
 * Espelham o contrato devolvido por `VATExemptionReasonResource` e o payload
 * aceite por `POST/PUT /api/v1/vat-exemption-reasons`.
 */

export type VatExemptionType =
  | 'incomplete_internal'
  | 'complete'
  | 'incomplete_import'
  | 'special_customs';

/** Motivo de isenção de IVA (SAF-T TaxExemptionReason, códigos M##). */
export interface VatExemption {
  code: string;
  description: string;
  legal_basis: string | null;
  exemption_type: VatExemptionType | null;
  description_detail: string | null;
  is_active: boolean;
}

export type VatExemptionStatusFilter = 'active' | 'inactive';

/** Filtros da listagem. `search` e `status` são os filtros expostos na UI. */
export interface VatExemptionFilters {
  search?: string;
  status?: VatExemptionStatusFilter;
  page?: number;
  per_page?: number;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Payload de escrita (POST).
 *
 * Nota: o `description_detail` é devolvido pelo Resource mas ainda não é
 * persistido pelos endpoints de create/update do fiscal_core; é enviado por
 * forward-compatibilidade (campo é ignorado pelo backend).
 */
export interface VatExemptionPayload {
  code: string;
  description: string;
  legal_basis: string | null;
  exemption_type: VatExemptionType | null;
  description_detail: string | null;
  is_active: boolean;
}

export type CreateVatExemptionPayload = VatExemptionPayload;

/** Payload de actualização: o `code` viaja na URL, não no corpo. */
export type UpdateVatExemptionPayload = Omit<VatExemptionPayload, 'code'>;
