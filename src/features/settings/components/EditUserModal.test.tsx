import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Os serviços não são chamados no render; o mock evita qualquer rede acidental.
vi.mock('../../../lib/api', () => ({
  authApi: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}));

import { EditUserModal } from './EditUserModal';
import type { UserListItem } from '../types/user.types';

const USER: UserListItem = {
  id: 'u1',
  first_name: 'Ana',
  last_name: 'Silva',
  email: 'ana@kianda.ao',
  phone_number: '923000000',
  bi_number: '',
  path_photo: null,
  status: 'active',
  company_id: 'c1',
  roles: ['administrator'],
  created_at: null,
};

describe('EditUserModal', () => {
  it('não renderiza nada quando não há utilizador selecionado', () => {
    const { container } = render(
      <EditUserModal user={null} companyId="c1" open={false} onOpenChange={() => {}} onSaved={() => {}} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('apresenta o formulário e mostra o papel atual como não editável', () => {
    render(
      <EditUserModal user={USER} companyId="c1" open onOpenChange={() => {}} onSaved={() => {}} />,
    );

    expect(screen.getByText('Editar utilizador')).toBeInTheDocument();
    expect(screen.getByText(/não editável/i)).toBeInTheDocument();
  });
});
