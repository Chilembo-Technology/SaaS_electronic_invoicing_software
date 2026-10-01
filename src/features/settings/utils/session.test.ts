import { describe, expect, it } from 'vitest';

import {
  getCompanyId,
  getFullName,
  getInitials,
  getUserRoles,
  isAdmin,
  isSuperAdmin,
  roleLabel,
} from './session';

const adminUser = {
  id: 'u1',
  name: 'Ana Silva',
  email: 'a@b.ao',
  role: 'administrator',
  company_id: 'c1',
  roles: ['administrator'],
} as never;

describe('session utils', () => {
  it('lê `company_id` e `roles[]`', () => {
    expect(getCompanyId(adminUser)).toBe('c1');
    expect(getUserRoles(adminUser)).toEqual(['administrator']);
  });

  it('isAdmin / isSuperAdmin', () => {
    expect(isAdmin(adminUser)).toBe(true);
    expect(isSuperAdmin(adminUser)).toBe(false);
    expect(isSuperAdmin({ roles: ['super-admin'] } as never)).toBe(true);
    expect(isAdmin({ roles: ['viewer'] } as never)).toBe(false);
  });

  it('recorre ao `role` singular quando não há `roles[]`', () => {
    expect(getUserRoles({ role: 'operator' } as never)).toEqual(['operator']);
  });

  it('getInitials / getFullName / roleLabel', () => {
    expect(getInitials('Ana Silva')).toBe('AS');
    expect(getInitials(undefined)).toBe('US');
    expect(getFullName({ name: 'x', first_name: 'Ana', last_name: 'Silva' })).toBe('Ana Silva');
    expect(roleLabel('super-admin')).toBe('Super Administrador');
    expect(roleLabel(undefined)).toBe('—');
  });
});
