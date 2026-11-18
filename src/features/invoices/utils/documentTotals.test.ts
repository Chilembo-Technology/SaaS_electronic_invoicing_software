import { describe, expect, it } from 'vitest';
import { PAYMENT_MECHANISM_CODES, PAYMENT_MECHANISM_OPTIONS } from '../constants';
import { computeDocumentTotals, validatePaymentsTotal } from './documentTotals';

describe('totais do documento (mesmo arredondamento do fiscal_core)', () => {
  it('arredonda a base e o imposto de cada linha a 2 casas antes de somar', () => {
    // 3 × 0,335 = 1,005 → 1,01 por linha; IVA 14 % = 0,1414 → 0,14 por linha.
    const line = { quantity: '3', unit_price: '0.335', tax_type: 'IVA', tax_code: 'NOR', tax_percentage: '14' };
    expect(computeDocumentTotals([line, line])).toEqual({ net: 2.02, tax: 0.28, gross: 2.3 });
  });

  it('NS, NA e ISE não pagam imposto', () => {
    expect(
      computeDocumentTotals([
        { quantity: 1, unit_price: 100, tax_type: 'NS', tax_code: 'NS', tax_percentage: 14 },
        { quantity: 1, unit_price: 100, tax_type: 'IVA', tax_code: 'ISE', tax_percentage: 14 },
      ]),
    ).toEqual({ net: 200, tax: 0, gross: 200 });
  });
});

describe('FR/AR — soma dos pagamentos = total', () => {
  it('aceita pagamentos que somam o total', () => {
    expect(validatePaymentsTotal([{ payment_amount: 1000 }, { payment_amount: 140 }], 1140)).toBeNull();
  });

  it('recusa pagamentos a menos ou a mais', () => {
    expect(validatePaymentsTotal([{ payment_amount: 1000 }], 1140)).toMatch(
      /^A soma dos pagamentos \(1[\s.  ]?000,00\) tem de ser igual ao total do documento \(1[\s.  ]?140,00\)\.$/,
    );
    expect(validatePaymentsTotal([{ payment_amount: 1140.02 }], 1140)).not.toBeNull();
  });
});

describe('PaymentMechanism', () => {
  it('oferece exactamente os códigos do Decreto 317/20 e envia o código, não o índice', () => {
    expect([...PAYMENT_MECHANISM_CODES].sort()).toEqual(
      ['CC', 'CD', 'CH', 'CI', 'CO', 'CS', 'DE', 'MB', 'NU', 'OU', 'PR', 'TB'],
    );
    for (const option of PAYMENT_MECHANISM_OPTIONS) {
      expect(option.value).toMatch(/^[A-Z]{2}$/);
    }
  });
});
