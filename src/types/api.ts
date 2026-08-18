export interface User {
  id: string | number;
  name: string;
  email: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface AuthLoginCredentials {
  email: string;
  password?: string;
  [key: string]: unknown;
}

export interface AuthLoginResponse {
  token: string;
  user: User;
  token_type?: string;
  expires_in?: number;
}

export interface Company {
  id: string | number;
  name: string;
  nif?: string;
  taxId?: string;
  address?: string;
  phone?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface CreateCompanyDTO {
  name: string;
  nif?: string;
  taxId?: string;
  address?: string;
  phone?: string;
  email?: string;
  [key: string]: unknown;
}
