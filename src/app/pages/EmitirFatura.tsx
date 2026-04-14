import { useState } from "react";
import { Plus, Trash2, Eye, Save, Send, ArrowLeft, Info } from "lucide-react";
import { Link } from "react-router";

interface Item {
  id: number;
  produto: string;
  quantidade: number;
  precoUnitario: number;
  iva: number;
}

export function EmitirFatura() {
  const [serie, setSerie] = useState("FT-001");
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [cliente, setCliente] = useState("");
  const [itens, setItens] = useState<Item[]>([
    { id: 1, produto: "", quantidade: 1, precoUnitario: 0, iva: 14 }
  ]);

  const adicionarItem = () => {
    const novoId = Math.max(...itens.map(i => i.id), 0) + 1;
    setItens([...itens, { id: novoId, produto: "", quantidade: 1, precoUnitario: 0, iva: 14 }]);
  };

  const removerItem = (id: number) => {
    if (itens.length > 1) {
      setItens(itens.filter(i => i.id !== id));
    }
  };

  const atualizarItem = (id: number, campo: keyof Item, valor: any) => {
    setItens(itens.map(i => i.id === id ? { ...i, [campo]: valor } : i));
  };

  const calcularSubtotal = (item: Item) => {
    return item.quantidade * item.precoUnitario;
  };

  const calcularIVA = (item: Item) => {
    return calcularSubtotal(item) * (item.iva / 100);
  };

  const subtotalGeral = itens.reduce((acc, item) => acc + calcularSubtotal(item), 0);
  const ivaTotal = itens.reduce((acc, item) => acc + calcularIVA(item), 0);
  const retencao = subtotalGeral * 0.065; // 6.5% retenção na fonte para serviços entre empresas
  const totalGeral = subtotalGeral + ivaTotal;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/faturas"
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Emitir Fatura
          </h1>
          <p className="text-muted-foreground">
            Preencha os dados da fatura eletrónica
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cabeçalho */}
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Dados Gerais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Série
                </label>
                <select
                  value={serie}
                  onChange={(e) => setSerie(e.target.value)}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="FT-001">FT-001 - Fatura</option>
                  <option value="FR-001">FR-001 - Fatura Recibo</option>
                  <option value="NC-001">NC-001 - Nota Crédito</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Data de Emissão
                </label>
                <input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Número
                  <span className="ml-2 text-xs text-muted-foreground" title="Número sequencial automático">
                    <Info size={12} className="inline" />
                  </span>
                </label>
                <input
                  type="text"
                  value="FT-2026/006"
                  disabled
                  className="w-full px-4 py-3 bg-muted border border-border rounded-lg font-mono font-semibold text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-foreground mb-2">
                Cliente *
              </label>
              <select
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                required
              >
                <option value="">Selecione um cliente...</option>
                <option value="1">Tech Solutions Lda - NIF: 5000123456</option>
                <option value="2">António Silva - NIF: 5417896523</option>
                <option value="3">Global Import & Export - NIF: 5000987654</option>
                <option value="4">Maria Costa - NIF: 5417896524</option>
              </select>
            </div>
          </div>

          {/* Itens */}
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
                Itens da Fatura
              </h3>
              <button
                onClick={adicionarItem}
                className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/90 transition-all text-sm"
              >
                <Plus size={16} />
                Adicionar Item
              </button>
            </div>

            <div className="space-y-4">
              {itens.map((item) => (
                <div key={item.id} className="p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-4">
                      <label className="block text-xs font-semibold text-muted-foreground mb-2">
                        Produto/Serviço
                      </label>
                      <select
                        value={item.produto}
                        onChange={(e) => atualizarItem(item.id, 'produto', e.target.value)}
                        className="w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary text-sm"
                      >
                        <option value="">Selecione...</option>
                        <option value="consultoria">Consultoria em TI - 50.000 Kz</option>
                        <option value="desenvolvimento">Desenvolvimento Web - 150.000 Kz</option>
                        <option value="suporte">Suporte Técnico - 25.000 Kz</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-muted-foreground mb-2">
                        Quantidade
                      </label>
                      <input
                        type="number"
                        value={item.quantidade}
                        onChange={(e) => atualizarItem(item.id, 'quantidade', parseFloat(e.target.value) || 0)}
                        min="1"
                        className="w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary text-sm"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-muted-foreground mb-2">
                        Preço Unit.
                      </label>
                      <input
                        type="number"
                        value={item.precoUnitario}
                        onChange={(e) => atualizarItem(item.id, 'precoUnitario', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary text-sm"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-muted-foreground mb-2">
                        IVA
                      </label>
                      <select
                        value={item.iva}
                        onChange={(e) => atualizarItem(item.id, 'iva', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary text-sm"
                      >
                        <option value="0">0%</option>
                        <option value="7">7%</option>
                        <option value="14">14%</option>
                        <option value="21.5">21,5%</option>
                      </select>
                    </div>

                    <div className="md:col-span-2 flex items-end gap-2">
                      <div className="flex-1">
                        <label className="block text-xs font-semibold text-muted-foreground mb-2">
                          Subtotal
                        </label>
                        <div className="px-3 py-2 bg-muted border border-border rounded-lg text-sm font-semibold">
                          {calcularSubtotal(item).toLocaleString('pt-AO')} Kz
                        </div>
                      </div>
                      <button
                        onClick={() => removerItem(item.id)}
                        disabled={itens.length === 1}
                        className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Totais */}
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm sticky top-6">
            <h3 className="text-lg font-bold text-foreground mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Resumo
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{subtotalGeral.toLocaleString('pt-AO')} Kz</span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-sm text-muted-foreground">IVA Total</span>
                <span className="font-semibold text-secondary">{ivaTotal.toLocaleString('pt-AO')} Kz</span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-sm text-muted-foreground">
                  Retenção (6,5%)
                  <span className="block text-xs">Serviços entre empresas</span>
                </span>
                <span className="font-semibold text-destructive">-{retencao.toLocaleString('pt-AO')} Kz</span>
              </div>

              <div className="flex justify-between items-center pt-3">
                <span className="text-base font-bold text-foreground">Total Geral</span>
                <span className="text-2xl font-bold text-primary">{(totalGeral - retencao).toLocaleString('pt-AO')} Kz</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-muted text-foreground rounded-lg font-semibold hover:bg-muted/80 transition-all">
                <Save size={20} />
                Salvar Rascunho
              </button>

              <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20">
                <Eye size={20} />
                Visualizar PDF
              </button>

              <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                <Send size={20} />
                Emitir Fatura
              </button>
            </div>

            <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-xs text-primary font-semibold flex items-start gap-2">
                <Info size={14} className="mt-0.5 flex-shrink-0" />
                <span>
                  A fatura será assinada digitalmente e não poderá ser excluída após emissão.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
