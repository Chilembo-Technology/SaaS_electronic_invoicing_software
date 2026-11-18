/**
 * Tipos de factura que não admitem valor zero (igual ao fiscal_core:
 * BaseInvoiceRequest::rejectsZeroValue). Guias (GT/GR) e documentos de
 * conferência (PP/OR) podem ter valor 0.
 */
export const ZERO_VALUE_FORBIDDEN_TYPES: readonly string[] = ['FT', 'FR', 'FG', 'AC', 'AR', 'TV', 'GF'];

export function rejectsZeroValue(type: string): boolean {
  return ZERO_VALUE_FORBIDDEN_TYPES.includes(type.toUpperCase());
}

interface ValueLine {
  quantity: string | number;
  unit_price: string | number;
}

const toNumber = (value: string | number): number => {
  const parsed = typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
};

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

/**
 * Linhas com preço unitário 0 ou total do documento 0 (bases das linhas
 * arredondadas a 2 casas, como no fiscal_core). Devolve a mensagem ou null.
 */
export function validateDocumentValue(lines: ValueLine[], linePrefix = 'Linha'): string | null {
  const zeroIndex = lines.findIndex((line) => toNumber(line.unit_price) === 0);
  if (zeroIndex >= 0) {
    return `${linePrefix} ${zeroIndex + 1}: o preço unitário tem de ser superior a zero neste tipo de documento.`;
  }

  const netTotal = lines.reduce(
    (sum, line) => sum + round2(toNumber(line.quantity) * toNumber(line.unit_price)),
    0,
  );
  if (round2(netTotal) <= 0) {
    return 'O total do documento não pode ser zero.';
  }

  return null;
}
