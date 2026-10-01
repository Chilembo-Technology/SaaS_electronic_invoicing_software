import { describe, expect, it, vi } from 'vitest';

const { mocks } = vi.hoisted(() => ({ mocks: { get: vi.fn(), post: vi.fn(), put: vi.fn() } }));

vi.mock('../../../lib/api', () => ({
  authApi: { get: mocks.get, post: mocks.post, put: mocks.put },
}));

import { usersSettingsService } from './usersSettingsService';

describe('usersSettingsService.listUsers', () => {
  it('desembrulha o envelope `{ data, meta }` e mapeia a lista', async () => {
    mocks.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: [
          {
            id: 'u1',
            first_name: 'Ana',
            last_name: 'Silva',
            email: 'a@b.ao',
            status: 'active',
            roles: ['administrator'],
          },
        ],
        meta: { total: 1 },
      },
    });

    const { users, meta } = await usersSettingsService.listUsers({ per_page: 100, page: 1 });

    expect(mocks.get).toHaveBeenCalledWith('/v1/users/list', { params: { per_page: 100, page: 1 } });
    expect(users[0]).toMatchObject({ id: 'u1', first_name: 'Ana', roles: ['administrator'] });
    expect(meta?.total).toBe(1);
  });

  it('aceita uma lista "crua" (array) sem envelope', async () => {
    mocks.get.mockResolvedValueOnce({ data: [{ id: 'u2', email: 'x@y.ao' }] });

    const { users, meta } = await usersSettingsService.listUsers();

    expect(users).toHaveLength(1);
    expect(meta).toBeUndefined();
  });
});

describe('usersSettingsService.activate/deactivate', () => {
  it('envia `{ ids: [id] }` para ativar', async () => {
    mocks.put.mockResolvedValueOnce({ data: {} });
    await usersSettingsService.activateUsers(['u1']);
    expect(mocks.put).toHaveBeenCalledWith('/v1/users/active', { ids: ['u1'] });
  });

  it('envia `{ ids: [id] }` para desativar', async () => {
    mocks.put.mockResolvedValueOnce({ data: {} });
    await usersSettingsService.deactivateUsers(['u1']);
    expect(mocks.put).toHaveBeenCalledWith('/v1/users/desactive', { ids: ['u1'] });
  });
});

describe('usersSettingsService.updateUser', () => {
  it('faz POST multipart para /v1/users/update/{id} com company_id e status', async () => {
    mocks.post.mockResolvedValueOnce({
      data: { success: true, data: { id: 'u1', first_name: 'Ana', status: 'inactive' } },
    });

    const updated = await usersSettingsService.updateUser('u1', {
      company_id: 'c1',
      first_name: 'Ana',
      status: 'inactive',
    });

    const [path, formData, config] = mocks.post.mock.calls[0];
    expect(path).toBe('/v1/users/update/u1');
    expect((formData as FormData).get('company_id')).toBe('c1');
    expect((formData as FormData).get('status')).toBe('inactive');
    expect(config).toEqual({ headers: { 'Content-Type': 'multipart/form-data' } });
    expect(updated.status).toBe('inactive');
  });
});
