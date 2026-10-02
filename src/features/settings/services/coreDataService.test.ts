import { describe, expect, it, vi } from 'vitest';

/**
 * Testes do serviço do catálogo central (Angola-Core-Data). A instância axios
 * (`src/lib/api.ts`) é substituída por um espião para verificar a rota, os
 * parâmetros de paginação e o desembrulhar do envelope `{ data, meta }`.
 */

const { mocks } = vi.hoisted(() => ({ mocks: { get: vi.fn() } }));

vi.mock('../../../lib/api', () => ({
  coreDataApi: { get: mocks.get },
}));

import { coreDataService, mapBank } from './coreDataService';

describe('coreDataService.listBanks', () => {
  it('pede /v1/banks com paginação explícita e desembrulha `data`', async () => {
    mocks.get.mockResolvedValueOnce({
      data: {
        data: [
          {
            id: 'b1',
            bank_name: 'Banco Angolano de Investimentos',
            short_name: 'BAI',
            country_prefix: 'AO',
            bank_prefix: '0040',
          },
        ],
        meta: { total: 1, is_first_page: true, is_last_page: true, current_page: 1 },
      },
    });

    const banks = await coreDataService.listBanks();

    expect(mocks.get).toHaveBeenCalledWith('/v1/banks', {
      params: { page: 1, per_page: 200 },
    });
    expect(banks).toEqual([
      {
        id: 'b1',
        bank_name: 'Banco Angolano de Investimentos',
        short_name: 'BAI',
        country_prefix: 'AO',
        bank_prefix: '0040',
      },
    ]);
  });

  it('aceita também uma lista pura (sem envelope)', async () => {
    mocks.get.mockResolvedValueOnce({ data: [{ id: 'b1', bank_name: 'BAI' }] });

    await expect(coreDataService.listBanks()).resolves.toHaveLength(1);
  });

  it('devolve lista vazia quando o catálogo não tem bancos', async () => {
    mocks.get.mockResolvedValueOnce({ data: { data: [], meta: { total: 0 } } });

    await expect(coreDataService.listBanks()).resolves.toEqual([]);
  });

  it('ignora registos sem id', async () => {
    mocks.get.mockResolvedValueOnce({ data: { data: [{ bank_name: 'Sem id' }, { id: 'b2', bank_name: 'BFA' }] } });

    const banks = await coreDataService.listBanks();

    expect(banks).toHaveLength(1);
    expect(banks[0].id).toBe('b2');
  });
});

describe('mapBank', () => {
  it('normaliza nulos em `""`/`null` e converte o id em string', () => {
    expect(
      mapBank({ id: 7, bank_name: null, short_name: null, country_prefix: null, bank_prefix: null }),
    ).toEqual({
      id: '7',
      bank_name: '',
      short_name: null,
      country_prefix: null,
      bank_prefix: null,
    });
  });
});
