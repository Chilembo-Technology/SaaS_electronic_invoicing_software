import {
  TrendingUp,
  FileText,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Brain
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const faturamentoData = [
  { mes: "Jan", faturamento: 450000, despesas: 280000 },
  { mes: "Fev", faturamento: 520000, despesas: 310000 },
  { mes: "Mar", faturamento: 480000, despesas: 290000 },
  { mes: "Abr", faturamento: 680000, despesas: 350000 },
  { mes: "Mai", faturamento: 750000, despesas: 380000 },
  { mes: "Jun", faturamento: 820000, despesas: 420000 },
];

const fluxoCaixaData = [
  { mes: "Jul", previsto: 850000, realizado: 820000 },
  { mes: "Ago", previsto: 920000, realizado: null },
  { mes: "Set", previsto: 980000, realizado: null },
  { mes: "Out", previsto: 1050000, realizado: null },
];

export function Dashboard() {
  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Visão geral do seu negócio em tempo real
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <DollarSign className="text-primary" size={24} />
            </div>
            <div className="flex items-center gap-1 text-secondary text-sm font-semibold">
              <ArrowUpRight size={16} />
              +12.5%
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Faturamento Mensal</p>
          <p className="text-2xl font-bold text-foreground">820.000 Kz</p>
          <p className="text-xs text-muted-foreground mt-2">vs. mês anterior</p>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-secondary/10 rounded-lg">
              <FileText className="text-secondary" size={24} />
            </div>
            <div className="flex items-center gap-1 text-secondary text-sm font-semibold">
              <ArrowUpRight size={16} />
              +8.3%
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Total de Faturas</p>
          <p className="text-2xl font-bold text-foreground">284</p>
          <p className="text-xs text-muted-foreground mt-2">156 este mês</p>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Users className="text-purple-600" size={24} />
            </div>
            <div className="flex items-center gap-1 text-secondary text-sm font-semibold">
              <ArrowUpRight size={16} />
              +5.2%
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Clientes Ativos</p>
          <p className="text-2xl font-bold text-foreground">127</p>
          <p className="text-xs text-muted-foreground mt-2">12 novos este mês</p>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <Activity className="text-orange-600" size={24} />
            </div>
            <div className="flex items-center gap-1 text-destructive text-sm font-semibold">
              <ArrowDownRight size={16} />
              -2.1%
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Ticket Médio</p>
          <p className="text-2xl font-bold text-foreground">2.887 Kz</p>
          <p className="text-xs text-muted-foreground mt-2">vs. mês anterior</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Faturamento vs Despesas */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-foreground mb-1" style={{ fontFamily: 'var(--font-display)' }}>
              Faturamento vs Despesas
            </h3>
            <p className="text-sm text-muted-foreground">Últimos 6 meses</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={faturamentoData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="mes" stroke="#64748B" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748B" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="faturamento" fill="#2563EB" name="Faturamento" radius={[8, 8, 0, 0]} />
              <Bar dataKey="despesas" fill="#EF4444" name="Despesas" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Previsão de Fluxo de Caixa (Machine Learning) */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm relative overflow-hidden">
          <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 rounded-full border border-purple-500/20">
            <Brain className="text-purple-600" size={14} />
            <span className="text-xs font-semibold text-purple-600">IA</span>
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-bold text-foreground mb-1" style={{ fontFamily: 'var(--font-display)' }}>
              Previsão de Fluxo de Caixa
            </h3>
            <p className="text-sm text-muted-foreground">Próximos 4 meses (Machine Learning)</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={fluxoCaixaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="mes" stroke="#64748B" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748B" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="realizado"
                stroke="#10B981"
                strokeWidth={3}
                name="Realizado"
                dot={{ fill: '#10B981', r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="previsto"
                stroke="#8B5CF6"
                strokeWidth={3}
                strokeDasharray="5 5"
                name="Previsto (IA)"
                dot={{ fill: '#8B5CF6', r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-primary to-secondary p-8 rounded-xl shadow-lg text-white">
        <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
          Ações Rápidas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-lg border border-white/30 transition-all text-left">
            <FileText className="mb-2" size={24} />
            <p className="font-semibold">Nova Fatura</p>
            <p className="text-sm text-white/80">Emitir fatura eletrónica</p>
          </button>
          <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-lg border border-white/30 transition-all text-left">
            <Users className="mb-2" size={24} />
            <p className="font-semibold">Novo Cliente</p>
            <p className="text-sm text-white/80">Cadastrar cliente</p>
          </button>
          <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-lg border border-white/30 transition-all text-left">
            <DollarSign className="mb-2" size={24} />
            <p className="font-semibold">Relatórios</p>
            <p className="text-sm text-white/80">Gerar relatórios</p>
          </button>
        </div>
      </div>
    </div>
  );
}
