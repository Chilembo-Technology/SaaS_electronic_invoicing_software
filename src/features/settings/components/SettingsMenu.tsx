import { Building2, Settings, UserCircle2, Users } from 'lucide-react';
import { NavLink } from 'react-router';

import { useAuth } from '../../../contexts/AuthContext';
import { isAdmin } from '../utils/session';

interface SettingsMenuItem {
  to: string;
  label: string;
  icon: typeof Building2;
  /** Só visível para `administrator` / `super-admin`. */
  adminOnly?: boolean;
}

const ITEMS: SettingsMenuItem[] = [
  { to: '/configuracoes/empresa', label: 'Empresa', icon: Building2, adminOnly: true },
  { to: '/configuracoes/perfil', label: 'O meu perfil', icon: UserCircle2 },
  { to: '/configuracoes/utilizadores', label: 'Utilizadores', icon: Users, adminOnly: true },
];

/**
 * Menu lateral da secção de Configurações. Os itens de administração ficam
 * escondidos de `operator`/`viewer` (só `administrator` e `super-admin` os vêem).
 */
export function SettingsMenu() {
  const { user } = useAuth();
  const admin = isAdmin(user);

  const items = ITEMS.filter((item) => !item.adminOnly || admin);

  return (
    <aside className="lg:w-56 flex-shrink-0">
      <div className="mb-3 flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Settings size={14} aria-hidden="true" />
        Configurações
      </div>

      <nav aria-label="Configurações" className="space-y-1">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            <Icon size={18} aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
