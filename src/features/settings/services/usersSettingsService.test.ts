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

describe('usersSettingsService.createUser', () => {
  const PAYLOAD = {
    first_name: 'Ana',
    last_name: 'Silva',
    email: 'ana@kianda.ao',
    password: 'segredo123',
    phone_number: '923456789',
    bi_number: '001234567LA042',
    company_id: 'c1',
    role: 'Administrator' as const,
    status: 'active' as const,
  };

  it('faz POST multipart para /v1/users com todos os campos', async () => {
    mocks.post.mockResolvedValueOnce({
      data: { success: true, data: { id: 'u9', first_name: 'Ana', status: 'active', roles: ['administrator'] } },
    });

    const created = await usersSettingsService.createUser(PAYLOAD);

    const [path, formData, config] = mocks.post.mock.calls[0];
    expect(path).toBe('/v1/users');
    expect(config).toEqual({ headers: { 'Content-Type': 'multipart/form-data' } });
    expect((formData as FormData).get('first_name')).toBe('Ana');
    expect((formData as FormData).get('email')).toBe('ana@kianda.ao');
    expect((formData as FormData).get('password')).toBe('segredo123');
    expect((formData as FormData).get('company_id')).toBe('c1');
    expect((formData as FormData).get('role')).toBe('Administrator');
    expect((formData as FormData).get('status')).toBe('active');
    // Sem foto, o campo não entra no FormData (backend trata `nullable`).
    expect((formData as FormData).get('photo')).toBeNull();
    expect(created).toMatchObject({ id: 'u9', first_name: 'Ana', roles: ['administrator'] });
  });

  it('anexa a fotografia quando existe', async () => {
    mocks.post.mockResolvedValueOnce({ data: { success: true, data: { id: 'u10' } } });

    const photo = new File(['x'], 'foto.png', { type: 'image/png' });
    await usersSettingsService.createUser({ ...PAYLOAD, photo });

    // `clearMocks` limpa os calls entre testes — este é o único call deste teste.
    const formData = mocks.post.mock.calls[0][1] as FormData;
    expect(formData.get('photo')).toBe(photo);
  });

  it('propaga o 422 do Laravel (email duplicado) sem o engolir', async () => {
    mocks.post.mockRejectedValueOnce(new Error('422'));

    await expect(usersSettingsService.createUser(PAYLOAD)).rejects.toThrow('422');
  });
});
