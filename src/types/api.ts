export interface User {
  id: string | number;
  name: string;
  email: string;
  role?: string;
  perfil?: 'Administrador' | 'Operador' | 'Visualizador' | string;
  ativo?: boolean;
  status?: string;
  avatar?: string;
  ultimoAcesso?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  [key: string]: unknown;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password?: string;
  role?: string;
  perfil?: string;
  [key: string]: unknown;
}

export interface UpdateUserDTO {
  id: string | number;
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  perfil?: string;
  ativo?: boolean;
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
  plano?: 'Básico' | 'Profissional' | 'Enterprise' | string;
  faturas?: number;
  limite?: number;
  usuarios?: number;
  status?: 'Ativa' | 'Suspensa' | string;
  ativo?: boolean;
  dataCriacao?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  [key: string]: unknown;
}

export interface CreateCompanyDTO {
  name: string;
  nif?: string;
  taxId?: string;
  address?: string;
  phone?: string;
  email?: string;
  plano?: string;
  limite?: number;
  [key: string]: unknown;
}

export interface UpdateCompanyDTO {
  id: string | number;
  name?: string;
  nif?: string;
  taxId?: string;
  address?: string;
  phone?: string;
  email?: string;
  plano?: string;
  status?: string;
  [key: string]: unknown;
}

export interface TrashItem {
  id: string | number;
  categoria: 'empresas' | 'usuarios' | 'faturas' | 'clientes' | 'produtos' | string;
  nome: string;
  detalhe?: string;
  apagadoPor?: string;
  apagadoEm?: string;
  expiresIn?: number;
  [key: string]: unknown;
}
