import { Plus, Search, Building2, CheckCircle, XCircle, MoreVertical, TrendingUp, Users, FileText, AlertTriangle, X } from "lucide-react";
import { useState } from "react";

interface Empresa {
  id: number;
  nome: string;
  nif: string;
  plano: "Básico" | "Profissional" | "Enterprise";
  faturas: number;
  limite: number;
  usuarios: number;
  status: "Ativa" | "Suspensa";
  dataCriacao: string;
}

const empresasIniciais: Empresa[] = [
  { id: 1, nome: "Tech Solutions Lda", nif: "5000123456", plano: "Profissional", faturas: 184, limite: 200, usuarios: 4, status: "Ativa", dataCriacao: "2026-01-15" },
  { id: 2, nome: "Global Import & Export", nif: "5000987654", plano: "Enterprise", faturas: 856, limite: 9999, usuarios: 12, status: "Ativa", dataCriacao: "2025-11-20" },
  { id: 3, nome: "Consultoria Premium", nif: "5000456789", plano: "Básico", faturas: 45, limite: 50, usuarios: 1, status: "Suspensa", dataCriacao: "2026-03-10" },
  { id: 4, nome: "Serviços Digitais SA", nif: "5000111222", plano: "Profissional", faturas: 198, limite: 200, usuarios: 3, status: "Ativa", dataCriacao: "2026-02-05" },
  { id: 5, nome: "MercadoLuanda", nif: "5000333444", plano: "Básico", faturas: 12, limite: 50, usuarios: 1, status: "Ativa", dataCriacao: "2026-06-01" },
];

const planoBadge: Record<string, string> = {
  Básico: "bg-secondary/10 text-secondary border border-secondary/20",
  Profissional: "bg-primary/10 text-primary border border-primary/20",
  Enterprise: "bg-purple-500/10 text-purple-700 border border-purple-500/20",
};

export function Empresas() {
  const [empresas, setEmpresas] = useState<Empresa[]>(empresasIniciais);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"todos" | "Ativa" | "Suspensa">("todos");
  const [filtroPlano, setFiltroPlano] = useState<"todos" | string>("todos");
  const [menuAberto, setMenuAberto] = useState<number | null>(null);
  const [modalSuspender, setModalSuspender] = useState<Empresa | null>(null);

  const empresasFiltradas = empresas.filter((e) => {
    const matchBusca =
      e.nome.toLowerCase().includes(busca.toLowerCase()) ||
      e.nif.includes(busca);
    const matchStatus = filtroStatus === "todos" || e.status === filtroStatus;
    const matchPlano = filtroPlano === "todos" || e.plano === filtroPlano;
    return matchBusca && matchStatus && matchPlano;
  });

  const toggleStatus = (id: number) => {
    setEmpresas(empresas.map((e) =>
      e.id === id ? { ...e, status: e.status === "Ativa" ? "Suspensa" : "Ativa" } : e
    ));
    setModalSuspender(null);
    setMenuAberto(null);
  };

  const totalAtivas = empresas.filter((e) => e.status === "Ativa").length;
  const totalFaturas = empresas.reduce((acc, e) => acc + e.faturas, 0);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Empresas
          </h1>
          <p className="text-muted-foreground">Gerencie os tenants do SaaS</p>
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 text-sm">
          <Plus size={18} />
          Nova Empresa
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="text-primary" size={18} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total</p>
          <p className="text-2xl font-bold text-foreground">{empresas.length}</p>
        </div>
        <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <CheckCircle className="text-secondary" size={18} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Ativas</p>
          <p className="text-2xl font-bold text-secondary">{totalAtivas}</p>
        </div>
        <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <XCircle className="text-destructive" size={18} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Suspensas</p>
          <p className="text-2xl font-bold text-destructive">{empresas.length - totalAtivas}</p>
        </div>
        <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <FileText className="text-orange-500" size={18} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Faturas Emitidas</p>
          <p className="text-2xl font-bold text-foreground">{totalFaturas.toLocaleString("pt-AO")}</p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={17} />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou NIF..."
            className="w-full pl-11 pr-4 py-2.5 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Status filter */}
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            {(["todos", "Ativa", "Suspensa"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFiltroStatus(s)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${
                  filtroStatus === s ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s === "todos" ? "Todos" : s}
              </button>
            ))}
          </div>
          {/* Plano filter */}
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            {(["todos", "Básico", "Profissional", "Enterprise"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setFiltroPlano(p)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  filtroPlano === p ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p === "todos" ? "Todos planos" : p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Empresa</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">NIF</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Plano</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Utilização</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Usuários</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Desde</th>
                <th className="px-5 py-4 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {empresasFiltradas.map((empresa) => {
                const usoPct = empresa.limite < 9999 ? (empresa.faturas / empresa.limite) * 100 : 0;
                const usoAlto = usoPct >= 80;
                return (
                  <tr key={empresa.id} className={`transition-colors hover:bg-muted/30 ${empresa.status === "Suspensa" ? "opacity-60" : ""}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg flex-shrink-0 ${empresa.status === "Ativa" ? "bg-primary/10" : "bg-muted"}`}>
                          <Building2 className={empresa.status === "Ativa" ? "text-primary" : "text-muted-foreground"} size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{empresa.nome}</p>
                          <p className="text-xs text-muted-foreground sm:hidden">{empresa.nif}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className="font-mono text-sm text-muted-foreground">{empresa.nif}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${planoBadge[empresa.plano]}`}>
                        {empresa.plano}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <div className="min-w-[100px]">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">
                            {empresa.faturas}{empresa.limite < 9999 ? `/${empresa.limite}` : ""}
                          </span>
                          {usoAlto && (
                            <AlertTriangle size={12} className="text-orange-500" />
                          )}
                        </div>
                        {empresa.limite < 9999 && (
                          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                usoPct >= 90 ? "bg-destructive" : usoPct >= 80 ? "bg-orange-500" : "bg-secondary"
                              }`}
                              style={{ width: `${Math.min(usoPct, 100)}%` }}
                            />
                          </div>
                        )}
                        {empresa.limite >= 9999 && (
                          <span className="text-xs text-muted-foreground">Ilimitado</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users size={14} />
                        {empresa.usuarios}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        empresa.status === "Ativa"
                          ? "bg-secondary/10 text-secondary"
                          : "bg-destructive/10 text-destructive"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${empresa.status === "Ativa" ? "bg-secondary" : "bg-destructive"}`} />
                        {empresa.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {new Date(empresa.dataCriacao).toLocaleDateString("pt-AO")}
                      </span>
                    </td>
                    <td className="px-5 py-4 relative">
                      <button
                        onClick={() => setMenuAberto(menuAberto === empresa.id ? null : empresa.id)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {menuAberto === empresa.id && (
                        <div className="absolute right-4 top-12 w-52 bg-card border border-border rounded-xl shadow-xl py-1 z-20">
                          <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                            <TrendingUp size={14} className="text-muted-foreground" />
                            Ver dashboard
                          </button>
                          <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                            <Users size={14} className="text-muted-foreground" />
                            Gerir utilizadores
                          </button>
                          <div className="border-t border-border my-1" />
                          <button
                            onClick={() => {
                              if (empresa.status === "Ativa") {
                                setModalSuspender(empresa);
                              } else {
                                toggleStatus(empresa.id);
                              }
                              setMenuAberto(null);
                            }}
                            className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors ${
                              empresa.status === "Ativa" ? "text-destructive" : "text-secondary"
                            }`}
                          >
                            {empresa.status === "Ativa" ? (
                              <><XCircle size={14} /> Suspender empresa</>
                            ) : (
                              <><CheckCircle size={14} /> Reativar empresa</>
                            )}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {empresasFiltradas.length === 0 && (
          <div className="text-center py-16">
            <Building2 className="mx-auto mb-3 text-muted-foreground" size={36} />
            <p className="text-muted-foreground">Nenhuma empresa encontrada</p>
          </div>
        )}
      </div>

      {/* Suspend modal */}
      {modalSuspender && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full border border-border">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="text-destructive" size={20} />
                </div>
                <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                  Suspender Empresa
                </h2>
              </div>
              <button onClick={() => setModalSuspender(null)} className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Tem a certeza que quer suspender <strong className="text-foreground">{modalSuspender.nome}</strong>?
                Os utilizadores desta empresa perderão o acesso imediatamente.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setModalSuspender(null)}
                  className="flex-1 px-4 py-3 bg-muted text-foreground rounded-lg font-semibold hover:bg-muted/80 transition-all text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => toggleStatus(modalSuspender.id)}
                  className="flex-1 px-4 py-3 bg-destructive text-destructive-foreground rounded-lg font-semibold hover:bg-destructive/90 transition-all shadow-lg shadow-destructive/20 text-sm"
                >
                  Suspender
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Close menu overlay */}
      {menuAberto !== null && (
        <div className="fixed inset-0 z-10" onClick={() => setMenuAberto(null)} />
      )}
    </div>
  );
}
