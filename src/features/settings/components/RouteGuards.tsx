import type { ReactNode } from 'react';
import { Link, Navigate, useLocation } from 'react-router';
import { Loader2 } from 'lucide-react';

import { useAuth } from '../../../contexts/AuthContext';
import { useFinancialInstitution } from '../../invoices/hooks/useFinancialInstitution';
import { isAdmin, isSuperAdmin } from '../utils/session';

/**
 * Guardas de rota da secção de Configurações.
 *
 * - `RequireAuth`  → exige sessão; sem sessão volta a `/login`.
 * - `RequireAdmin` → exige `administrator` ou `super-admin`; sem permissão
 *   redireciona para `/configuracoes/perfil` (rota aberta a todos).
 */

function GuardLoader({ label }: { label: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center gap-2 text-sm text-muted-foreground">
      <Loader2 size={18} className="animate-spin" aria-hidden="true" />
      {label}
    </div>
  );
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <GuardLoader label="A carregar…" />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

/**
 * `RequireFinancialInstitution` → só instituições financeiras (bancos) acedem
 * (ex.: emissão de Factura Genérica). É uma protecção de UI: o fiscal_core
 * recusa (403) o pedido de qualquer outra empresa.
 */
export function RequireFinancialInstitution({ children }: { children: ReactNode }) {
  const { isFinancialInstitution, isLoading } = useFinancialInstitution();

  if (isLoading) return <GuardLoader label="A verificar permissões…" />;

  if (!isFinancialInstitution) {
    return (
      <div className="p-6 lg:p-10">
        <div
          role="alert"
          className="mx-auto max-w-xl rounded-xl border border-border bg-card p-6 text-sm shadow-sm"
        >
          <h1 className="mb-2 text-base font-semibold text-foreground">Acesso restrito</h1>
          <p className="mb-4 text-muted-foreground">
            A Factura Genérica só pode ser emitida por instituições bancárias.
          </p>
          <Link className="font-medium text-primary underline-offset-4 hover:underline" to="/invoices">
            Voltar aos documentos
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * `RequireSuperAdmin` → só o super-admin da plataforma (gestão de todas as
 * empresas). Os restantes papéis voltam ao painel. Protecção de UI: o
 * organization_service recusa (403) as rotas de super-admin.
 */
export function RequireSuperAdmin({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <GuardLoader label="A verificar permissões…" />;

  if (!isSuperAdmin(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <GuardLoader label="A verificar permissões…" />;

  if (!isAdmin(user)) {
    return <Navigate to="/configuracoes/perfil" replace />;
  }

  return <>{children}</>;
}
