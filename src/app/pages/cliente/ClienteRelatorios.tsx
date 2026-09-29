import { useState } from "react";
import {
  FileText,
  Download,
  Calendar,
  Users,
  TrendingUp,
  Receipt,
  BarChart3,
  CheckCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ivaData = [
  { mes: "Jan", iva: 66650, retencao: 20150 },
  { mes: "Fev", iva: 89810, retencao: 27300 },
  { mes: "Mar", iva: 83850, retencao: 25350 },
  { mes: "Abr", iva: 119720, retencao: 36400 },
  { mes: "Mai", iva: 131250, retencao: 39650 },
  { mes: "Jun", iva: 176300, retencao: 53550 },
];

import { useDocumentTitle } from "../../../hooks/useDocumentTitle";

export function ClienteRelatorios() {
  useDocumentTitle("Relatórios do cliente");

  const [periodoInicio, setPeriodoInicio] = useState("");
  const [periodoFim, setPeriodoFim] = useState("");

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "var(--font-display)" }}>
          Relatórios
        </h1>
        <p className="text-muted-foreground">Gere relatórios financeiros e fiscais da sua empresa</p>
      </div>

      {/* Chart IVA mensal */}
      <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-foreground mb-1" style={{ fontFamily: "var(--font-display)" }}>
            IVA e Retenção na Fonte — 2026
          </h3>
          <p className="text-sm text-muted-foreground">Evolução mensal dos valores fiscais</p>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={ivaData} barGap={4}>
            <CartesianGrid key="cr-grid" strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis key="cr-x" dataKey="mes" stroke="#64748B" style={{ fontSize: "12px" }} />
            <YAxis key="cr-y"
              stroke="#64748B"
              style={{ fontSize: "11px" }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip key="cr-tooltip"
              formatter={(value: number) => [`${value.toLocaleString("pt-AO")} Kz`]}
              contentStyle={{ backgroundColor: "#fff", border: "1px solid #E2E8F0", borderRadius: "8px" }}
            />
            <Bar key="iva" dataKey="iva" fill="#2563EB" name="IVA" radius={[5, 5, 0, 0]} />
            <Bar key="retencao" dataKey="retencao" fill="#F97316" name="Retenção (6,5%)" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Por Período */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-all">
          <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
            <Calendar className="text-primary" size={22} />
          </div>
          <h3 className="text-base font-bold text-foreground mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Relatório por Período
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Faturamento e IVA em um intervalo de datas
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Data Inicial</label>
              <input
                type="date"
                value={periodoInicio}
                onChange={(e) => setPeriodoInicio(e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Data Final</label>
              <input
                type="date"
                value={periodoFim}
                onChange={(e) => setPeriodoFim(e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all text-sm">
                <Download size={15} />
                PDF
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/90 transition-all text-sm">
                <Download size={15} />
                Excel
              </button>
            </div>
          </div>
        </div>

        {/* Por Cliente */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-all">
          <div className="p-3 bg-secondary/10 rounded-lg w-fit mb-4">
            <Users className="text-secondary" size={22} />
          </div>
          <h3 className="text-base font-bold text-foreground mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Relatório por Cliente
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Total faturado por cada cliente
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Cliente</label>
              <select className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent">
                <option value="">Todos os clientes</option>
                <option>Construções Palmeira</option>
                <option>MercadoLuanda S.A.</option>
                <option>Global Import Lda</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Período</label>
              <select className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent">
                <option>2026</option>
                <option>Junho 2026</option>
                <option>Q2 2026</option>
              </select>
            </div>
            <div className="flex gap-2 pt-1">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all text-sm">
                <Download size={15} />
                PDF
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/90 transition-all text-sm">
                <Download size={15} />
                Excel
              </button>
            </div>
          </div>
        </div>

        {/* IVA */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-all">
          <div className="p-3 bg-orange-500/10 rounded-lg w-fit mb-4">
            <Receipt className="text-orange-500" size={22} />
          </div>
          <h3 className="text-base font-bold text-foreground mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Relatório de IVA
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            IVA liquidado e retenção na fonte (6,5%)
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Mês de Referência</label>
              <select className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent">
                <option>Junho 2026</option>
                <option>Maio 2026</option>
                <option>Abril 2026</option>
              </select>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">IVA (21,5%)</span>
                <span className="font-semibold text-foreground">156.100 Kz</span>
              </div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">IVA (7%)</span>
                <span className="font-semibold text-foreground">9.800 Kz</span>
              </div>
              <div className="flex justify-between text-xs border-t border-border pt-1 mt-1">
                <span className="text-muted-foreground font-semibold">Total IVA</span>
                <span className="font-bold text-primary">176.300 Kz</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all text-sm">
                <Download size={15} />
                PDF
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/90 transition-all text-sm">
                <Download size={15} />
                Excel
              </button>
            </div>
          </div>
        </div>

        {/* Produtos Mais Vendidos */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-all">
          <div className="p-3 bg-purple-500/10 rounded-lg w-fit mb-4">
            <BarChart3 className="text-purple-600" size={22} />
          </div>
          <h3 className="text-base font-bold text-foreground mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Produtos Mais Vendidos
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Ranking de produtos por volume de faturação
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Período</label>
              <select className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent">
                <option>Junho 2026</option>
                <option>Q2 2026</option>
                <option>2026</option>
              </select>
            </div>
            <div className="flex gap-2 pt-4">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all text-sm">
                <Download size={15} />
                PDF
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/90 transition-all text-sm">
                <Download size={15} />
                Excel
              </button>
            </div>
          </div>
        </div>

        {/* SAF-T AGT */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-all relative overflow-hidden">
          <div className="absolute top-3 right-3 px-2.5 py-1 bg-orange-500/10 rounded-full border border-orange-500/20">
            <span className="text-xs font-bold text-orange-600">AGT</span>
          </div>
          <div className="p-3 bg-orange-500/10 rounded-lg w-fit mb-4">
            <TrendingUp className="text-orange-500" size={22} />
          </div>
          <h3 className="text-base font-bold text-foreground mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Exportação SAF-T
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Arquivo XML para entrega à Administração Geral Tributária
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Ano Fiscal</label>
              <select className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent">
                <option>2026</option>
                <option>2025</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Mês</label>
              <select className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent">
                <option>Junho</option>
                <option>Maio</option>
                <option>Abril</option>
              </select>
            </div>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all text-sm shadow-lg shadow-orange-500/20">
              <Download size={15} />
              Exportar XML (SAF-T)
            </button>
          </div>
        </div>

        {/* Resumo Anual */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-all">
          <div className="p-3 bg-secondary/10 rounded-lg w-fit mb-4">
            <CheckCircle className="text-secondary" size={22} />
          </div>
          <h3 className="text-base font-bold text-foreground mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Resumo Anual
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Consolidado fiscal do exercício anual
          </p>
          <div className="space-y-2 mb-4">
            {[
              { label: "Total Faturado", value: "3.840.000 Kz" },
              { label: "Total IVA", value: "667.530 Kz" },
              { label: "Total Retenções", value: "249.600 Kz" },
              { label: "Faturas Emitidas", value: "42" },
            ].map((item) => (
              <div key={item.label} className="flex justify-between py-1.5 border-b border-border last:border-0">
                <span className="text-xs text-muted-foreground">{item.label}</span>
                <span className="text-xs font-semibold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all text-sm">
              <Download size={15} />
              PDF
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/90 transition-all text-sm">
              <Download size={15} />
              Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
