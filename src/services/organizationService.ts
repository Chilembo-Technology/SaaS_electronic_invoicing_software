import { orgApi } from '../lib/api';
import { Company, CreateCompanyDTO, UpdateCompanyDTO } from '../types/api';

export const organizationService = {
  async listCompanies(): Promise<Company[]> {
    try {
      const response = await orgApi.get<Company[]>('/companies');
      return response.data;
    } catch {
      // Fallback para rota /v1/company/list se necessário
      const response = await orgApi.get<Company[]>('/v1/company/list');
      return response.data;
    }
  },

  async createCompany(data: CreateCompanyDTO): Promise<Company> {
    try {
      const response = await orgApi.post<Company>('/companies', data);
      return response.data;
    } catch {
      const response = await orgApi.post<Company>('/v1/company/store', data);
      return response.data;
    }
  },

  async updateCompany(data: UpdateCompanyDTO): Promise<Company> {
    try {
      const response = await orgApi.put<Company>(`/companies/${data.id}`, data);
      return response.data;
    } catch {
      const response = await orgApi.put<Company>('/v1/company/update', data);
      return response.data;
    }
  },

  async activateCompany(id: string | number): Promise<Company> {
    try {
      const response = await orgApi.put<Company>(`/companies/${id}/active`);
      return response.data;
    } catch {
      const response = await orgApi.put<Company>(`/v1/company/active/${id}`);
      return response.data;
    }
  },

  async disableCompany(id: string | number): Promise<Company> {
    try {
      const response = await orgApi.put<Company>(`/companies/${id}/disable`);
      return response.data;
    } catch {
      const response = await orgApi.put<Company>(`/v1/company/disable/${id}`);
      return response.data;
    }
  },

  async moveToTrash(id: string | number): Promise<void> {
    try {
      await orgApi.put(`/companies/${id}/trash`);
    } catch {
      await orgApi.put(`/v1/company/move-to-trash/${id}`);
    }
  },

  async listTrash(): Promise<Company[]> {
    try {
      const response = await orgApi.get<Company[]>('/companies/trash');
      return response.data;
    } catch {
      const response = await orgApi.get<Company[]>('/v1/company/trash-can');
      return response.data;
    }
  },

  async restoreCompanies(ids?: (string | number)[]): Promise<void> {
    try {
      await orgApi.put('/companies/restore', { ids });
    } catch {
      await orgApi.post('/v1/company/restore', { ids });
    }
  },

  async deletePermanently(id: string | number): Promise<void> {
    try {
      await orgApi.delete(`/companies/${id}`);
    } catch {
      await orgApi.delete(`/v1/company/permanently-delete/${id}`);
    }
  },
};
