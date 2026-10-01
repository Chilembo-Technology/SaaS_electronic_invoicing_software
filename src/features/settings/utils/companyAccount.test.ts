import { describe, expect, it } from 'vitest';

import type { CompanySettings, CorporateAccount } from '../types/company.types';
import { pickLatestCorporateAccount } from './companyAccount';

/**
 * A API devolve `corporate_accounts` como array e sem ordem garantida: o
 * formulário tem de escolher sempre a conta MAIS RECENTE (era a ler `[0]` que
 * aparecia com dados antigos depois de gravar).
 */

function account(id: string, created_at: string | null): CorporateAccount {
  return {
    id,
    bank_id: `bank-${id}`,
    account_number: '11221212122',
    holder: `titular-${id}`,
    iban: '0005.0000.7998.9111.1019.7',
    created_at,
    updated_at: created_at,
  };
}

const companyWith = (corporate_accounts: CorporateAccount[]): Pick<CompanySettings, 'corporate_accounts'> => ({
  corporate_accounts,
});

describe('pickLatestCorporateAccount', () => {
  it('devolve undefined quando não há empresa ou não há contas', () => {
    expect(pickLatestCorporateAccount(null)).toBeUndefined();
    expect(pickLatestCorporateAccount(undefined)).toBeUndefined();
    expect(pickLatestCorporateAccount(companyWith([]))).toBeUndefined();
  });

  it('devolve a única conta existente', () => {
    const only = account('a1', '2026-10-01T12:07:50.000000Z');
    expect(pickLatestCorporateAccount(companyWith([only]))).toBe(only);
  });

  it('escolhe a conta mais recente mesmo quando a API as devolve fora de ordem', () => {
    // Ordem real devolvida pela API (a mais ANTIGA primeiro).
    const oldest = account('antiga', '2026-10-01T12:07:50.000000Z');
    const newest = account('recente', '2026-10-01T12:08:30.000000Z');

    expect(pickLatestCorporateAccount(companyWith([oldest, newest])).id).toBe('recente');
    expect(pickLatestCorporateAccount(companyWith([newest, oldest])).id).toBe('recente');
  });

  it('não muta o array original', () => {
    const accounts = [account('a', '2026-10-01T12:07:50.000000Z'), account('b', '2026-10-01T12:08:30.000000Z')];

    pickLatestCorporateAccount(companyWith(accounts));

    expect(accounts.map((item) => item.id)).toEqual(['a', 'b']);
  });

  it('sem `created_at` mantém a ordem devolvida pela API', () => {
    const first = account('a', null);
    const second = account('b', null);

    expect(pickLatestCorporateAccount(companyWith([first, second])).id).toBe('a');
  });
});
