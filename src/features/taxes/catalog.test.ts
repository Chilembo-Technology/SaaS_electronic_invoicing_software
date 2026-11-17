import { describe, expect, it } from 'vitest';

import { lineTaxFields, validateTaxChoice, type TaxOption } from './catalog';

const normal: TaxOption = {
  id: 'nor',
  tax_type: 'IVA',
  tax_country_region: 'AO',
  tax_code: 'NOR',
  description: 'IVA — Taxa normal',
  tax_percentage: 14,
  label: 'IVA — Taxa normal — 14%',
  requires_exemption_reason: false,
  is_global: true,
  is_default: true,
};

const exempt: TaxOption = {
  ...normal,
  id: 'ise',
  tax_code: 'ISE',
  tax_percentage: 0,
  label: 'IVA — Isento — 0%',
  requires_exemption_reason: true,
  is_default: false,
};

describe('validateTaxChoice', () => {
  it('aceita a taxa normal sem motivo', () => {
    expect(validateTaxChoice([normal, exempt], 'nor', '')).toEqual({});
  });

  it('exige o motivo de isenção a 0%', () => {
    expect(validateTaxChoice([normal, exempt], 'ise', '')).toEqual({
      exemption: 'O motivo de isenção é obrigatório quando a taxa é 0%.',
    });
    expect(validateTaxChoice([normal, exempt], 'ise', 'M10')).toEqual({});
  });

  it('recusa um imposto que não está no catálogo', () => {
    expect(validateTaxChoice([normal], 'outro', '')).toEqual({ tax: 'Escolha o imposto.' });
  });
});

describe('lineTaxFields', () => {
  it('envia o motivo só quando a taxa é 0%', () => {
    expect(lineTaxFields(normal, 'M10').tax_exemption_code).toBeUndefined();
    expect(lineTaxFields(exempt, 'M10')).toEqual({
      tax_type: 'IVA',
      tax_country_region: 'AO',
      tax_code: 'ISE',
      tax_percentage: 0,
      tax_exemption_code: 'M10',
    });
  });
});
