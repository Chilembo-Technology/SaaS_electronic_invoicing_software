import { describe, expect, it, vi } from 'vitest';

const { mocks } = vi.hoisted(() => ({ mocks: { get: vi.fn(), put: vi.fn() } }));

vi.mock('../../../lib/api', () => ({ orgApi: { get: mocks.get, put: mocks.put } }));

import { buildListParams, platformCompaniesService } from './platformCompaniesService';

describe('buildListParams', () => {
  it('pesquisa por NIF quando o termo parece um NIF e por nome caso contrário', () => {
    expect(buildListParams({ search: '5410003691' }, 1)).toMatchObject({ tax_number: '5410003691' });
    expect(buildListParams({ search: 'Banco' }, 1)).toMatchObject({ company_name: 'Banco' });
  });

  it('traduz o filtro de instituição financeira', () => {
    expect(buildListParams({ financialInstitution: 'banks' }, 2)).toMatchObject({ is_financial_institution: 'true', page: 2 });
    expect(buildListParams({ financialInstitution: 'non-banks' }, 1)).toMatchObject({ is_financial_institution: 'false' });
    expect(buildListParams({ financialInstitution: 'all' }, 1)).not.toHaveProperty('is_financial_institution');
  });
});

describe('platformCompaniesService.setFinancialInstitution', () => {
  it('faz PUT na rota de super-admin com o valor pedido', async () => {
    mocks.put.mockResolvedValueOnce({ data: { data: { id: 'c1', is_financial_institution: true } } });

    const updated = await platformCompaniesService.setFinancialInstitution('c1', true);

    expect(mocks.put).toHaveBeenCalledWith('/v1/company/financial-institution/c1', { is_financial_institution: true });
    expect(updated.is_financial_institution).toBe(true);
  });
});
