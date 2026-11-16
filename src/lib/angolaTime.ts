/**
 * Fuso de referência dos documentos fiscais (Angola, UTC+1, sem hora de verão).
 * O backend valida a data do documento contra o dia de Luanda, por isso o
 * formulário tem de propor o mesmo dia — e não o dia UTC
 * (new Date().toISOString() dá o dia anterior entre as 00h00 e as 01h00).
 */
export const ANGOLA_TIME_ZONE = 'Africa/Luanda';

/** Dia de hoje em Angola, no formato YYYY-MM-DD. */
export function todayInAngola(now: Date = new Date()): string {
  // en-CA formata como YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ANGOLA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}
