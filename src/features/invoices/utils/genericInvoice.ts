/**
 * Lógica pura do formulário da Factura Genérica (GF): rascunhos, validação,
 * totais (por conta e do documento) e construção do payload do fiscal_core.
 */

import type { CreateGenericInvoicePayload } from '../types';

export interface MovementDraft {
  id: string;
  movement_date: string;
  movement_time: string;
  product_code: string;
  product_description: string;
  movement_reference: string;
  quantity: string;
  unit_price: string;
  tax_percentage: string;
  tax_exemption_reason: string;
}

export interface AccountDraft {
  id: string;
  account_number: string;
  service_location_code: string;
  service_location_name: string;
  movements: MovementDraft[];
}

export interface GenericInvoiceForm {
  customerCode: string;
  customerName: string;
  customerTaxId: string;
  invoiceDate: string;
  currencyCode: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  accounts: AccountDraft[];
}

export interface Totals {
  net: number;
  tax: number;
  gross: number;
}

export function toNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function makeMovement(date: string): MovementDraft {
  return {
    id: crypto.randomUUID(),
    movement_date: date,
    movement_time: '00:00:00',
    product_code: '',
    product_description: '',
    movement_reference: '',
    quantity: '1',
    unit_price: '0',
    tax_percentage: '14',
    tax_exemption_reason: '',
  };
}

export function makeAccount(date: string): AccountDraft {
  return {
    id: crypto.randomUUID(),
    account_number: '',
    service_location_code: '',
    service_location_name: '',
    movements: [makeMovement(date)],
  };
}

/** Totais de um movimento (IVA arredondado à linha, como no fiscal_core). */
export function movementTotals(movement: MovementDraft): Totals {
  const net = round2(toNumber(movement.quantity) * toNumber(movement.unit_price));
  const tax = round2((net * toNumber(movement.tax_percentage)) / 100);
  return { net, tax, gross: round2(net + tax) };
}

export function sumTotals(items: Totals[]): Totals {
  return items.reduce(
    (acc, item) => ({
      net: round2(acc.net + item.net),
      tax: round2(acc.tax + item.tax),
      gross: round2(acc.gross + item.gross),
    }),
    { net: 0, tax: 0, gross: 0 },
  );
}

export function accountTotals(account: AccountDraft): Totals {
  return sumTotals(account.movements.map(movementTotals));
}

export function documentTotals(accounts: AccountDraft[]): Totals {
  return sumTotals(accounts.map(accountTotals));
}

/** Valida o formulário; devolve a primeira mensagem de erro ou `null`. */
export function validateGenericInvoiceForm(form: GenericInvoiceForm): string | null {
  if (!form.customerCode.trim()) return 'Selecione o cliente.';
  if (!form.invoiceDate) return 'Indique a data do documento.';
  if (!form.billingPeriodStart || !form.billingPeriodEnd) {
    return 'Indique o período de facturação (início e fim).';
  }
  if (form.billingPeriodEnd < form.billingPeriodStart) {
    return 'O fim do período de facturação não pode ser anterior ao início.';
  }
  if (form.accounts.length === 0) return 'Adicione pelo menos uma conta.';

  for (const [index, account] of form.accounts.entries()) {
    const label = `Conta ${index + 1}`;
    if (!account.account_number.trim()) return `${label}: indique o número da conta.`;
    if (!account.service_location_name.trim()) {
      return `${label}: indique o local da prestação de serviços.`;
    }
    if (account.movements.length === 0) return `${label}: adicione pelo menos um movimento.`;

    for (const movement of account.movements) {
      if (!movement.movement_date || !movement.movement_time) {
        return `${label}: todos os movimentos precisam de data e hora.`;
      }
      if (!movement.product_code.trim() || !movement.product_description.trim()) {
        return `${label}: todos os movimentos precisam de código e descrição.`;
      }
      if (toNumber(movement.quantity) <= 0) {
        return `${label}: a quantidade tem de ser superior a zero.`;
      }
      if (toNumber(movement.unit_price) < 0) {
        return `${label}: o preço unitário não pode ser negativo.`;
      }
      if (toNumber(movement.tax_percentage) === 0 && !movement.tax_exemption_reason.trim()) {
        return `${label}: indique o motivo da não aplicação de imposto nos movimentos isentos.`;
      }
    }
  }

  return null;
}

function normalizeTime(time: string): string {
  return time.length === 5 ? `${time}:00` : time;
}

/**
 * Constrói o payload do `POST /invoices/generic-invoice`. Todas as contas usam
 * a moeda do documento (o backend recusa moedas diferentes com 422).
 */
export function buildGenericInvoicePayload(form: GenericInvoiceForm): CreateGenericInvoicePayload {
  return {
    customer_code: form.customerCode.trim(),
    customer_name: form.customerName.trim() || undefined,
    customer_tax_id: form.customerTaxId.trim() || undefined,
    invoice_date: form.invoiceDate,
    currency_code: form.currencyCode,
    billing_period_start: form.billingPeriodStart,
    billing_period_end: form.billingPeriodEnd,
    accounts: form.accounts.map((account) => ({
      account_number: account.account_number.trim(),
      service_location_code: account.service_location_code.trim() || undefined,
      service_location_name: account.service_location_name.trim(),
      currency_code: form.currencyCode,
      lines: account.movements.map((movement) => {
        const isExempt = toNumber(movement.tax_percentage) === 0;
        return {
          movement_at: `${movement.movement_date} ${normalizeTime(movement.movement_time)}`,
          movement_reference: movement.movement_reference.trim() || undefined,
          product_code: movement.product_code.trim(),
          product_description: movement.product_description.trim(),
          quantity: toNumber(movement.quantity),
          unit_price: toNumber(movement.unit_price),
          tax_type: 'IVA' as const,
          tax_code: isExempt ? 'ISE' : 'NOR',
          tax_percentage: toNumber(movement.tax_percentage),
          tax_exemption_reason: isExempt ? movement.tax_exemption_reason.trim() : undefined,
        };
      }),
    })),
  };
}
