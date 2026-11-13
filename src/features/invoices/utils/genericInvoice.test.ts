import { describe, expect, it } from 'vitest';

import {
  accountTotals,
  buildGenericInvoicePayload,
  documentTotals,
  makeAccount,
  makeMovement,
  validateGenericInvoiceForm,
  type AccountDraft,
  type GenericInvoiceForm,
} from './genericInvoice';

/** Exemplar: 1 movimento, 4 500,00 x 1, IVA 14% = 630,00 → 5 130,00 AOA. */
function exemplarAccount(): AccountDraft {
  return {
    ...makeAccount('2026-08-31'),
    account_number: '13093074910001',
    service_location_code: '0537',
    service_location_name: '537 - DEPENDENCIA AVENCA',
    movements: [
      {
        ...makeMovement('2026-08-31'),
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
        { ...makeMovement('2026-08-31'), unit_price: '100', tax_percentage: '0' },
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

  it('marca os movimentos sem IVA como isentos com o motivo', () => {
    const account = exemplarAccount();
    account.movements[0] = { ...account.movements[0], tax_percentage: '0', tax_exemption_reason: 'Art. 12.º CIVA' };

    const line = buildGenericInvoicePayload(form([account])).accounts[0].lines[0];

    expect(line).toMatchObject({ tax_code: 'ISE', tax_percentage: 0, tax_exemption_reason: 'Art. 12.º CIVA' });
  });
});

describe('Factura Genérica — validação', () => {
  it('aceita o exemplar', () => {
    expect(validateGenericInvoiceForm(form([exemplarAccount()]))).toBeNull();
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

  it('exige o motivo nos movimentos isentos', () => {
    const account = exemplarAccount();
    account.movements[0] = { ...account.movements[0], tax_percentage: '0' };

    expect(validateGenericInvoiceForm(form([account]))).toMatch(/motivo da não aplicação/);
  });
});
