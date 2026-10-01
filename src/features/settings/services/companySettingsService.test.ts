import { describe, expect, it, vi } from 'vitest';

/**
 * Testes do serviço da Empresa (organization_service). A instância axios
 * (`src/lib/api.ts`) é substituída por espiões para verificar rotas, params e
 * o corpo `multipart/form-data`.
 */

const { mocks } = vi.hoisted(() => ({ mocks: { get: vi.fn(), post: vi.fn() } }));

vi.mock('../../../lib/api', () => ({
  orgApi: { get: mocks.get, post: mocks.post },
}));

import { companySettingsService, mapCompany } from './companySettingsService';

describe('companySettingsService.getCompany', () => {
  it('envia company_id como query param e devolve a primeira empresa', async () => {
    mocks.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: [{ id: 'c1', company_name: 'Acme Lda', tax_number: '5000000000', status: 'active' }],
        meta: {},
      },
    });

    const company = await companySettingsService.getCompany('c1');

    expect(mocks.get).toHaveBeenCalledWith('/v1/company/list', {
      params: { company_id: 'c1', per_page: 1, page: 1 },
    });
    expect(company).toMatchObject({ id: 'c1', company_name: 'Acme Lda' });
  });

  it('devolve null quando a lista vem vazia', async () => {
    mocks.get.mockResolvedValueOnce({ data: { success: true, data: [] } });
    expect(await companySettingsService.getCompany('x')).toBeNull();
  });
});

describe('companySettingsService.updateCompany', () => {
  it('faz POST multipart com _method=PUT e company_id', async () => {
    mocks.post.mockResolvedValueOnce({ data: { success: true, data: { id: 'c1', company_name: 'Acme 2' } } });

    const updated = await companySettingsService.updateCompany({
      company_id: 'c1',
      company_name: 'Acme 2',
      phone: '923456789',
    });

    const [path, formData, config] = mocks.post.mock.calls[0];
    expect(path).toBe('/v1/company/update');
    expect(formData).toBeInstanceOf(FormData);
    expect((formData as FormData).get('_method')).toBe('PUT');
    expect((formData as FormData).get('company_id')).toBe('c1');
    expect((formData as FormData).get('company_name')).toBe('Acme 2');
    expect(config).toEqual({ headers: { 'Content-Type': 'multipart/form-data' } });
    expect(updated.company_name).toBe('Acme 2');
  });

  it('omite campos de texto vazios', async () => {
    mocks.post.mockResolvedValueOnce({ data: { data: { id: 'c1' } } });

    await companySettingsService.updateCompany({ company_id: 'c1', company_name: 'Acme', address: '   ' });

    const formData = mocks.post.mock.calls[0][1] as FormData;
    expect(formData.get('address')).toBeNull();
  });

  it('anexa o logo apenas quando é um ficheiro', async () => {
    mocks.post.mockResolvedValueOnce({ data: { data: { id: 'c1' } } });

    await companySettingsService.updateCompany({
      company_id: 'c1',
      logo: new File(['x'], 'logo.png', { type: 'image/png' }),
    });

    const formData = mocks.post.mock.calls[0][1] as FormData;
    expect(formData.get('logo')).toBeInstanceOf(File);
  });

  it('inclui os dados bancários no FormData', async () => {
    mocks.post.mockResolvedValueOnce({ data: { data: { id: 'c1' } } });

    await companySettingsService.updateCompany({
      company_id: 'c1',
      corporate_account_id: 'acc1',
      bank_id: 'b1',
      account_number: '56425593142',
      holder: 'Acme',
      iban: '0005.0000.7998.9111.1019.7',
    });

    const formData = mocks.post.mock.calls[0][1] as FormData;
    expect(formData.get('corporate_account_id')).toBe('acc1');
    expect(formData.get('bank_id')).toBe('b1');
    expect(formData.get('account_number')).toBe('56425593142');
    expect(formData.get('holder')).toBe('Acme');
    expect(formData.get('iban')).toBe('0005.0000.7998.9111.1019.7');
  });

  it('recarrega a empresa após o update (inclui corporate_accounts)', async () => {
    mocks.post.mockResolvedValueOnce({ data: { data: { id: 'c1', company_name: 'Acme 2' } } });
    mocks.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: [
          {
            id: 'c1',
            company_name: 'Acme 2',
            country: 'AO',
            corporate_accounts: [
              {
                id: 'acc1',
                bank_id: 'b1',
                account_number: '56425593142',
                holder: 'Acme',
                iban: '0005.0000.7998.9111.1019.7',
              },
            ],
          },
        ],
      },
    });

    const updated = await companySettingsService.updateCompany({ company_id: 'c1', company_name: 'Acme 2' });

    expect(mocks.get).toHaveBeenCalledWith('/v1/company/list', {
      params: { company_id: 'c1', per_page: 1, page: 1 },
    });
    expect(updated.corporate_accounts).toHaveLength(1);
    expect(updated.corporate_accounts[0]).toMatchObject({
      id: 'acc1',
      bank_id: 'b1',
      account_number: '56425593142',
    });
  });
});

describe('mapCompany', () => {
  it('normaliza nulos em strings vazias', () => {
    expect(mapCompany(null)).toMatchObject({ id: '', company_name: '', private_key_path: null });
  });
});
