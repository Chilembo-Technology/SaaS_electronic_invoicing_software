import { describe, expect, it } from 'vitest';

import type { SaftExport } from '../types';
import { buildSaftRequest, xsdLabel } from './period';

const base = { mode: 'year' as const, year: '2026', month: '3', startDate: '', endDate: '' };

describe('buildSaftRequest', () => {
  it('ano fiscal completo', () => {
    expect(buildSaftRequest(base)).toEqual({ fiscal_year: 2026 });
  });

  it('mês do ano', () => {
    expect(buildSaftRequest({ ...base, mode: 'month' })).toEqual({ fiscal_year: 2026, month: 3 });
  });

  it('intervalo dentro do mesmo ano', () => {
    expect(buildSaftRequest({ ...base, mode: 'range', startDate: '2026-01-01', endDate: '2026-03-31' }))
      .toEqual({ start_date: '2026-01-01', end_date: '2026-03-31' });
  });

  it('recusa intervalos entre anos ou invertidos', () => {
    expect(buildSaftRequest({ ...base, mode: 'range', startDate: '2025-12-01', endDate: '2026-01-31' }))
      .toBe('O período tem de estar dentro do mesmo ano fiscal.');
    expect(buildSaftRequest({ ...base, mode: 'range', startDate: '2026-03-10', endDate: '2026-03-01' }))
      .toBe('A data de fim não pode ser anterior à de início.');
  });
});

describe('xsdLabel', () => {
  it('avisa quando o ficheiro foi gerado sem validação XSD', () => {
    expect(xsdLabel({ xsd_status: 'not_validated' } as SaftExport)).toBe('Gerado sem validação XSD');
  });
});
