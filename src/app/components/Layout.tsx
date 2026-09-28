import { Outlet, Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  BarChart3,
  Settings,
  Building2,
  CreditCard,
  LogOut,
  Menu,
  X,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Produtos", href: "/produtos", icon: Package },
  { name: "Faturas", href: "/faturas", icon: FileText },
  { name: "Relatórios", href: "/relatorios", icon: BarChart3 },
  { name: "Configurações", href: "/configuracoes", icon: Settings },
  { name: "Lixeira", href: "/lixeira", icon: Trash2 },
];

const adminNavigation = [
  { name: "Empresas", href: "/empresas", icon: Building2 },
  { name: "Usuários", href: "/usuarios", icon: Users },
  { name: "Planos", href: "/planos", icon: CreditCard },
];

export function Layout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(href);
  };

  const getInitials = (name?: string) => {
    if (!name) return "US";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const userName = user?.name || "Luis Chilembo";
  const userRole = (user?.role || user?.perfil || "Administrador").toString();
  const userEmail = user?.email || "luis@chilembo.tech";

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-sidebar border-r border-sidebar-border">
        <div className="flex-1 flex flex-col">
          {/* Logo */}
          <div className="h-20 flex items-center px-6 border-b border-sidebar-border">
            <img src="/logo.png" alt="Fatura Mais" className="w-full h-full object-contain" />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${active
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}

            <div className="pt-6">
              <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Administração
              </p>
              {adminNavigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                      ${active
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      }
                    `}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-sidebar-accent">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                {getInitials(userName)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-sidebar-foreground truncate">{userName}</p>
                <p className="text-xs text-muted-foreground truncate">{userRole}</p>
              </div>
              <button
                onClick={logout}
                title="Sair da Conta"
                className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-lg hover:bg-background"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar border-b border-sidebar-border">
        <div className="flex items-center justify-between h-16 px-4">
          <h1 className="text-lg font-bold text-primary" style={{ fontFamily: 'var(--font-display)' }}>
            FATURA MAIS
          </h1>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-sidebar border-b border-sidebar-border shadow-xl max-h-[calc(100vh-4rem)] overflow-y-auto">
            <nav className="px-4 py-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                      ${active
                        ? 'bg-primary text-primary-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent'
                      }
                    `}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}

              <div className="pt-4">
                <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Administração
                </p>
                {adminNavigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                        ${active
                          ? 'bg-primary text-primary-foreground'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent'
                        }
                      `}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
              <div className="pt-4 border-t border-sidebar-border">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors font-medium text-sm"
                >
                  <LogOut size={20} />
                  <span>Sair da Conta ({userEmail})</span>
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 lg:mt-0 mt-16">
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
