import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';

/**
 * `RequireFinancialInstitution`: a emissão de Factura Genérica (e o acesso
 * directo ao URL `/invoices/create/GF`) só é mostrada a instituições financeiras.
 */

const { mocks } = vi.hoisted(() => ({
  mocks: { getCompany: vi.fn(), user: { id: 'u1', company_id: 'c1' } as Record<string, unknown> | null },
}));

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: mocks.user, isAuthenticated: true, isLoading: false }),
}));

vi.mock('../services/companySettingsService', () => ({
  companySettingsService: { getCompany: mocks.getCompany },
}));

import { RequireFinancialInstitution } from './RouteGuards';

function renderGuard(path = '/invoices/create/GF') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/invoices/create/GF"
          element={
            <RequireFinancialInstitution>
              <p>Formulário da Factura Genérica</p>
            </RequireFinancialInstitution>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RequireFinancialInstitution', () => {
  beforeEach(() => {
    mocks.getCompany.mockReset();
    mocks.user = { id: 'u1', company_id: 'c1' };
  });

  it('mostra o conteúdo a instituições financeiras', async () => {
    mocks.getCompany.mockResolvedValueOnce({ id: 'c1', is_financial_institution: true });

    renderGuard();

    expect(await screen.findByText('Formulário da Factura Genérica')).toBeInTheDocument();
    expect(mocks.getCompany).toHaveBeenCalledWith('c1');
  });

  it('bloqueia o acesso directo ao URL a empresas que não são bancos', async () => {
    mocks.getCompany.mockResolvedValueOnce({ id: 'c1', is_financial_institution: false });

    renderGuard();

    expect(
      await screen.findByText('A Factura Genérica só pode ser emitida por instituições bancárias.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Formulário da Factura Genérica')).not.toBeInTheDocument();
  });

  it('também protege o URL em minúsculas (/invoices/create/gf)', async () => {
    mocks.getCompany.mockResolvedValueOnce({ id: 'c1', is_financial_institution: false });

    renderGuard('/invoices/create/gf');

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.queryByText('Formulário da Factura Genérica')).not.toBeInTheDocument();
  });

  it('bloqueia (fail-closed) quando não consegue obter a empresa', async () => {
    mocks.getCompany.mockRejectedValueOnce(new Error('500'));

    renderGuard();

    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });
});
