/**
 * Serviço do catálogo central de dados de referência (Angola-Core-Data).
 *
 * Rota espelhada de `Angola-Core-Data/routes/bank_rooter/bank_rooter.php`:
 *   GET /api/v1/banks  ->  BankController@index
 *
 * Rota PÚBLICA: só o grupo `api` (sem `jwt.claims` e sem throttle).
 *
 * Resposta real (confirmada na Fase 1.2, via `ApiAdapter` + `PaginationPresenter`):
 *   {
 *     "data": [ { "id", "bank_name", "short_name", "country_prefix",
 *                 "bank_prefix", "created_at", "updated_at", "deleted_at" } ],
 *     "meta": { "total", "is_first_page", "is_last_page", "current_page",
 *               "next_page", "previous_page" }
 *   }
 *
 * ⚠️ Está PAGINADA (`per_page` default = 15). Pedimos um `per_page` alto para
 * que o banco já guardado na empresa venha sempre na lista (o que permite ao
 * `<select>` abrir pré‑selecionado).
 */

import { coreDataApi } from '../../../lib/api';
import type { Bank } from '../types/company.types';

/** Formato bruto de um item de `GET /v1/banks`. */
interface RawBank {
  id?: string | number | null;
  bank_name?: string | null;
  short_name?: string | null;
  country_prefix?: string | null;
  bank_prefix?: string | null;
}

interface BanksEnvelope {
  data?: RawBank[];
  meta?: Record<string, unknown>;
}

const BANKS_PATH = '/v1/banks';

/** Uma página chega para o catálogo angolano (~30 bancos). */
const BANKS_PER_PAGE = 200;

/** Normaliza um banco da API (nulos -> `''`/`null`) para o tipo `Bank`. */
export function mapBank(raw: RawBank | null | undefined): Bank {
  const bank = raw ?? {};
  return {
    id: bank.id != null ? String(bank.id) : '',
    bank_name: bank.bank_name ?? '',
    short_name: bank.short_name ?? null,
    country_prefix: bank.country_prefix ?? null,
    bank_prefix: bank.bank_prefix ?? null,
  };
}

export const coreDataService = {
  /** Lista os bancos do catálogo central (ignora registos sem `id`). */
  async listBanks(): Promise<Bank[]> {
    const response = await coreDataApi.get<BanksEnvelope | RawBank[]>(BANKS_PATH, {
      params: { page: 1, per_page: BANKS_PER_PAGE },
    });

    const body = response.data;
    const list = Array.isArray(body) ? body : body?.data ?? [];

    return list.map(mapBank).filter((bank) => bank.id !== '');
  },
};
