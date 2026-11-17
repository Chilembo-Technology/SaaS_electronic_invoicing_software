/** Estado de um export SAF-T (fiscal_core `saft_exports.status`). */
export type SaftExportStatus = 'pending' | 'processing' | 'available' | 'failed';

/** Validação contra o XSD oficial: validado, sem XSD instalado, ou rejeitado. */
export type SaftXsdStatus = 'validated' | 'not_validated' | 'invalid' | null;

/** Aviso da geração (agrupado por código, com ocorrências e exemplos). */
export interface SaftExportWarning {
  code: string;
  message: string;
  count: number;
  examples: string[];
}

/** `SaftExportResource` do fiscal_core. */
export interface SaftExport {
  id: string;
  fiscal_year: number;
  start_date: string;
  end_date: string;
  status: SaftExportStatus;
  xsd_status: SaftXsdStatus;
  xsd_validated: boolean;
  download_available: boolean;
  file_name: string | null;
  file_size: number | null;
  file_sha256: string | null;
  statistics: Record<string, unknown> | null;
  warnings: SaftExportWarning[];
  errors: string[];
  created_at: string | null;
  started_at: string | null;
  finished_at: string | null;
}

/** Período pedido: ano, mês do ano, ou intervalo dentro do mesmo ano. */
export type SaftExportRequest =
  | { fiscal_year: number; month?: number }
  | { start_date: string; end_date: string };

export interface SaftExportDownload {
  url: string;
  expires_in_minutes: number;
  file_name: string;
  file_sha256: string | null;
}
