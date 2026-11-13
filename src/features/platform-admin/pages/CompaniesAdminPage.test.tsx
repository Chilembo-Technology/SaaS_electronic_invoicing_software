import { beforeEach, describe, expect, it, vi } from 'vitest';
import { configure, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';

// A página abre um diálogo (Radix) e espera pela API simulada: sob a carga da
// suite completa em paralelo, 1 s de espera por omissão não chega.
configure({ asyncUtilTimeout: 5000 });
vi.setConfig({ testTimeout: 20000 });

/**
 * Área de super-admin /empresas: etiqueta "Banco", filtro, interruptor com
 * confirmação, e invisível para os restantes papéis.
 */

const { mocks } = vi.hoisted(() => ({
  mocks: {
    user: { id: 'u1', company_id: 'c0', roles: ['super-admin'] } as Record<string, unknown>,
    listCompanies: vi.fn(),
    setFinancialInstitution: vi.fn(),
    toast: { success: vi.fn(), error: vi.fn() },
  },
}));

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: mocks.user, isAuthenticated: true, isLoading: false }),
}));

vi.mock('../services/platformCompaniesService', () => ({
  platformCompaniesService: {
    listCompanies: mocks.listCompanies,
    setFinancialInstitution: mocks.setFinancialInstitution,
  },
}));

vi.mock('sonner', () => ({ toast: mocks.toast }));

import { RequireSuperAdmin } from '../../settings/components/RouteGuards';
import { CompaniesAdminPage } from './CompaniesAdminPage';

const bank = {
  id: 'bank-1',
  company_name: 'Banco Teste SA',
  tax_number: '5410003691',
  admin_email: 'apoio@banco.ao',
  phone: '',
  city: 'Luanda',
  province: 'Luanda',
  status: 'active',
  is_financial_institution: true,
  created_at: null,
};

const shop = { ...bank, id: 'shop-1', company_name: 'Loja Kianda Lda', tax_number: '5000000001', is_financial_institution: false };

function page(data = [bank, shop]) {
  return { data, total: data.length, currentPage: 1, isLastPage: true };
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/empresas']}>
      <Routes>
        <Route
          path="/empresas"
          element={
            <RequireSuperAdmin>
              <CompaniesAdminPage />
            </RequireSuperAdmin>
          }
        />
        <Route path="/dashboard" element={<p>PAINEL</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('CompaniesAdminPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.user = { id: 'u1', company_id: 'c0', roles: ['super-admin'] };
    mocks.listCompanies.mockResolvedValue(page());
  });

  it('mostra a etiqueta "Banco" só nas empresas marcadas', async () => {
    renderPage();

    const bankRow = (await screen.findByText('Banco Teste SA')).closest('tr') as HTMLElement;
    const shopRow = screen.getByText('Loja Kianda Lda').closest('tr') as HTMLElement;

    expect(within(bankRow).getByText('Banco')).toBeInTheDocument();
    expect(within(shopRow).queryByText('Banco')).not.toBeInTheDocument();
  });

  it('marca uma empresa como banco depois de confirmar (nome, NIF e regra da GF no diálogo)', async () => {
    mocks.setFinancialInstitution.mockResolvedValueOnce({ ...shop, is_financial_institution: true });
    renderPage();

    fireEvent.click(await screen.findByRole('switch', { name: /Loja Kianda Lda/ }));

    const dialog = await screen.findByRole('alertdialog');
    expect(within(dialog).getByText('Loja Kianda Lda')).toBeInTheDocument();
    expect(within(dialog).getByText('5000000001')).toBeInTheDocument();
    expect(within(dialog).getByText(/Só as instituições financeiras \(bancos\) podem emitir Factura Genérica/)).toBeInTheDocument();
    expect(within(dialog).getByText(/até 60 segundos/)).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Marcar como banco' }));

    await waitFor(() => expect(mocks.setFinancialInstitution).toHaveBeenCalledWith('shop-1', true));
    const shopRow = (await screen.findByText('Loja Kianda Lda')).closest('tr') as HTMLElement;
    await waitFor(() => expect(within(shopRow).getByText('Banco')).toBeInTheDocument());
    expect(mocks.toast.success).toHaveBeenCalledWith(
      expect.stringContaining('marcada como instituição financeira'),
      expect.objectContaining({ description: expect.stringContaining('60 segundos') }),
    );
  });

  it('ao desmarcar avisa que deixa de poder emitir GF e que as já emitidas se mantêm', async () => {
    mocks.setFinancialInstitution.mockResolvedValueOnce({ ...bank, is_financial_institution: false });
    renderPage();

    fireEvent.click(await screen.findByRole('switch', { name: /Banco Teste SA/ }));

    const dialog = await screen.findByRole('alertdialog');
    expect(within(dialog).getByText(/deixa de poder emitir Factura Genérica/)).toBeInTheDocument();
    expect(within(dialog).getByText(/já emitidas mantêm-se válidas/)).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Desmarcar banco' }));

    await waitFor(() => expect(mocks.setFinancialInstitution).toHaveBeenCalledWith('bank-1', false));
    const bankRow = screen.getByText('Banco Teste SA').closest('tr') as HTMLElement;
    await waitFor(() => expect(within(bankRow).queryByText('Banco')).not.toBeInTheDocument());
  });

  it('cancelar não chama a API', async () => {
    renderPage();

    fireEvent.click(await screen.findByRole('switch', { name: /Loja Kianda Lda/ }));
    fireEvent.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Cancelar' }));

    expect(mocks.setFinancialInstitution).not.toHaveBeenCalled();
  });

  it('mostra o erro do backend (ex.: 403) sem alterar a lista', async () => {
    mocks.setFinancialInstitution.mockRejectedValueOnce(new Error('Não autorizado'));
    renderPage();

    fireEvent.click(await screen.findByRole('switch', { name: /Loja Kianda Lda/ }));
    fireEvent.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Marcar como banco' }));

    await waitFor(() => expect(mocks.toast.error).toHaveBeenCalled());
    // O diálogo continua aberto (pode tentar de novo); a linha não muda.
    const shopRow = within(screen.getByRole('table', { hidden: true })).getByText('Loja Kianda Lda').closest('tr') as HTMLElement;
    expect(within(shopRow).queryByText('Banco')).not.toBeInTheDocument();
  });

  it('o filtro "Só bancos" pede a lista filtrada à API', async () => {
    renderPage();
    await screen.findByText('Banco Teste SA');

    fireEvent.click(screen.getByRole('combobox', { name: 'Instituição financeira' }));
    fireEvent.click(await screen.findByRole('option', { name: 'Só bancos' }));

    await waitFor(() =>
      expect(mocks.listCompanies).toHaveBeenLastCalledWith(expect.objectContaining({ financialInstitution: 'banks' }), 1),
    );
  });

  it.each(['administrator', 'operator', 'viewer'])('o %s não vê a página nem o interruptor', async (role) => {
    mocks.user = { id: 'u2', company_id: 'c1', roles: [role] };

    renderPage();

    expect(await screen.findByText('PAINEL')).toBeInTheDocument();
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    expect(mocks.listCompanies).not.toHaveBeenCalled();
  });

  it.each(['administrator', 'operator', 'viewer'])('o interruptor não é desenhado para %s mesmo sem o guard', async (role) => {
    mocks.user = { id: 'u2', company_id: 'c1', roles: [role] };

    render(
      <MemoryRouter>
        <CompaniesAdminPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Banco Teste SA')).toBeInTheDocument();
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
  });
});
