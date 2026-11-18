/**
 * Totais do documento com o MESMO arredondamento do fiscal_core
 * (TaxCalculator): base da linha arredondada a 2 casas, imposto da linha
 * arredondado a 2 casas (0 para NS, NA e ISE), totais somados e arredondados.
 * Assim o valor pago numa FR/AR é exactamente o GrossTotal que o backend calcula.
 */

interface TotalsLine {
  quantity: string | number;
  unit_price: string | number;
  tax_type?: string | null;
  tax_code?: string | null;
  tax_percentage?: string | number | null;
}

export interface DocumentTotals {
  net: number;
  tax: number;
  gross: number;
}

const toNumber = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined || value === '') return 0;
  const parsed = typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
};

/** Arredondamento a 2 casas "half away from zero", como o round() do PHP. */
export const round2 = (value: number): number =>
  Math.sign(value) * Math.round((Math.abs(value) + Number.EPSILON) * 100) / 100;

function lineTax(net: number, line: TotalsLine): number {
  const type = (line.tax_type ?? 'IVA').toUpperCase();
  const code = (line.tax_code ?? 'NOR').toUpperCase();
  if (type === 'NS' || code === 'NA' || code === 'ISE') return 0;
  return round2((net * toNumber(line.tax_percentage)) / 100);
}

export function computeDocumentTotals(lines: TotalsLine[]): DocumentTotals {
  let net = 0;
  let tax = 0;
  for (const line of lines) {
    const lineNet = round2(toNumber(line.quantity) * toNumber(line.unit_price));
    net += lineNet;
    tax += lineTax(lineNet, line);
  }
  net = round2(net);
  tax = round2(tax);
  return { net, tax, gross: round2(net + tax) };
}

/**
 * FR/AR: a soma dos pagamentos tem de ser igual ao total do documento
 * (o fiscal_core recusa com 422). Devolve a mensagem ou null.
 */
export function validatePaymentsTotal(payments: { payment_amount: number }[], gross: number): string | null {
  const paid = round2(payments.reduce((sum, payment) => sum + toNumber(payment.payment_amount), 0));
  if (Math.abs(paid - round2(gross)) > 0.005) {
    return `A soma dos pagamentos (${formatAmount(paid)}) tem de ser igual ao total do documento (${formatAmount(gross)}).`;
  }
  return null;
}

function formatAmount(value: number): string {
  return value.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
