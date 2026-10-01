import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import type { Bank } from '../types/company.types';

/**
 * Testes do select de bancos. O `useBanks` é substituído por um duplo para
 * cobrir os estados (a carregar, erro, banco desconhecido) sem rede.
 */

const { mocks } = vi.hoisted(() => ({ mocks: { useBanks: vi.fn() } }));

vi.mock('../hooks/useBanks', () => ({ useBanks: mocks.useBanks }));

import { BankSelect } from './BankSelect';

const BANKS: Bank[] = [
  {
    id: 'b1',
    bank_name: 'Banco Angolano de Investimentos',
    short_name: 'BAI',
    country_prefix: 'AO',
    bank_prefix: '0040',
  },
  { id: 'b2', bank_name: 'Banco BFA', short_name: 'BFA', country_prefix: 'AO', bank_prefix: '0006' },
];

function mockBanks(
  overrides: Partial<{ banks: Bank[]; isLoading: boolean; error: string | null }> = {},
): void {
  mocks.useBanks.mockReturnValue({
    banks: [],
    isLoading: false,
    error: null,
    reload: vi.fn(),
    ...overrides,
  });
}

describe('BankSelect', () => {
  it('mostra o NOME do banco e guarda o id no value da opção', () => {
    mockBanks({ banks: BANKS });
    render(<BankSelect value={null} onChange={vi.fn()} />);

    const option = screen.getByRole('option', { name: 'Banco Angolano de Investimentos' });
    expect(option).toHaveAttribute('value', 'b1');
  });

  it('começa sem seleção (opção "Selecione um banco")', () => {
    mockBanks({ banks: BANKS });
    render(<BankSelect value={null} onChange={vi.fn()} />);

    expect((screen.getByLabelText('Banco') as HTMLSelectElement).value).toBe('');
    expect(screen.getByRole('option', { name: 'Selecione um banco' })).toBeInTheDocument();
  });

  it('pré-seleciona o banco correspondente ao bank_id vindo da API', () => {
    mockBanks({ banks: BANKS });
    render(<BankSelect value="b2" onChange={vi.fn()} />);

    expect((screen.getByLabelText('Banco') as HTMLSelectElement).value).toBe('b2');
  });

  it('devolve o id do banco (nunca o objeto Bank) ao escolher', () => {
    mockBanks({ banks: BANKS });
    const onChange = vi.fn();
    render(<BankSelect value={null} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText('Banco'), { target: { value: 'b2' } });

    expect(onChange).toHaveBeenCalledWith('b2');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('devolve null ao escolher a opção vazia (limpa a conta bancária)', () => {
    mockBanks({ banks: BANKS });
    const onChange = vi.fn();
    render(<BankSelect value="b1" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText('Banco'), { target: { value: '' } });

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('fica desativado com o aviso de carregamento enquanto carrega', () => {
    mockBanks({ isLoading: true });
    render(<BankSelect value={null} onChange={vi.fn()} />);

    expect(screen.getByLabelText('Banco')).toBeDisabled();
    expect(screen.getByRole('option', { name: 'A carregar bancos…' })).toBeInTheDocument();
  });

  it('mantém um banco desconhecido como opção extra (não perde o valor)', () => {
    mockBanks({ banks: BANKS });
    render(<BankSelect value="uuid-nao-listado" onChange={vi.fn()} />);

    const select = screen.getByLabelText('Banco') as HTMLSelectElement;
    expect(select.value).toBe('uuid-nao-listado');
    expect(screen.getByRole('option', { name: 'Banco selecionado (id: uuid-nao-listado)' })).toBeInTheDocument();
  });

  it('mostra o erro do campo (validador local ou 422 do backend)', () => {
    mockBanks({ banks: BANKS });
    render(
      <BankSelect
        value={null}
        onChange={vi.fn()}
        error="O ID do banco deve ser um UUID (identificador universal) válido."
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('O ID do banco deve ser um UUID');
  });

  it('mostra um aviso com nova tentativa quando a API falha, sem bloquear o formulário', () => {
    const reload = vi.fn();
    mocks.useBanks.mockReturnValue({
      banks: [],
      isLoading: false,
      error: 'Falha ao carregar a lista de bancos. Sem ligação ao servidor.',
      reload,
    });

    render(<BankSelect value={null} onChange={vi.fn()} />);

    expect(screen.getByRole('status')).toHaveTextContent('Falha ao carregar a lista de bancos.');
    expect(screen.getByLabelText('Banco')).not.toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /Tentar novamente/i }));
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
