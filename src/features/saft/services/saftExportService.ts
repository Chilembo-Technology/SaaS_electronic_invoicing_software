import { fiscalApi } from '../../../lib/api';
import type { SaftExport, SaftExportDownload, SaftExportRequest } from '../types';

interface Envelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: { current_page: number; last_page: number; per_page: number; total: number };
}

/**
 * Exportação SAF-T (AO) no fiscal_core. A empresa é sempre a do token; só
 * administradores e super-admin (o backend responde 403 aos restantes).
 */
export const saftExportService = {
  /** `GET /saft/exports` — histórico da empresa (mais recente primeiro). */
  async list(page = 1, perPage = 20): Promise<{ data: SaftExport[]; total: number }> {
    const response = await fiscalApi.get<Envelope<SaftExport[]>>('/saft/exports', {
      params: { page, per_page: perPage },
    });
    return { data: response.data.data ?? [], total: response.data.meta?.total ?? 0 };
  },

  /** `POST /saft/exports` — pede a geração (202; a geração corre na fila). */
  async request(period: SaftExportRequest): Promise<SaftExport> {
    const response = await fiscalApi.post<Envelope<SaftExport>>('/saft/exports', period);
    return response.data.data as SaftExport;
  },

  /** `GET /saft/exports/{id}` — estado, avisos e erros. */
  async show(id: string): Promise<SaftExport> {
    const response = await fiscalApi.get<Envelope<SaftExport>>(`/saft/exports/${id}`);
    return response.data.data as SaftExport;
  },

  /** `GET /saft/exports/{id}/download` — URL assinado e temporário do ficheiro. */
  async downloadUrl(id: string): Promise<SaftExportDownload> {
    const response = await fiscalApi.get<Envelope<SaftExportDownload>>(`/saft/exports/${id}/download`);
    return response.data.data as SaftExportDownload;
  },
};
