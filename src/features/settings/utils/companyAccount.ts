/**
 * Escolha da conta bancária a editar no formulário da empresa.
 *
 * `GET /v1/company/list` devolve `corporate_accounts` como ARRAY e **sem garantir
 * a ordem** (nem sempre a mais recente primeiro). Como o contrato de atualização
 * (`PUT /v1/company/update`) só transporta UMA conta (`bank_id`,
 * `account_number`, `holder`, `iban` + `corporate_account_id`), usamos sempre a
 * **mais recente**:
 *   - é a que foi gravada por último (o que o utilizador espera voltar a ver);
 *   - o `corporate_account_id` enviado aponta para ela, pelo que a gravação
 *     ATUALIZA a conta em vez de inserir uma linha nova.
 *
 * ⚠️ Ler `corporate_accounts[0]` diretamente foi o que fazia o formulário abrir
 * com dados antigos (e duplicar a conta a cada gravação).
 */

import type { CorporateAccount, CompanySettings } from '../types/company.types';

export function pickLatestCorporateAccount(
  company: Pick<CompanySettings, 'corporate_accounts'> | null | undefined,
): CorporateAccount | undefined {
  const accounts = company?.corporate_accounts ?? [];
  if (accounts.length <= 1) return accounts[0];

  // ISO-8601 compara-se lexicograficamente (= cronologicamente).
  return [...accounts].sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''))[0];
}
