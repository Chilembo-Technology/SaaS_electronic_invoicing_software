import { FileText, Download, Calendar, Users, DollarSign, TrendingUp } from "lucide-react";

import { useDocumentTitle } from "../../hooks/useDocumentTitle";

export function Relatorios() {
  useDocumentTitle("Relatórios");

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          Relatórios
        </h1>
        <p className="text-muted-foreground">
          Gere e exporte relatórios financeiros
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Relatório por Período */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-all">
          <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
            <Calendar className="text-primary" size={24} />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Relatório por Período
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Faturamento e despesas em um período específico
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Data Inicial
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Data Final
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all text-sm">
                <Download size={16} />
                PDF
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/90 transition-all text-sm">
                <Download size={16} />
                Excel
              </button>
            </div>
          </div>
        </div>

        {/* Relatório por Cliente */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-all">
          <div className="p-3 bg-secondary/10 rounded-lg w-fit mb-4">
            <Users className="text-secondary" size={24} />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Relatório por Cliente
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Análise de faturamento por cliente
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Selecionar Cliente
              </label>
              <select className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm">
                <option>Todos os clientes</option>
                <option>Tech Solutions Lda</option>
                <option>António Silva</option>
                <option>Global Import & Export</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Período
              </label>
              <select className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm">
                <option>Último mês</option>
                <option>Últimos 3 meses</option>
                <option>Últimos 6 meses</option>
                <option>Último ano</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all text-sm">
                <Download size={16} />
                PDF
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/90 transition-all text-sm">
                <Download size={16} />
                Excel
              </button>
            </div>
          </div>
        </div>

        {/* Relatório de IVA */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-all">
          <div className="p-3 bg-purple-500/10 rounded-lg w-fit mb-4">
            <DollarSign className="text-purple-600" size={24} />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Relatório de IVA
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Declaração de IVA para AGT
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Mês/Ano
              </label>
              <input
                type="month"
                className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm"
              />
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-muted-foreground">IVA Cobrado</span>
                <span className="font-semibold">124.500 Kz</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">IVA a Pagar</span>
                <span className="font-bold text-primary">124.500 Kz</span>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all text-sm">
                <Download size={16} />
                PDF
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/90 transition-all text-sm">
                <Download size={16} />
                Excel
              </button>
            </div>
          </div>
        </div>

        {/* Exportação SAF-T AGT */}
        <div className="bg-gradient-to-br from-primary to-secondary p-6 rounded-xl shadow-lg text-white md:col-span-2 lg:col-span-3">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
                  <FileText size={24} />
                </div>
                <h3 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                  Exportação SAF-T (AGT)
                </h3>
              </div>
              <p className="text-white/90 mb-4">
                Exporte seus dados fiscais no formato Standard Audit File for Tax Purposes de Angola
              </p>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span>Validação de integridade: OK</span>
                </div>
                <div className="flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full">
                  <TrendingUp size={14} />
                  <span>Última exportação: 01/04/2026</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Mês de Exportação
                </label>
                <input
                  type="month"
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/60 text-sm"
                />
              </div>
              <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary rounded-lg font-semibold hover:bg-white/90 transition-all shadow-lg">
                <Download size={20} />
                Exportar XML
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
