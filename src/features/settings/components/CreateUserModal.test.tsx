import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Os serviços não são chamados no render; o mock evita qualquer rede acidental.
vi.mock('../../../lib/api', () => ({
  authApi: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}));

import { CreateUserModal } from './CreateUserModal';

describe('CreateUserModal', () => {
  it('não renderiza nada quando está fechado', () => {
    const { container } = render(
      <CreateUserModal companyId="c1" open={false} onOpenChange={() => {}} onCreated={() => {}} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('apresenta o formulário de criação com os campos obrigatórios', () => {
    render(<CreateUserModal companyId="c1" open onOpenChange={() => {}} onCreated={() => {}} />);

    expect(screen.getByText('Adicionar Utilizador')).toBeInTheDocument();
    expect(screen.getByText(/Crie um novo utilizador/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Criar Utilizador/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    expect(screen.getByText(/Fotografia \(opcional\)/)).toBeInTheDocument();
    // Papel + Estado são os dois selects (Radix = combobox).
    expect(screen.getAllByRole('combobox')).toHaveLength(2);
  });

  it('não expõe o company_id como campo do formulário', () => {
    render(<CreateUserModal companyId="c1" open onOpenChange={() => {}} onCreated={() => {}} />);

    expect(screen.queryByLabelText(/empresa/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId('company_id')).not.toBeInTheDocument();
  });
});