import { orgApiClient } from './apiClient';
import { Company, CreateCompanyDTO } from '../types/api';

export const organizationService = {
  async listCompanies(): Promise<Company[]> {
    const response = await orgApiClient.get<Company[]>('/companies');
    return response.data;
  },

  async createCompany(data: CreateCompanyDTO): Promise<Company> {
    const response = await orgApiClient.post<Company>('/companies', data);
    return response.data;
  },
};
