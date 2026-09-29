import { Link } from "react-router";
import {
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  ArrowUpRight,
  CheckCircle,
  AlertCircle,
  Plus,
  Download,
  Eye,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const faturamentoMensal = [
  { mes: "Jan", faturado: 310000, recebido: 310000 },
  { mes: "Fev", faturado: 420000, recebido: 380000 },
  { mes: "Mar", faturado: 390000, recebido: 390000 },
  { mes: "Abr", faturado: 560000, recebido: 480000 },
  { mes: "Mai", faturado: 620000, recebido: 540000 },
  { mes: "Jun", faturado: 820000, recebido: 650000 },
];

const ultimasFaturas = [
  { numero: "FT-2026/042", cliente: "Construções Palmeira", valor: 285000, data: "2026-06-20", status: "Emitida" },
  { numero: "FT-2026/041", cliente: "MercadoLuanda S.A.", valor: 148500, data: "2026-06-18", status: "Emitida" },
  { numero: "FT-2026/040", cliente: "João Baptista", valor: 72000, data: "2026-06-17", status: "Emitida" },
  { numero: "FT-2026/039", cliente: "Global Import Lda", valor: 415000, data: "2026-06-15", status: "Emitida" },
  { numero: "FT-2026/038", cliente: "Ana Maria Pereira", valor: 38000, data: "2026-06-12", status: "Emitida" },
];

import { useDocumentTitle } from "../../../hooks/useDocumentTitle";

export function ClientDashboard() {
  useDocumentTitle("Painel do cliente");

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground font-medium mb-1">Bem-vindo de volta</p>
          <h1
            className="text-3xl lg:text-4xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            TechLuanda Lda.
          </h1>
          <p className="text-muted-foreground mt-1">Junho 2026 · NIF 5417083421</p>
        </div>
        <Link
          to="/cliente/faturas/emitir"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 self-start sm:self-auto"
        >
          <Plus size={20} />
          Nova Fatura
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <DollarSign className="text-primary" size={22} />
            </div>
            <span className="flex items-center gap-1 text-secondary text-sm font-semibold">
              <ArrowUpRight size={14} />
              +18%
            </span>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Faturado este mês</p>
          <p className="text-2xl font-bold text-foreground">820.000 Kz</p>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-secondary/10 rounded-lg">
              <CheckCircle className="text-secondary" size={22} />
            </div>
            <span className="flex items-center gap-1 text-secondary text-sm font-semibold">
              <ArrowUpRight size={14} />
              +6%
            </span>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Faturas Emitidas</p>
          <p className="text-2xl font-bold text-foreground">42</p>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <Clock className="text-orange-500" size={22} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">IVA a Entregar</p>
          <p className="text-2xl font-bold text-foreground">176.300 Kz</p>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <TrendingUp className="text-purple-600" size={22} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Ticket Médio</p>
          <p className="text-2xl font-bold text-foreground">19.524 Kz</p>
        </div>
      </div>

      {/* Alert: IVA */}
      <div className="flex items-start gap-4 p-5 bg-orange-50 border border-orange-200 rounded-xl dark:bg-orange-500/10 dark:border-orange-500/20">
        <AlertCircle className="text-orange-500 mt-0.5 flex-shrink-0" size={20} />
        <div className="flex-1">
          <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">Entrega de IVA — Vence em 5 dias</p>
          <p className="text-xs text-orange-600/80 dark:text-orange-400/70 mt-0.5">
            O IVA referente a Junho/2026 no valor de <strong>176.300 Kz</strong> deve ser entregue até 30/06/2026.
          </p>
        </div>
        <button className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline flex-shrink-0">
          Ver relatório
        </button>
      </div>

      {/* Chart + Recent Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-3 bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="mb-6">
            <h3
              className="text-lg font-bold text-foreground mb-1"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Faturamento vs Recebimento
            </h3>
            <p className="text-sm text-muted-foreground">Últimos 6 meses · em Kz</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={faturamentoMensal} barGap={4}>
              <CartesianGrid key="cd-grid" strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis key="cd-x" dataKey="mes" stroke="#64748B" style={{ fontSize: "12px" }} />
              <YAxis key="cd-y" stroke="#64748B" style={{ fontSize: "11px" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip key="cd-tooltip"
                formatter={(value: number) => [`${value.toLocaleString("pt-AO")} Kz`]}
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #E2E8F0", borderRadius: "8px" }}
              />
              <Legend key="cd-legend" />
              <Bar key="faturado" dataKey="faturado" fill="#2563EB" name="Faturado" radius={[6, 6, 0, 0]} />
              <Bar key="recebido" dataKey="recebido" fill="#10B981" name="Recebido" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* IVA Breakdown */}
        <div className="lg:col-span-2 bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col">
          <h3
            className="text-lg font-bold text-foreground mb-1"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Resumo Fiscal — Jun/2026
          </h3>
          <p className="text-sm text-muted-foreground mb-6">Cálculos automáticos</p>
          <div className="flex-1 space-y-4">
            {[
              { label: "Base Tributável (21,5%)", value: "680.000 Kz", color: "text-foreground" },
              { label: "IVA (21,5%)", value: "146.200 Kz", color: "text-primary" },
              { label: "Base Tributável (7%)", value: "140.000 Kz", color: "text-foreground" },
              { label: "IVA (7%)", value: "9.800 Kz", color: "text-primary" },
              { label: "Isentos (0%)", value: "80.000 Kz", color: "text-muted-foreground" },
              { label: "Retenção na Fonte (6,5%)", value: "20.150 Kz", color: "text-orange-500" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className={`text-sm font-semibold ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">Total IVA a Pagar</span>
            <span className="text-base font-bold text-primary">176.300 Kz</span>
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <h3 className="text-base font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
              Últimas Faturas
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">5 faturas mais recentes</p>
          </div>
          <Link
            to="/cliente/faturas"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Ver todas →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/40">
              <tr>
                {["Número", "Cliente", "Data", "Valor", "Status", ""].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ultimasFaturas.map((f) => (
                <tr key={f.numero} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-semibold text-foreground">{f.numero}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground font-medium">{f.cliente}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(f.data).toLocaleDateString("pt-AO")}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-foreground">
                    {f.valor.toLocaleString("pt-AO")} Kz
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary/10 text-secondary">
                      {f.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 hover:bg-muted rounded-md transition-colors" title="Visualizar">
                        <Eye size={15} className="text-muted-foreground" />
                      </button>
                      <button className="p-1.5 hover:bg-muted rounded-md transition-colors" title="Download PDF">
                        <Download size={15} className="text-muted-foreground" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/cliente/faturas/emitir"
          className="flex items-center gap-4 p-5 bg-card border border-border rounded-xl hover:border-primary hover:shadow-md transition-all group"
        >
          <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
            <FileText className="text-primary" size={22} />
          </div>
          <div>
            <p className="font-semibold text-foreground">Emitir Fatura</p>
            <p className="text-xs text-muted-foreground mt-0.5">Nova fatura eletrónica</p>
          </div>
        </Link>
        <Link
          to="/cliente/relatorios"
          className="flex items-center gap-4 p-5 bg-card border border-border rounded-xl hover:border-secondary hover:shadow-md transition-all group"
        >
          <div className="p-3 bg-secondary/10 rounded-lg group-hover:bg-secondary/20 transition-colors">
            <TrendingUp className="text-secondary" size={22} />
          </div>
          <div>
            <p className="font-semibold text-foreground">Gerar Relatório</p>
            <p className="text-xs text-muted-foreground mt-0.5">PDF ou Excel</p>
          </div>
        </Link>
        <Link
          to="/cliente/relatorios"
          className="flex items-center gap-4 p-5 bg-card border border-border rounded-xl hover:border-orange-400 hover:shadow-md transition-all group"
        >
          <div className="p-3 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
            <Download className="text-orange-500" size={22} />
          </div>
          <div>
            <p className="font-semibold text-foreground">Exportar SAF-T</p>
            <p className="text-xs text-muted-foreground mt-0.5">Para a AGT</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
