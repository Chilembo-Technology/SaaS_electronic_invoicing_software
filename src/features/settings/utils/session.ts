/**
 * Utilitários de sessão/utilizador para a secção de Configurações.
 *
 * Centraliza a leitura de `company_id`, `role(s)` e a formatação de nomes, para
 * que nenhum componente tenha de conhecer a forma exacta do `User` do
 * `AuthContext` (que vem do `UserListResource`, com `roles[]` a começar em
 * `roles[0]`, e com o resto do frontend a ler `name`/`role`/`perfil`).
 */

import type { User } from '../../../types/api';

/** Papéis conhecidos no auth_service (`RolesAndPermissionsSeeder`). */
export const ROLES = {
  SUPER_ADMIN: 'super-admin',
  ADMINISTRATOR: 'administrator',
  OPERATOR: 'operator',
  VIEWER: 'viewer',
} as const;

export type AppRole = (typeof ROLES)[keyof typeof ROLES];

/** Etiquetas PT para apresentação. */
export const ROLE_LABELS: Record<string, string> = {
  [ROLES.SUPER_ADMIN]: 'Super Administrador',
  [ROLES.ADMINISTRATOR]: 'Administrador',
  [ROLES.OPERATOR]: 'Operador',
  [ROLES.VIEWER]: 'Visualizador',
};

/** Opções para selects de filtro. */
export const ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: ROLES.SUPER_ADMIN, label: ROLE_LABELS[ROLES.SUPER_ADMIN] },
  { value: ROLES.ADMINISTRATOR, label: ROLE_LABELS[ROLES.ADMINISTRATOR] },
  { value: ROLES.OPERATOR, label: ROLE_LABELS[ROLES.OPERATOR] },
  { value: ROLES.VIEWER, label: ROLE_LABELS[ROLES.VIEWER] },
];

/** `company_id` do utilizador logado (contexto multi-tenant). */
export function getCompanyId(user: User | null | undefined): string {
  const value = (user as { company_id?: unknown } | null | undefined)?.company_id;
  return typeof value === 'string' ? value : '';
}

/** Identificador do utilizador logado (sempre string para a API). */
export function getUserId(user: User | null | undefined): string {
  const id = user?.id;
  if (id === undefined || id === null) return '';
  return String(id);
}

/** Lista de papéis do utilizador (aceita `roles[]` ou o `role` singular). */
export function getUserRoles(user: User | null | undefined): string[] {
  if (!user) return [];

  const rawRoles = (user as { roles?: unknown }).roles;
  const fromArray = Array.isArray(rawRoles)
    ? rawRoles.filter((role): role is string => typeof role === 'string' && role.length > 0)
    : [];

  if (fromArray.length > 0) return fromArray;

  const single = typeof user.role === 'string' ? user.role : undefined;
  return single ? [single] : [];
}

export function hasRole(user: User | null | undefined, ...roles: string[]): boolean {
  const owned = getUserRoles(user);
  return roles.some((role) => owned.includes(role));
}

/** `administrator` ou `super-admin` — pode gerir empresa e utilizadores. */
export function isAdmin(user: User | null | undefined): boolean {
  return hasRole(user, ROLES.ADMINISTRATOR, ROLES.SUPER_ADMIN);
}

/** Apenas `super-admin` — pode guardar os dados da empresa. */
export function isSuperAdmin(user: User | null | undefined): boolean {
  return hasRole(user, ROLES.SUPER_ADMIN);
}

/** Etiqueta PT de um papel (com fallback para o valor cru). */
export function roleLabel(role?: string | null): string {
  if (!role) return '—';
  return ROLE_LABELS[role] ?? role;
}

/** Nome completo do utilizador, com recurso ao `name`/email como fallback. */
export function getFullName(
  user: Pick<User, 'name'> & { first_name?: unknown; last_name?: unknown } | null | undefined,
): string {
  const first = typeof user?.first_name === 'string' ? user.first_name.trim() : '';
  const last = typeof user?.last_name === 'string' ? user.last_name.trim() : '';
  const full = `${first} ${last}`.trim();
  return full || user?.name || 'Utilizador';
}

/** Iniciais para o avatar textual (`Luís Chilembo` → `LC`). */
export function getInitials(name?: string): string {
  if (!name) return 'US';
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}
