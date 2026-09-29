import { Link } from "react-router";
import { Plus, Search, Eye, Copy, XCircle, Filter, FileText, Download, CheckCircle, X as XIcon } from "lucide-react";
import { useState } from "react";

interface Fatura {
  id: number;
  numero: string;
  serie: "FT" | "FR" | "NC" | "ND";
  data: string;
  cliente: string;
  valor: number;
  iva: number;
  status: "Emitida" | "Anulada";
}

const faturasIniciais: Fatura[] = [
  { id: 1, numero: "FT-2026/042", serie: "FT", data: "2026-06-20", cliente: "Construções Palmeira", valor: 285000, iva: 61275, status: "Emitida" },
  { id: 2, numero: "FT-2026/041", serie: "FT", data: "2026-06-18", cliente: "MercadoLuanda S.A.", valor: 148500, iva: 31927, status: "Emitida" },
  { id: 3, numero: "FT-2026/040", serie: "FT", data: "2026-06-17", cliente: "João Baptista", valor: 72000, iva: 15480, status: "Emitida" },
  { id: 4, numero: "FT-2026/039", serie: "FT", data: "2026-06-15", cliente: "Global Import Lda", valor: 415000, iva: 89225, status: "Emitida" },
  { id: 5, numero: "NC-2026/003", serie: "NC", data: "2026-06-12", cliente: "Ana Maria Pereira", valor: 38000, iva: 8170, status: "Anulada" },
  { id: 6, numero: "FT-2026/038", serie: "FT", data: "2026-06-10", cliente: "Tech Solutions Lda", valor: 320000, iva: 68800, status: "Emitida" },
  { id: 7, numero: "FR-2026/012", serie: "FR", data: "2026-06-08", cliente: "António da Silva", valor: 55000, iva: 11825, status: "Emitida" },
];

const serieBadge: Record<string, string> = {
  FT: "bg-primary/10 text-primary",
  FR: "bg-purple-500/10 text-purple-600",
  NC: "bg-orange-500/10 text-orange-600",
  ND: "bg-blue-500/10 text-blue-600",
};

import { useDocumentTitle } from "../../../hooks/useDocumentTitle";

export function ClienteFaturas() {
  useDocumentTitle("Faturas do cliente");

  const [faturas, setFaturas] = useState<Fatura[]>(faturasIniciais);
  const [busca, setBusca] = useState("");
  const [filtroSerie, setFiltroSerie] = useState<string>("Todas");
  const [modalAnular, setModalAnular] = useState<number | null>(null);
  const [motivoAnulacao, setMotivoAnulacao] = useState("");

  const faturasFiltradas = faturas.filter((f) => {
    const matchBusca =
      f.numero.toLowerCase().includes(busca.toLowerCase()) ||
      f.cliente.toLowerCase().includes(busca.toLowerCase());
    const matchSerie = filtroSerie === "Todas" || f.serie === filtroSerie;
    return matchBusca && matchSerie;
  });

  const handleAnular = () => {
    if (!motivoAnulacao.trim() || modalAnular === null) return;
    setFaturas(faturas.map((f) => (f.id === modalAnular ? { ...f, status: "Anulada" as const } : f)));
    setModalAnular(null);
    setMotivoAnulacao("");
  };

  const totalEmitidas = faturas.filter((f) => f.status === "Emitida").length;
  const totalAnuladas = faturas.filter((f) => f.status === "Anulada").length;
  const valorTotal = faturas.filter((f) => f.status === "Emitida").reduce((acc, f) => acc + f.valor, 0);
  const ivaTotal = faturas.filter((f) => f.status === "Emitida").reduce((acc, f) => acc + f.iva, 0);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Faturas
          </h1>
          <p className="text-muted-foreground">Gerencie todas as suas faturas eletrónicas</p>
        </div>
        <Link
          to="/cliente/faturas/emitir"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          Emitir Fatura
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <CheckCircle className="text-secondary" size={18} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Emitidas</p>
          <p className="text-2xl font-bold text-foreground">{totalEmitidas}</p>
        </div>
        <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <XCircle className="text-destructive" size={18} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Anuladas</p>
          <p className="text-2xl font-bold text-foreground">{totalAnuladas}</p>
        </div>
        <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="text-primary" size={18} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Valor Total</p>
          <p className="text-xl font-bold text-foreground">{(valorTotal / 1000).toFixed(0)}k Kz</p>
        </div>
        <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Download className="text-orange-500" size={18} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">IVA Total</p>
          <p className="text-xl font-bold text-foreground">{(ivaTotal / 1000).toFixed(0)}k Kz</p>
        </div>
      </div>

      {/* Search + Series filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por número ou cliente..."
            className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
          />
        </div>
        <div className="flex gap-2">
          {["Todas", "FT", "FR", "NC", "ND"].map((s) => (
            <button
              key={s}
              onClick={() => setFiltroSerie(s)}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-all border ${
                filtroSerie === s
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-3 bg-card border border-border rounded-lg hover:bg-muted transition-all text-sm">
          <Filter size={16} />
          Filtros
        </button>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                {["Número", "Série", "Data", "Cliente", "Valor", "IVA", "Status", "Ações"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {faturasFiltradas.map((fatura) => (
                <tr key={fatura.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-4">
                    <span className="font-mono text-sm font-semibold text-foreground">{fatura.numero}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${serieBadge[fatura.serie]}`}>
                      {fatura.serie}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">
                    {new Date(fatura.data).toLocaleDateString("pt-AO")}
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-foreground">{fatura.cliente}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-foreground">
                    {fatura.valor.toLocaleString("pt-AO")} Kz
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">
                    {fatura.iva.toLocaleString("pt-AO")} Kz
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        fatura.status === "Emitida"
                          ? "bg-secondary/10 text-secondary"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {fatura.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 hover:bg-muted rounded-lg transition-colors" title="Visualizar PDF">
                        <Eye size={15} className="text-muted-foreground" />
                      </button>
                      <button className="p-1.5 hover:bg-muted rounded-lg transition-colors" title="Duplicar">
                        <Copy size={15} className="text-muted-foreground" />
                      </button>
                      <button className="p-1.5 hover:bg-muted rounded-lg transition-colors" title="Download PDF">
                        <Download size={15} className="text-muted-foreground" />
                      </button>
                      {fatura.status === "Emitida" && (
                        <button
                          onClick={() => setModalAnular(fatura.id)}
                          className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors"
                          title="Anular"
                        >
                          <XCircle size={15} className="text-destructive" />
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
          <div className="text-center py-16">
            <FileText className="mx-auto mb-3 text-muted-foreground" size={40} />
            <p className="text-muted-foreground">Nenhuma fatura encontrada</p>
          </div>
        )}
      </div>

      {/* Modal Anular */}
      {modalAnular !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-xl shadow-2xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                Anular Fatura
              </h2>
              <button
                onClick={() => { setModalAnular(null); setMotivoAnulacao(""); }}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <XIcon size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <XCircle className="text-destructive mt-0.5 flex-shrink-0" size={18} />
                <p className="text-sm text-destructive/90">
                  A fatura será marcada como anulada. Esta ação não pode ser revertida.
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Motivo da Anulação <span className="text-destructive">*</span>
                </label>
                <textarea
                  value={motivoAnulacao}
                  onChange={(e) => setMotivoAnulacao(e.target.value)}
                  placeholder="Descreva o motivo da anulação..."
                  rows={4}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none text-sm"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setModalAnular(null); setMotivoAnulacao(""); }}
                  className="flex-1 px-6 py-3 bg-muted text-foreground rounded-lg font-semibold hover:bg-muted/80 transition-all text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAnular}
                  disabled={!motivoAnulacao.trim()}
                  className="flex-1 px-6 py-3 bg-destructive text-destructive-foreground rounded-lg font-semibold hover:bg-destructive/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-destructive/20 text-sm"
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
