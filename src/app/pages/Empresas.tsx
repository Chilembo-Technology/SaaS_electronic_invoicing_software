import { Plus, Search, Building2, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";

interface Empresa {
  id: number;
  nome: string;
  nif: string;
  plano: string;
  faturas: number;
  status: "Ativa" | "Suspensa";
  dataCriacao: string;
}

const empresasIniciais: Empresa[] = [
  { id: 1, nome: "Tech Solutions Lda", nif: "5000123456", plano: "Profissional", faturas: 284, status: "Ativa", dataCriacao: "2026-01-15" },
  { id: 2, nome: "Global Import & Export", nif: "5000987654", plano: "Enterprise", faturas: 856, status: "Ativa", dataCriacao: "2025-11-20" },
  { id: 3, nome: "Consultoria Premium", nif: "5000456789", plano: "Básico", faturas: 45, status: "Suspensa", dataCriacao: "2026-03-10" },
  { id: 4, nome: "Serviços Digitais SA", nif: "5000111222", plano: "Profissional", faturas: 198, status: "Ativa", dataCriacao: "2026-02-05" },
];

export function Empresas() {
  const [empresas] = useState<Empresa[]>(empresasIniciais);
  const [busca, setBusca] = useState("");

  const empresasFiltradas = empresas.filter(e =>
    e.nome.toLowerCase().includes(busca.toLowerCase()) ||
    e.nif.includes(busca)
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Empresas
          </h1>
          <p className="text-muted-foreground">
            Gerencie as empresas cadastradas no SaaS
          </p>
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
          <Plus size={20} />
          Nova Empresa
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <p className="text-sm text-muted-foreground mb-1">Total de Empresas</p>
          <p className="text-3xl font-bold text-foreground">{empresas.length}</p>
        </div>
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <p className="text-sm text-muted-foreground mb-1">Empresas Ativas</p>
          <p className="text-3xl font-bold text-secondary">{empresas.filter(e => e.status === "Ativa").length}</p>
        </div>
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <p className="text-sm text-muted-foreground mb-1">Suspensas</p>
          <p className="text-3xl font-bold text-destructive">{empresas.filter(e => e.status === "Suspensa").length}</p>
        </div>
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <p className="text-sm text-muted-foreground mb-1">Faturas Emitidas</p>
          <p className="text-3xl font-bold text-primary">{empresas.reduce((acc, e) => acc + e.faturas, 0)}</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou NIF..."
          className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  NIF
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Plano
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Faturas
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Data Criação
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {empresasFiltradas.map((empresa) => (
                <tr key={empresa.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Building2 className="text-primary" size={20} />
                      </div>
                      <span className="font-semibold text-foreground">{empresa.nome}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm">{empresa.nif}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium">{empresa.plano}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold">{empresa.faturas}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                      empresa.status === "Ativa"
                        ? "bg-secondary/10 text-secondary"
                        : "bg-destructive/10 text-destructive"
                    }`}>
                      {empresa.status === "Ativa" ? (
                        <CheckCircle size={14} />
                      ) : (
                        <XCircle size={14} />
                      )}
                      {empresa.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(empresa.dataCriacao).toLocaleDateString('pt-AO')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
