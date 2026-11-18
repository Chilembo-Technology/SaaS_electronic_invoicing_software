import { describe, expect, it } from 'vitest';

import {
  accountTotals,
  buildGenericInvoicePayload,
  documentTotals,
  makeAccount,
  makeMovement,
  movementTaxPatch,
  validateGenericInvoiceForm,
  type AccountDraft,
  type GenericInvoiceForm,
} from './genericInvoice';
import type { TaxOption } from '../../taxes/catalog';

const NOR: TaxOption = {
  id: 'nor',
  tax_type: 'IVA',
  tax_country_region: 'AO',
  tax_code: 'NOR',
  description: 'IVA — Taxa normal',
  tax_percentage: 14,
  label: 'IVA — Taxa normal — 14%',
  requires_exemption_reason: false,
  is_default: true,
};

const ISE: TaxOption = {
  ...NOR,
  id: 'ise',
  tax_code: 'ISE',
  description: 'IVA — Isento',
  tax_percentage: 0,
  label: 'IVA — Isento — 0%',
  requires_exemption_reason: true,
  is_default: false,
};

const CATALOG = [NOR, ISE];

/** Exemplar: 1 movimento, 4 500,00 x 1, IVA 14% = 630,00 → 5 130,00 AOA. */
function exemplarAccount(): AccountDraft {
  return {
    ...makeAccount('2026-08-31'),
    account_number: '13093074910001',
    service_location_code: '0537',
    service_location_name: '537 - DEPENDENCIA AVENCA',
    movements: [
      {
        ...makeMovement('2026-08-31', NOR),
        movement_time: '23:59',
        product_code: 'COM_GEST',
        product_description: 'Comissão_gest_MN_Emp Ago',
        movement_reference: '822481195-82248 1195',
        quantity: '1',
        unit_price: '4500',
        tax_percentage: '14',
      },
    ],
  };
}

function form(accounts: AccountDraft[]): GenericInvoiceForm {
  return {
    customerCode: '130930749',
    customerName: 'Cliente Lda',
    customerTaxId: '5000000001',
    invoiceDate: '2026-08-31',
    currencyCode: 'AOA',
    billingPeriodStart: '2026-08-01',
    billingPeriodEnd: '2026-08-31',
    accounts,
  };
}

describe('Factura Genérica — totais', () => {
  it('calcula os totais do exemplar (4 500 + 630 = 5 130)', () => {
    expect(documentTotals([exemplarAccount()])).toEqual({ net: 4500, tax: 630, gross: 5130 });
  });

  it('calcula subtotais por conta com várias contas e linhas', () => {
    const first = exemplarAccount();
    first.movements.push({ ...makeMovement('2026-08-31'), quantity: '2', unit_price: '1000', tax_percentage: '14' });

    const second = {
      ...exemplarAccount(),
      movements: [
        { ...makeMovement('2026-08-31'), unit_price: '250', tax_percentage: '14' },
        { ...makeMovement('2026-08-31', ISE), unit_price: '100', tax_exemption_code: 'M12' },
      ],
    };

    expect(accountTotals(first)).toEqual({ net: 6500, tax: 910, gross: 7410 });
    expect(accountTotals(second)).toEqual({ net: 350, tax: 35, gross: 385 });
    expect(documentTotals([first, second])).toEqual({ net: 6850, tax: 945, gross: 7795 });
  });
});

describe('Factura Genérica — payload', () => {
  it('agrupa os movimentos por conta, com data/hora e a moeda do documento', () => {
    const payload = buildGenericInvoicePayload(form([exemplarAccount()]));

    expect(payload).toMatchObject({
      customer_code: '130930749',
      currency_code: 'AOA',
      billing_period_start: '2026-08-01',
      billing_period_end: '2026-08-31',
      accounts: [
        {
          account_number: '13093074910001',
          service_location_code: '0537',
          service_location_name: '537 - DEPENDENCIA AVENCA',
          currency_code: 'AOA',
          lines: [
            {
              movement_at: '2026-08-31 23:59:00',
              movement_reference: '822481195-82248 1195',
              product_code: 'COM_GEST',
              quantity: 1,
              unit_price: 4500,
              tax_type: 'IVA',
              tax_code: 'NOR',
              tax_percentage: 14,
            },
          ],
        },
      ],
    });
  });

  it('envia o imposto do catálogo e, a 0 %, só o código do motivo (a descrição vem do catálogo)', () => {
    const account = exemplarAccount();
    account.movements[0] = { ...account.movements[0], ...movementTaxPatch(ISE, 'M12') };

    const line = buildGenericInvoicePayload(form([account])).accounts[0].lines[0];

    expect(line).toMatchObject({
      tax_type: 'IVA',
      tax_country_region: 'AO',
      tax_code: 'ISE',
      tax_percentage: 0,
      tax_exemption_code: 'M12',
    });
    expect(line).not.toHaveProperty('tax_exemption_reason');
  });
});

describe('Factura Genérica — validação', () => {
  it('aceita o exemplar', () => {
    expect(validateGenericInvoiceForm(form([exemplarAccount()]), CATALOG)).toBeNull();
  });

  it('exige o período de facturação coerente', () => {
    expect(
      validateGenericInvoiceForm({ ...form([exemplarAccount()]), billingPeriodEnd: '2026-07-31' }),
    ).toMatch(/período de facturação/);
  });

  it('exige o número da conta e o local da prestação', () => {
    expect(validateGenericInvoiceForm(form([{ ...exemplarAccount(), account_number: '' }]))).toMatch(
      /número da conta/,
    );
    expect(
      validateGenericInvoiceForm(form([{ ...exemplarAccount(), service_location_name: '' }])),
    ).toMatch(/local da prestação/);
  });

  it('exige o motivo de isenção do catálogo nos movimentos a 0 %', () => {
    const account = exemplarAccount();
    account.movements[0] = { ...account.movements[0], ...movementTaxPatch(ISE) };

    expect(validateGenericInvoiceForm(form([account]), CATALOG)).toMatch(/motivo de isenção/);

    account.movements[0] = { ...account.movements[0], tax_exemption_code: 'M12' };
    expect(validateGenericInvoiceForm(form([account]), CATALOG)).toBeNull();
  });

  it('recusa movimentos a preço 0 e um total que arredonda a zero', () => {
    const zeroPrice = exemplarAccount();
    zeroPrice.movements[0] = { ...zeroPrice.movements[0], unit_price: '0' };
    expect(validateGenericInvoiceForm(form([zeroPrice]), CATALOG)).toMatch(/superior a zero/);

    const roundsToZero = exemplarAccount();
    roundsToZero.movements[0] = { ...roundsToZero.movements[0], quantity: '0.001', unit_price: '1' };
    expect(validateGenericInvoiceForm(form([roundsToZero]), CATALOG)).toBe(
      'O total do documento não pode ser zero.',
    );
  });

  it('exige um imposto do catálogo em cada movimento', () => {
    const account = exemplarAccount();
    account.movements[0] = { ...account.movements[0], tax_table_entry_id: '' };

    expect(validateGenericInvoiceForm(form([account]), CATALOG)).toMatch(/escolha o imposto/);
  });
});

describe('Factura Genérica — moeda estrangeira', () => {
  it('em AOA não pede câmbio nem o envia', () => {
    const payload = buildGenericInvoicePayload(form([exemplarAccount()]));

    expect(validateGenericInvoiceForm(form([exemplarAccount()]))).toBeNull();
    expect(payload.exchange_rate).toBeUndefined();
  });

  it('noutra moeda exige o câmbio para AOA', () => {
    const usd = { ...form([exemplarAccount()]), currencyCode: 'USD' };

    expect(validateGenericInvoiceForm(usd)).toMatch(/taxa de câmbio/);
    expect(validateGenericInvoiceForm({ ...usd, exchangeRate: '0' })).toMatch(/taxa de câmbio/);
  });

  it('noutra moeda envia o câmbio indicado', () => {
    const usd = { ...form([exemplarAccount()]), currencyCode: 'USD', exchangeRate: '925.5' };

    expect(validateGenericInvoiceForm(usd)).toBeNull();
    expect(buildGenericInvoicePayload(usd).exchange_rate).toBe(925.5);
  });
});
