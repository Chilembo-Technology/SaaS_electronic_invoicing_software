import { Plus, Search, Building2, CheckCircle, XCircle, MoreVertical, TrendingUp, Users, FileText, AlertTriangle, X, Trash2, Mail, Phone, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { organizationService } from "../../services/organizationService";
import { Company } from "../../types/api";

interface Empresa {
  id: number | string;
  nome: string;
  nif: string;
  email?: string;
  phone?: string;
  address?: string;
  plano: "Básico" | "Profissional" | "Enterprise";
  faturas: number;
  limite: number;
  usuarios: number;
  status: "Ativa" | "Suspensa";
  dataCriacao: string;
}

const empresasIniciais: Empresa[] = [
  { id: 1, nome: "Tech Solutions Lda", nif: "5000123456", email: "contato@techsolutions.co.ao", plano: "Profissional", faturas: 184, limite: 200, usuarios: 4, status: "Ativa", dataCriacao: "2026-01-15" },
  { id: 2, nome: "Global Import & Export", nif: "5000987654", email: "info@globalimport.ao", plano: "Enterprise", faturas: 856, limite: 9999, usuarios: 12, status: "Ativa", dataCriacao: "2025-11-20" },
  { id: 3, nome: "Consultoria Premium", nif: "5000456789", email: "admin@consultoriapremium.ao", plano: "Básico", faturas: 45, limite: 50, usuarios: 1, status: "Suspensa", dataCriacao: "2026-03-10" },
  { id: 4, nome: "Serviços Digitais SA", nif: "5000111222", email: "suporte@servicosdigitais.ao", plano: "Profissional", faturas: 198, limite: 200, usuarios: 3, status: "Ativa", dataCriacao: "2026-02-05" },
  { id: 5, nome: "MercadoLuanda", nif: "5000333444", email: "vendas@mercadoluanda.co.ao", plano: "Básico", faturas: 12, limite: 50, usuarios: 1, status: "Ativa", dataCriacao: "2026-06-01" },
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
  const [menuAberto, setMenuAberto] = useState<number | string | null>(null);
  const [modalSuspender, setModalSuspender] = useState<Empresa | null>(null);
  const [modalNovaEmpresa, setModalNovaEmpresa] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // Form para nova empresa
  const [novaEmpresa, setNovaEmpresa] = useState({
    name: "",
    nif: "",
    email: "",
    phone: "",
    address: "",
    plano: "Profissional" as "Básico" | "Profissional" | "Enterprise",
  });

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const apiCompanies: Company[] = await organizationService.listCompanies();
        if (apiCompanies && apiCompanies.length > 0) {
          const mapped: Empresa[] = apiCompanies.map((c) => ({
            id: c.id,
            nome: c.name,
            nif: (c.nif || c.taxId || "5000000000").toString(),
            email: c.email?.toString(),
            phone: c.phone?.toString(),
            address: c.address?.toString(),
            plano: (c.plano as "Básico" | "Profissional" | "Enterprise") || "Profissional",
            faturas: typeof c.faturas === "number" ? c.faturas : 0,
            limite: typeof c.limite === "number" ? c.limite : 200,
            usuarios: typeof c.usuarios === "number" ? c.usuarios : 1,
            status: c.status === "Suspensa" || c.ativo === false ? "Suspensa" : "Ativa",
            dataCriacao: (c.createdAt || c.dataCriacao || new Date().toISOString()).toString(),
          }));
          setEmpresas(mapped);
        }
      } catch (err) {
        console.warn("Utilizando estado local das empresas.", err);
      }
    }
    fetchCompanies();
  }, []);

  const empresasFiltradas = empresas.filter((e) => {
    const matchBusca =
      e.nome.toLowerCase().includes(busca.toLowerCase()) ||
      e.nif.includes(busca);
    const matchStatus = filtroStatus === "todos" || e.status === filtroStatus;
    const matchPlano = filtroPlano === "todos" || e.plano === filtroPlano;
    return matchBusca && matchStatus && matchPlano;
  });

  const toggleStatus = async (id: number | string) => {
    const empresaAtual = empresas.find((e) => e.id === id);
    if (!empresaAtual) return;

    const novoStatus = empresaAtual.status === "Ativa" ? "Suspensa" : "Ativa";

    try {
      if (novoStatus === "Ativa") {
        await organizationService.activateCompany(id);
      } else {
        await organizationService.disableCompany(id);
      }
    } catch (err) {
      console.warn("Atualizado estado localmente.", err);
    }

    setEmpresas(empresas.map((e) => (e.id === id ? { ...e, status: novoStatus } : e)));
    setModalSuspender(null);
    setMenuAberto(null);
  };

  const handleMoverLixeira = async (id: number | string) => {
    try {
      await organizationService.moveToTrash(id);
    } catch (err) {
      console.warn("Removido localmente.", err);
    }
    setEmpresas(empresas.filter((e) => e.id !== id));
    setMenuAberto(null);
  };

  const handleCriarEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaEmpresa.name || !novaEmpresa.nif) return;

    setSalvando(true);
    try {
      const criada = await organizationService.createCompany({
        name: novaEmpresa.name,
        nif: novaEmpresa.nif,
        email: novaEmpresa.email,
        phone: novaEmpresa.phone,
        address: novaEmpresa.address,
        plano: novaEmpresa.plano,
      });

      const emp: Empresa = {
        id: criada.id || Date.now(),
        nome: criada.name || novaEmpresa.name,
        nif: (criada.nif || novaEmpresa.nif).toString(),
        email: novaEmpresa.email,
        phone: novaEmpresa.phone,
        address: novaEmpresa.address,
        plano: novaEmpresa.plano,
        faturas: 0,
        limite: novaEmpresa.plano === "Enterprise" ? 9999 : novaEmpresa.plano === "Profissional" ? 200 : 50,
        usuarios: 1,
        status: "Ativa",
        dataCriacao: new Date().toISOString(),
      };

      setEmpresas([emp, ...empresas]);
    } catch (err) {
      console.warn("Erro ao criar empresa na API. Adicionada localmente.", err);
      const emp: Empresa = {
        id: Date.now(),
        nome: novaEmpresa.name,
        nif: novaEmpresa.nif,
        email: novaEmpresa.email,
        phone: novaEmpresa.phone,
        address: novaEmpresa.address,
        plano: novaEmpresa.plano,
        faturas: 0,
        limite: novaEmpresa.plano === "Enterprise" ? 9999 : novaEmpresa.plano === "Profissional" ? 200 : 50,
        usuarios: 1,
        status: "Ativa",
        dataCriacao: new Date().toISOString(),
      };
      setEmpresas([emp, ...empresas]);
    } finally {
      setSalvando(false);
      setModalNovaEmpresa(false);
      setNovaEmpresa({ name: "", nif: "", email: "", phone: "", address: "", plano: "Profissional" });
    }
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
          <p className="text-muted-foreground">Gerencie os tenants do SaaS integrados ao Organization Service</p>
        </div>
        <button
          onClick={() => setModalNovaEmpresa(true)}
          className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 text-sm"
        >
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
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${planoBadge[empresa.plano] || planoBadge.Profissional}`}>
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
                          <button
                            onClick={() => handleMoverLixeira(empresa.id)}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 size={14} />
                            Mover para Lixeira
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

      {/* Modal Nova Empresa */}
      {modalNovaEmpresa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-2xl shadow-2xl max-w-lg w-full border border-border">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="text-primary" size={20} />
                </div>
                <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                  Nova Empresa
                </h2>
              </div>
              <button onClick={() => setModalNovaEmpresa(false)} className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCriarEmpresa} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wide mb-1">Nome da Empresa</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input
                    type="text"
                    required
                    value={novaEmpresa.name}
                    onChange={(e) => setNovaEmpresa({ ...novaEmpresa, name: e.target.value })}
                    placeholder="Ex: Chilembo Tech Lda"
                    className="w-full pl-10 pr-4 py-2.5 bg-input-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wide mb-1">NIF</label>
                  <input
                    type="text"
                    required
                    value={novaEmpresa.nif}
                    onChange={(e) => setNovaEmpresa({ ...novaEmpresa, nif: e.target.value })}
                    placeholder="5000123456"
                    className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wide mb-1">Plano</label>
                  <select
                    value={novaEmpresa.plano}
                    onChange={(e) => setNovaEmpresa({ ...novaEmpresa, plano: e.target.value as "Básico" | "Profissional" | "Enterprise" })}
                    className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="Básico">Básico (50 faturas)</option>
                    <option value="Profissional">Profissional (200 faturas)</option>
                    <option value="Enterprise">Enterprise (Ilimitado)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wide mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input
                      type="email"
                      value={novaEmpresa.email}
                      onChange={(e) => setNovaEmpresa({ ...novaEmpresa, email: e.target.value })}
                      placeholder="empresa@exemplo.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-input-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wide mb-1">Telefone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input
                      type="text"
                      value={novaEmpresa.phone}
                      onChange={(e) => setNovaEmpresa({ ...novaEmpresa, phone: e.target.value })}
                      placeholder="+244 923 000 000"
                      className="w-full pl-10 pr-4 py-2.5 bg-input-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wide mb-1">Endereço</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input
                    type="text"
                    value={novaEmpresa.address}
                    onChange={(e) => setNovaEmpresa({ ...novaEmpresa, address: e.target.value })}
                    placeholder="Luanda, Angola"
                    className="w-full pl-10 pr-4 py-2.5 bg-input-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setModalNovaEmpresa(false)}
                  className="flex-1 px-4 py-3 bg-muted text-foreground rounded-lg font-semibold hover:bg-muted/80 transition-all text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 text-sm disabled:opacity-50"
                >
                  {salvando ? "A Guardar..." : "Cadastrar Empresa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
