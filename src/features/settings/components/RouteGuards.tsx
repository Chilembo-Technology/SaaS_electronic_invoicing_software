import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { Loader2 } from 'lucide-react';

import { useAuth } from '../../../contexts/AuthContext';
import { isAdmin } from '../utils/session';

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

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <GuardLoader label="A verificar permissões…" />;

  if (!isAdmin(user)) {
    return <Navigate to="/configuracoes/perfil" replace />;
  }

  return <>{children}</>;
}
