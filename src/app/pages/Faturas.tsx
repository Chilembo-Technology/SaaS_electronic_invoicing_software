import { Link } from "react-router";
import { Plus, Search, Eye, Copy, XCircle, Filter, FileText, Download, CheckCircle, X as XIcon } from "lucide-react";
import { useState } from "react";

interface Fatura {
  id: number;
  numero: string;
  data: string;
  cliente: string;
  valor: number;
  status: "Emitida" | "Anulada";
}

const faturasIniciais: Fatura[] = [
  { id: 1, numero: "FT-2026/001", data: "2026-04-14", cliente: "Tech Solutions Lda", valor: 450000, status: "Emitida" },
  { id: 2, numero: "FT-2026/002", data: "2026-04-13", cliente: "António Silva", valor: 125000, status: "Emitida" },
  { id: 3, numero: "FT-2026/003", data: "2026-04-12", cliente: "Global Import & Export", valor: 780000, status: "Emitida" },
  { id: 4, numero: "FT-2026/004", data: "2026-04-10", cliente: "Maria Costa", valor: 95000, status: "Anulada" },
  { id: 5, numero: "FT-2026/005", data: "2026-04-08", cliente: "Tech Solutions Lda", valor: 320000, status: "Emitida" },
];

export function Faturas() {
  const [faturas, setFaturas] = useState<Fatura[]>(faturasIniciais);
  const [busca, setBusca] = useState("");
  const [modalAnular, setModalAnular] = useState<number | null>(null);
  const [motivoAnulacao, setMotivoAnulacao] = useState("");

  const faturasFiltradas = faturas.filter(f =>
    f.numero.toLowerCase().includes(busca.toLowerCase()) ||
    f.cliente.toLowerCase().includes(busca.toLowerCase())
  );

  const handleAnular = () => {
    if (!motivoAnulacao.trim() || modalAnular === null) return;

    setFaturas(faturas.map(f =>
      f.id === modalAnular ? { ...f, status: "Anulada" as const } : f
    ));
    setModalAnular(null);
    setMotivoAnulacao("");
  };

  const totalEmitidas = faturas.filter(f => f.status === "Emitida").length;
  const totalAnuladas = faturas.filter(f => f.status === "Anulada").length;
  const valorTotal = faturas.filter(f => f.status === "Emitida").reduce((acc, f) => acc + f.valor, 0);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Faturas
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas faturas emitidas
          </p>
        </div>
        <Link
          to="/faturas/emitir"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          Emitir Fatura
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <CheckCircle className="text-secondary" size={20} />
            </div>
            <p className="text-sm text-muted-foreground">Faturas Emitidas</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalEmitidas}</p>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <XCircle className="text-destructive" size={20} />
            </div>
            <p className="text-sm text-muted-foreground">Faturas Anuladas</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalAnuladas}</p>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="text-primary" size={20} />
            </div>
            <p className="text-sm text-muted-foreground">Valor Total</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{valorTotal.toLocaleString('pt-AO')} Kz</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por número ou cliente..."
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-card border border-border rounded-lg hover:bg-muted transition-all">
          <Filter size={20} />
          Filtros
        </button>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Número
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Valor Total
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {faturasFiltradas.map((fatura) => (
                <tr key={fatura.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono font-semibold text-foreground">{fatura.numero}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(fatura.data).toLocaleDateString('pt-AO')}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-foreground">{fatura.cliente}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-foreground">
                      {fatura.valor.toLocaleString('pt-AO')} Kz
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                      fatura.status === "Emitida"
                        ? "bg-secondary/10 text-secondary"
                        : "bg-destructive/10 text-destructive"
                    }`}>
                      {fatura.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        title="Visualizar PDF"
                      >
                        <Eye size={16} className="text-muted-foreground" />
                      </button>
                      <button
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        title="Duplicar"
                      >
                        <Copy size={16} className="text-muted-foreground" />
                      </button>
                      <button
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        title="Download PDF"
                      >
                        <Download size={16} className="text-muted-foreground" />
                      </button>
                      {fatura.status === "Emitida" && (
                        <button
                          onClick={() => setModalAnular(fatura.id)}
                          className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                          title="Anular"
                        >
                          <XCircle size={16} className="text-destructive" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {faturasFiltradas.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto mb-4 text-muted-foreground" size={48} />
            <p className="text-muted-foreground">Nenhuma fatura encontrada</p>
          </div>
        )}
      </div>

      {/* Modal Anular */}
      {modalAnular !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-xl shadow-2xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
                Anular Fatura
              </h2>
              <button
                onClick={() => {
                  setModalAnular(null);
                  setMotivoAnulacao("");
                }}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <XIcon size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <XCircle className="text-destructive mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-semibold text-destructive">Atenção</p>
                  <p className="text-xs text-destructive/80 mt-1">
                    A fatura não pode ser excluída definitivamente. Ela será marcada como anulada no sistema.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Motivo da Anulação *
                </label>
                <textarea
                  value={motivoAnulacao}
                  onChange={(e) => setMotivoAnulacao(e.target.value)}
                  placeholder="Descreva o motivo da anulação..."
                  rows={4}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setModalAnular(null);
                    setMotivoAnulacao("");
                  }}
                  className="flex-1 px-6 py-3 bg-muted text-foreground rounded-lg font-semibold hover:bg-muted/80 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAnular}
                  disabled={!motivoAnulacao.trim()}
                  className="flex-1 px-6 py-3 bg-destructive text-destructive-foreground rounded-lg font-semibold hover:bg-destructive/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-destructive/20"
                >
                  Confirmar Anulação
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
