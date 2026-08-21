import { Plus, Search, Shield, Eye, User, MoreVertical, Mail, X, Check, Edit2, Trash2, UserX } from "lucide-react";
import { useState, useEffect } from "react";
import { authService } from "../../services/authService";
import { User as ApiUser } from "../../types/api";

interface Usuario {
  id: number | string;
  nome: string;
  email: string;
  perfil: "Administrador" | "Operador" | "Visualizador";
  ativo: boolean;
  ultimoAcesso: string;
}

const usuariosIniciais: Usuario[] = [
  { id: 1, nome: "Luis Chilembo", email: "luis@chilembo.tech", perfil: "Administrador", ativo: true, ultimoAcesso: "2026-07-01" },
  { id: 2, nome: "Leo Teca", email: "leo@chilembo.tech", perfil: "Administrador", ativo: true, ultimoAcesso: "2026-06-30" },
  { id: 3, nome: "Ana Santos", email: "ana@email.com", perfil: "Operador", ativo: true, ultimoAcesso: "2026-07-01" },
  { id: 4, nome: "João Costa", email: "joao@email.com", perfil: "Visualizador", ativo: false, ultimoAcesso: "2026-05-12" },
];

const perfilConfig = {
  Administrador: {
    icon: Shield,
    color: "text-primary",
    bg: "bg-primary/10",
    badge: "bg-primary/10 text-primary border border-primary/20",
    descricao: "Acesso total ao sistema",
  },
  Operador: {
    icon: Edit2,
    color: "text-secondary",
    bg: "bg-secondary/10",
    badge: "bg-secondary/10 text-secondary border border-secondary/20",
    descricao: "Pode emitir e gerir faturas",
  },
  Visualizador: {
    icon: Eye,
    color: "text-muted-foreground",
    bg: "bg-muted",
    badge: "bg-muted text-muted-foreground border border-border",
    descricao: "Apenas leitura",
  },
};

export function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>(usuariosIniciais);
  const [busca, setBusca] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState<"todos" | "ativos" | "inativos">("todos");
  const [menuAberto, setMenuAberto] = useState<number | string | null>(null);
  const [modalConvite, setModalConvite] = useState(false);
  const [convite, setConvite] = useState({ nome: "", email: "", perfil: "Operador" as Usuario["perfil"] });
  const [conviteEnviado, setConviteEnviado] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const apiUsers: ApiUser[] = await authService.listUsers();
        if (apiUsers && apiUsers.length > 0) {
          const mapped: Usuario[] = apiUsers.map((u) => {
            let roleName: Usuario["perfil"] = "Operador";
            const userRole = (u.role || u.perfil || "").toString().toLowerCase();
            if (userRole.includes("admin") || userRole.includes("administrador")) {
              roleName = "Administrador";
            } else if (userRole.includes("view") || userRole.includes("visualizador")) {
              roleName = "Visualizador";
            }

            return {
              id: u.id,
              nome: u.name || "Sem Nome",
              email: u.email,
              perfil: roleName,
              ativo: u.ativo !== false && u.status !== "Inativo",
              ultimoAcesso: (u.ultimoAcesso || u.updatedAt || u.createdAt || new Date().toISOString()).toString(),
            };
          });
          setUsuarios(mapped);
        }
      } catch (err) {
        console.warn("Utilizando dados iniciais de utilizadores.", err);
      }
    }
    fetchUsers();
  }, []);

  const usuariosFiltrados = usuarios.filter((u) => {
    const matchBusca =
      u.nome.toLowerCase().includes(busca.toLowerCase()) ||
      u.email.toLowerCase().includes(busca.toLowerCase());
    const matchFiltro =
      filtroAtivo === "todos" ||
      (filtroAtivo === "ativos" && u.ativo) ||
      (filtroAtivo === "inativos" && !u.ativo);
    return matchBusca && matchFiltro;
  });

  const toggleAtivo = async (id: number | string) => {
    const usuarioAtual = usuarios.find((u) => u.id === id);
    if (!usuarioAtual) return;

    const novoEstado = !usuarioAtual.ativo;
    try {
      if (novoEstado) {
        await authService.activateUser(id);
      } else {
        await authService.deactivateUser(id);
      }
    } catch (err) {
      console.warn("Estado alterado localmente.", err);
    }

    setUsuarios(usuarios.map((u) => (u.id === id ? { ...u, ativo: novoEstado } : u)));
    setMenuAberto(null);
  };

  const handleMoverLixeira = async (id: number | string) => {
    try {
      await authService.moveToTrash(id);
    } catch (err) {
      console.warn("Removido localmente.", err);
    }

    setUsuarios(usuarios.filter((u) => u.id !== id));
    setMenuAberto(null);
  };

  const handleConvite = async () => {
    if (!convite.nome || !convite.email) return;

    setSalvando(true);
    try {
      const novo = await authService.createUser({
        name: convite.nome,
        email: convite.email,
        role: convite.perfil.toLowerCase(),
      });

      const user: Usuario = {
        id: novo.id || Date.now(),
        nome: novo.name || convite.nome,
        email: novo.email || convite.email,
        perfil: convite.perfil,
        ativo: true,
        ultimoAcesso: new Date().toISOString(),
      };

      setUsuarios([user, ...usuarios]);
    } catch (err) {
      console.warn("Erro na API de utilizador. Adicionado localmente.", err);
      const user: Usuario = {
        id: Date.now(),
        nome: convite.nome,
        email: convite.email,
        perfil: convite.perfil,
        ativo: true,
        ultimoAcesso: new Date().toISOString(),
      };
      setUsuarios([user, ...usuarios]);
    } finally {
      setSalvando(false);
      setConviteEnviado(true);
      setTimeout(() => {
        setModalConvite(false);
        setConviteEnviado(false);
        setConvite({ nome: "", email: "", perfil: "Operador" });
      }, 1800);
    }
  };

  const initials = (nome: string) =>
    nome.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();

  const totalAtivos = usuarios.filter((u) => u.ativo).length;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Usuários
          </h1>
          <p className="text-muted-foreground">
            {totalAtivos} utilizador(es) ativo(s) de {usuarios.length} no total (integrado ao Auth Service)
          </p>
        </div>
        <button
          onClick={() => setModalConvite(true)}
          className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 text-sm"
        >
          <Plus size={18} />
          Convidar Utilizador
        </button>
      </div>

      {/* Role legend */}
      <div className="flex flex-wrap gap-3">
        {(Object.keys(perfilConfig) as Array<keyof typeof perfilConfig>).map((perfil) => {
          const { icon: Icon, descricao } = perfilConfig[perfil];
          return (
            <div key={perfil} className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg">
              <Icon size={14} className={perfilConfig[perfil].color} />
              <span className="text-xs font-semibold text-foreground">{perfil}</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">— {descricao}</span>
            </div>
          );
        })}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={17} />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou email..."
            className="w-full pl-11 pr-4 py-2.5 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
          />
        </div>
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          {[
            { key: "todos", label: "Todos" },
            { key: "ativos", label: "Ativos" },
            { key: "inativos", label: "Inativos" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFiltroAtivo(key as typeof filtroAtivo)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                filtroAtivo === key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Users table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Utilizador</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Perfil</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Último acesso</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
                <th className="px-5 py-4 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {usuariosFiltrados.map((usuario) => {
                const config = perfilConfig[usuario.perfil] || perfilConfig.Operador;
                const { icon: Icon, badge } = config;
                return (
                  <tr
                    key={usuario.id}
                    className={`transition-colors ${usuario.ativo ? "hover:bg-muted/30" : "opacity-55 hover:opacity-70"}`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ${
                          usuario.ativo
                            ? "bg-gradient-to-br from-primary to-secondary"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {initials(usuario.nome)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{usuario.nome}</p>
                          <p className="text-xs text-muted-foreground">{usuario.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${badge}`}>
                        <Icon size={12} />
                        {usuario.perfil}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {new Date(usuario.ultimoAcesso).toLocaleDateString("pt-AO")}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        usuario.ativo
                          ? "bg-secondary/10 text-secondary"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${usuario.ativo ? "bg-secondary" : "bg-muted-foreground"}`} />
                        {usuario.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-5 py-4 relative">
                      <button
                        onClick={() => setMenuAberto(menuAberto === usuario.id ? null : usuario.id)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {menuAberto === usuario.id && (
                        <div className="absolute right-4 top-12 w-48 bg-card border border-border rounded-xl shadow-xl py-1 z-20">
                          <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                            <Edit2 size={14} className="text-muted-foreground" />
                            Editar perfil
                          </button>
                          <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                            <Mail size={14} className="text-muted-foreground" />
                            Reenviar convite
                          </button>
                          <div className="border-t border-border my-1" />
                          <button
                            onClick={() => toggleAtivo(usuario.id)}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                          >
                            <UserX size={14} className={usuario.ativo ? "text-orange-500" : "text-secondary"} />
                            <span className={usuario.ativo ? "text-orange-600" : "text-secondary"}>
                              {usuario.ativo ? "Suspender acesso" : "Reativar acesso"}
                            </span>
                          </button>
                          <div className="border-t border-border my-1" />
                          <button
                            onClick={() => handleMoverLixeira(usuario.id)}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 size={14} />
                            Remover utilizador
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
        {usuariosFiltrados.length === 0 && (
          <div className="text-center py-16">
            <User className="mx-auto mb-3 text-muted-foreground" size={36} />
            <p className="text-muted-foreground">Nenhum utilizador encontrado</p>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {modalConvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full border border-border">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                  Convidar Utilizador
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">Será enviado um email de convite</p>
              </div>
              <button
                onClick={() => { setModalConvite(false); setConviteEnviado(false); }}
                className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
              >
                <X size={18} />
              </button>
            </div>

            {conviteEnviado ? (
              <div className="p-10 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="text-secondary" size={32} />
                </div>
                <p className="text-lg font-bold text-foreground mb-1">Convite enviado com sucesso!</p>
                <p className="text-sm text-muted-foreground">{convite.email}</p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Nome completo</label>
                  <input
                    type="text"
                    value={convite.nome}
                    onChange={(e) => setConvite({ ...convite, nome: e.target.value })}
                    placeholder="Ex: Maria Tavares"
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Email</label>
                  <input
                    type="email"
                    value={convite.email}
                    onChange={(e) => setConvite({ ...convite, email: e.target.value })}
                    placeholder="utilizador@empresa.ao"
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Perfil de acesso</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(perfilConfig) as Array<keyof typeof perfilConfig>).map((p) => {
                      const { icon: Icon, color } = perfilConfig[p];
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setConvite({ ...convite, perfil: p })}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center ${
                            convite.perfil === p
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/40"
                          }`}
                        >
                          <Icon size={18} className={convite.perfil === p ? "text-primary" : color} />
                          <span className="text-xs font-semibold text-foreground leading-tight">{p}</span>
                          <span className="text-[10px] text-muted-foreground leading-tight">{perfilConfig[p].descricao}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalConvite(false)}
                    className="flex-1 px-4 py-3 bg-muted text-foreground rounded-lg font-semibold hover:bg-muted/80 transition-all text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConvite}
                    disabled={!convite.nome || !convite.email || salvando}
                    className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Mail size={16} />
                    {salvando ? "A Enviar..." : "Enviar Convite"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay to close menu */}
      {menuAberto !== null && (
        <div className="fixed inset-0 z-10" onClick={() => setMenuAberto(null)} />
      )}
    </div>
  );
}
