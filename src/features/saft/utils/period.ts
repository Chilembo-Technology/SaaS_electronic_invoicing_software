import type { SaftExport, SaftExportRequest } from '../types';

export type SaftPeriodMode = 'year' | 'month' | 'range';

export interface SaftPeriodForm {
  mode: SaftPeriodMode;
  year: string;
  month: string;
  startDate: string;
  endDate: string;
}

/**
 * Converte o formulário no corpo de `POST /saft/exports`, ou devolve a
 * mensagem de erro (validação local; o backend valida de novo).
 */
export function buildSaftRequest(form: SaftPeriodForm): SaftExportRequest | string {
  if (form.mode === 'range') {
    if (!form.startDate || !form.endDate) return 'Indique as datas de início e de fim.';
    if (form.endDate < form.startDate) return 'A data de fim não pode ser anterior à de início.';
    if (form.startDate.slice(0, 4) !== form.endDate.slice(0, 4)) {
      return 'O período tem de estar dentro do mesmo ano fiscal.';
    }
    return { start_date: form.startDate, end_date: form.endDate };
  }

  const year = Number(form.year);
  if (!Number.isInteger(year) || year < 2000) return 'Indique o ano fiscal.';

  if (form.mode === 'month') {
    const month = Number(form.month);
    if (!Number.isInteger(month) || month < 1 || month > 12) return 'Indique o mês.';
    return { fiscal_year: year, month };
  }

  return { fiscal_year: year };
}

export const SAFT_STATUS_LABELS: Record<SaftExport['status'], string> = {
  pending: 'Em fila',
  processing: 'A gerar',
  available: 'Disponível',
  failed: 'Falhou',
};

/** Texto da validação XSD de um export. */
export function xsdLabel(item: SaftExport): string | null {
  if (item.xsd_status === 'validated') return 'Validado (XSD)';
  if (item.xsd_status === 'not_validated') return 'Gerado sem validação XSD';
  if (item.xsd_status === 'invalid') return 'Rejeitado pelo XSD';
  return null;
}

export function formatFileSize(bytes: number | null): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
