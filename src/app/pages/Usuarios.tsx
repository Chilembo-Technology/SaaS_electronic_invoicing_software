import { Plus, Search, Edit2, ToggleLeft, ToggleRight, Shield, Eye, User } from "lucide-react";
import { useState } from "react";

interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: "Administrador" | "Operador" | "Visualizador";
  ativo: boolean;
}

const usuariosIniciais: Usuario[] = [
  { id: 1, nome: "Luis Chilembo", email: "luis@chilembo.tech", perfil: "Administrador", ativo: true },
  { id: 2, nome: "Leo Teca", email: "leo@chilembo.tech", perfil: "Administrador", ativo: true },
  { id: 3, nome: "Ana Santos", email: "ana@email.com", perfil: "Operador", ativo: true },
  { id: 4, nome: "João Costa", email: "joao@email.com", perfil: "Visualizador", ativo: false },
];

export function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>(usuariosIniciais);
  const [busca, setBusca] = useState("");

  const usuariosFiltrados = usuarios.filter(u =>
    u.nome.toLowerCase().includes(busca.toLowerCase()) ||
    u.email.toLowerCase().includes(busca.toLowerCase())
  );

  const toggleAtivo = (id: number) => {
    setUsuarios(usuarios.map(u =>
      u.id === id ? { ...u, ativo: !u.ativo } : u
    ));
  };

  const getPerfilIcon = (perfil: string) => {
    switch (perfil) {
      case "Administrador": return <Shield size={20} className="text-primary" />;
      case "Operador": return <Edit2 size={20} className="text-secondary" />;
      case "Visualizador": return <Eye size={20} className="text-muted-foreground" />;
      default: return <User size={20} />;
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Usuários
          </h1>
          <p className="text-muted-foreground">
            Gerencie os usuários da empresa
          </p>
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
          <Plus size={20} />
          Novo Usuário
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar usuários..."
          className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {usuariosFiltrados.map((usuario) => (
          <div
            key={usuario.id}
            className={`bg-card rounded-xl border-2 shadow-sm hover:shadow-md transition-all ${
              usuario.ativo ? 'border-border' : 'border-muted opacity-60'
            }`}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                    {usuario.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{usuario.nome}</h3>
                    <p className="text-sm text-muted-foreground">{usuario.email}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getPerfilIcon(usuario.perfil)}
                  <span className="text-sm font-semibold">{usuario.perfil}</span>
                </div>
                <button
                  onClick={() => toggleAtivo(usuario.id)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  {usuario.ativo ? (
                    <ToggleRight size={24} className="text-secondary" />
                  ) : (
                    <ToggleLeft size={24} className="text-muted-foreground" />
                  )}
                </button>
              </div>

              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                usuario.ativo
                  ? "bg-secondary/10 text-secondary"
                  : "bg-muted text-muted-foreground"
              }`}>
                {usuario.ativo ? "Ativo" : "Inativo"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
