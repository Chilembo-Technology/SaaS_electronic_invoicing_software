import { describe, expect, it } from 'vitest';
import { rejectsZeroValue, validateDocumentValue } from './documentValue';

describe('documentos com valor zero', () => {
  it('só os tipos de factura recusam valor zero (guias e PP/OR podem)', () => {
    for (const type of ['FT', 'FR', 'FG', 'AC', 'AR', 'TV', 'GF']) {
      expect(rejectsZeroValue(type)).toBe(true);
    }
    for (const type of ['GT', 'GR', 'PP', 'OR']) {
      expect(rejectsZeroValue(type)).toBe(false);
    }
  });

  it('indica a linha com preço unitário 0', () => {
    expect(
      validateDocumentValue([
        { quantity: '1', unit_price: '100' },
        { quantity: '2', unit_price: '0' },
      ]),
    ).toBe('Linha 2: o preço unitário tem de ser superior a zero neste tipo de documento.');
  });

  it('recusa um total que arredonda a zero', () => {
    expect(validateDocumentValue([{ quantity: '0.001', unit_price: '1' }])).toBe(
      'O total do documento não pode ser zero.',
    );
  });

  it('aceita linhas com valor', () => {
    expect(validateDocumentValue([{ quantity: '1', unit_price: '0.01' }])).toBeNull();
  });
});
