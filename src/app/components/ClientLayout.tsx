import { Outlet, Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Package,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Users,
  Bell,
  ChevronDown,
  Home,
  Trash2,
} from "lucide-react";
import { useState } from "react";

const navigation = [
  // Link para a página inicial pública — visível também com sessão iniciada.
  { name: "Início", href: "/", icon: Home },
  { name: "Dashboard", href: "/cliente", icon: LayoutDashboard },
  { name: "Clientes", href: "/cliente/clientes", icon: Users },
  { name: "Produtos", href: "/cliente/produtos", icon: Package },
  { name: "Faturas", href: "/cliente/faturas", icon: FileText },
  { name: "Relatórios", href: "/cliente/relatorios", icon: BarChart3 },
  { name: "Configurações", href: "/cliente/configuracoes", icon: Settings },
  { name: "Lixeira", href: "/cliente/lixeira", icon: Trash2 },
];

export function ClientLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const isActive = (href: string) => {
    // `startsWith("/")` daria sempre verdadeiro em "/" — comparação exacta.
    if (href === "/") {
      return location.pathname === "/";
    }
    if (href === "/cliente") {
      return location.pathname === "/cliente" || location.pathname === "/cliente/";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-sidebar border-r border-sidebar-border">
        <div className="flex-1 flex flex-col">
          {/* Logo + Plan Badge */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-sidebar-border">
           <img src="/logo.png" alt="Fatura Mais" className="w-full h-full object-contain" />
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/30 uppercase tracking-wide">
              PRO
            </span>
          </div>

          {/* Company selector */}
          <div className="px-4 pt-5 pb-2">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border hover:bg-sidebar-accent transition-colors group">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                TL
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold text-sidebar-foreground truncate">TechLuanda Lda.</p>
                <p className="text-xs text-muted-foreground">NIF: 5417083421</p>
              </div>
              <ChevronDown size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
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
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Plan CTA */}
          <div className="mx-4 mb-4 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
            <p className="text-xs font-semibold text-foreground mb-1">Plano Profissional</p>
            <p className="text-xs text-muted-foreground mb-3">
              156 / 500 faturas utilizadas este mês
            </p>
            <div className="w-full h-1.5 bg-border rounded-full overflow-hidden mb-3">
              <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" style={{ width: "31%" }} />
            </div>
            <button className="text-xs font-semibold text-primary hover:underline">
              Fazer upgrade →
            </button>
          </div>

          {/* User section */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-sidebar-accent">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                JM
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-sidebar-foreground truncate">João Mendes</p>
                <p className="text-xs text-muted-foreground truncate">Operador</p>
              </div>
              <button
                onClick={() => navigate("/login")}
                className="text-muted-foreground hover:text-destructive transition-colors"
                title="Sair"
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
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-primary" style={{ fontFamily: "var(--font-display)" }}>
              FATURA MAIS
            </h1>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/30 uppercase">
              PRO
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors relative">
              <Bell size={20} className="text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-sidebar border-b border-sidebar-border shadow-xl max-h-[calc(100vh-4rem)] overflow-y-auto">
            {/* Company */}
            <div className="px-4 pt-4 pb-2">
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-sidebar-accent">
                <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
                  TL
                </div>
                <div>
                  <p className="text-sm font-semibold text-sidebar-foreground">TechLuanda Lda.</p>
                  <p className="text-xs text-muted-foreground">NIF: 5417083421</p>
                </div>
              </div>
            </div>
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
                        ? "bg-primary text-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent"
                      }
                    `}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 lg:mt-0 mt-16">
        {/* Top bar desktop */}
        <header className="hidden lg:flex items-center justify-between h-16 px-8 border-b border-border bg-card">
          <div />
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
              <Bell size={20} className="text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
            </button>
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
                  JM
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground leading-none">João Mendes</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Operador</p>
                </div>
                <ChevronDown size={14} className="text-muted-foreground" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-card border border-border rounded-lg shadow-lg py-1 z-50">
                  <Link
                    to="/cliente/configuracoes"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <Settings size={14} />
                    Meu Perfil
                  </Link>
                  <div className="border-t border-border my-1" />
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors"
                  >
                    <LogOut size={14} />
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
