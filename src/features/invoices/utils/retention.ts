import { RETENTION_DESCRIPTION_MAX_LENGTH } from '../constants';
import type { RetentionType } from '../types';

export interface RetentionDraft {
  amount: number;
  type: RetentionType | '';
  description: string;
}

/**
 * Valida a retenção do recibo (RG) com as mesmas regras do backend:
 * - com valor > 0 o tipo é obrigatório;
 * - a descrição tem no máximo 60 caracteres;
 * - no Imposto do Selo (IS) a descrição é obrigatória (código da verba).
 *
 * Devolve a mensagem de erro ou null se for válida.
 */
export function validateRetention(draft: RetentionDraft): string | null {
  if (!(draft.amount > 0)) {
    return null;
  }

  if (!draft.type) {
    return 'Indique o tipo de retenção.';
  }

  const description = draft.description.trim();

  if (description.length > RETENTION_DESCRIPTION_MAX_LENGTH) {
    return `A descrição da retenção não pode exceder ${RETENTION_DESCRIPTION_MAX_LENGTH} caracteres.`;
  }

  if (draft.type === 'IS' && description === '') {
    return 'Na retenção de Imposto do Selo indique o código da verba na descrição.';
  }

  return null;
}
