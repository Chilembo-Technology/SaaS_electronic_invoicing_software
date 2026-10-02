import { describe, expect, it, vi } from 'vitest';

const { mocks } = vi.hoisted(() => ({ mocks: { get: vi.fn(), post: vi.fn() } }));

vi.mock('../../../lib/api', () => ({
  authApi: { get: mocks.get, post: mocks.post },
}));

import { profileService, mapProfile } from './profileService';

describe('profileService.getProfile', () => {
  it('desembrulha `{ data }` de /v1/auth/me', async () => {
    mocks.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          id: 'u1',
          first_name: 'Ana',
          last_name: 'Silva',
          email: 'a@b.ao',
          roles: ['administrator'],
          company_id: 'c1',
        },
      },
    });

    const profile = await profileService.getProfile();

    expect(mocks.get).toHaveBeenCalledWith('/v1/auth/me');
    expect(profile).toMatchObject({
      id: 'u1',
      first_name: 'Ana',
      roles: ['administrator'],
      company_id: 'c1',
    });
  });
});

describe('profileService.updateProfile', () => {
  it('faz POST multipart para /v1/users/update/{id} com password', async () => {
    mocks.post.mockResolvedValueOnce({ data: { data: { id: 'u1' } } });

    await profileService.updateProfile('u1', { company_id: 'c1', password: 'segredo123' });

    const [path, formData, config] = mocks.post.mock.calls[0];
    expect(path).toBe('/v1/users/update/u1');
    expect((formData as FormData).get('password')).toBe('segredo123');
    expect(config).toEqual({ headers: { 'Content-Type': 'multipart/form-data' } });
  });
});

describe('mapProfile', () => {
  it('normaliza valores nulos', () => {
    expect(mapProfile(null)).toMatchObject({ id: '', roles: [], path_photo: null });
  });
});
