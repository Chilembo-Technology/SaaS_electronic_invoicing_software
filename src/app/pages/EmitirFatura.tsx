import { useState } from "react";
import { Plus, Trash2, Eye, Save, Send, ArrowLeft, Info, ChevronDown, AlertCircle, CheckCircle } from "lucide-react";
import { Link, useLocation } from "react-router";

interface Item {
  id: number;
  produto: string;
  descricao: string;
  quantidade: number;
  precoUnitario: number;
  iva: number;
}

const clientesLista = [
  { id: "1", nome: "Tech Solutions Lda", nif: "5000123456", tipo: "Empresarial" },
  { id: "2", nome: "António Silva", nif: "5417896523", tipo: "Individual" },
  { id: "3", nome: "Global Import & Export", nif: "5000987654", tipo: "Empresarial" },
  { id: "4", nome: "Maria Costa", nif: "5417896524", tipo: "Individual" },
  { id: "5", nome: "Construções Palmeira", nif: "5000321654", tipo: "Empresarial" },
];

const produtosLista = [
  { id: "consultoria", nome: "Consultoria em TI", preco: 50000, iva: 14 },
  { id: "desenvolvimento", nome: "Desenvolvimento Web", preco: 150000, iva: 14 },
  { id: "suporte", nome: "Suporte Técnico", preco: 25000, iva: 14 },
  { id: "licenca", nome: "Licença Software", preco: 80000, iva: 21.5 },
  { id: "formacao", nome: "Formação Profissional", preco: 60000, iva: 0 },
];

const seriesInfo: Record<string, { descricao: string; cor: string }> = {
  "FT-001": { descricao: "Documento de compra e venda de bens ou serviços.", cor: "text-primary" },
  "FR-001": { descricao: "Fatura com comprovativo de pagamento imediato.", cor: "text-purple-600" },
  "NC-001": { descricao: "Anula total ou parcialmente uma fatura.", cor: "text-orange-600" },
  "ND-001": { descricao: "Acrescenta valor a uma fatura anterior.", cor: "text-blue-600" },
};

import { useDocumentTitle } from "../../hooks/useDocumentTitle";

export function EmitirFatura() {
  useDocumentTitle("Emitir fatura");

  const location = useLocation();
  const isClientePanel = location.pathname.startsWith("/cliente");
  const backHref = isClientePanel ? "/cliente/faturas" : "/faturas";

  const [serie, setSerie] = useState("FT-001");
  const [data, setData] = useState(new Date().toISOString().split("T")[0]);
  const [clienteId, setClienteId] = useState("");
  const [vencimento, setVencimento] = useState("");
  const [retencaoAtiva, setRetencaoAtiva] = useState(false);
  const [observacoes, setObservacoes] = useState("");
  const [emitido, setEmitido] = useState(false);
  const [validado, setValidado] = useState(false);

  const [itens, setItens] = useState<Item[]>([
    { id: 1, produto: "", descricao: "", quantidade: 1, precoUnitario: 0, iva: 14 },
  ]);

  const clienteSelecionado = clientesLista.find((c) => c.id === clienteId);
  const clienteEmpresarial = clienteSelecionado?.tipo === "Empresarial";

  const adicionarItem = () => {
    const novoId = Math.max(...itens.map((i) => i.id), 0) + 1;
    setItens([...itens, { id: novoId, produto: "", descricao: "", quantidade: 1, precoUnitario: 0, iva: 14 }]);
  };

  const removerItem = (id: number) => {
    if (itens.length > 1) setItens(itens.filter((i) => i.id !== id));
  };

  const atualizarItem = (id: number, campo: keyof Item, valor: string | number) => {
    setItens(
      itens.map((i) => {
        if (i.id !== id) return i;
        if (campo === "produto") {
          const prod = produtosLista.find((p) => p.id === valor);
          if (prod) return { ...i, produto: prod.id, precoUnitario: prod.preco, iva: prod.iva };
        }
        return { ...i, [campo]: valor };
      })
    );
  };

  const subtotalItem = (item: Item) => item.quantidade * item.precoUnitario;
  const ivaItem = (item: Item) => subtotalItem(item) * (item.iva / 100);

  const subtotalGeral = itens.reduce((acc, i) => acc + subtotalItem(i), 0);
  const ivaTotal = itens.reduce((acc, i) => acc + ivaItem(i), 0);
  const retencao = retencaoAtiva && clienteEmpresarial ? subtotalGeral * 0.065 : 0;
  const totalFinal = subtotalGeral + ivaTotal - retencao;

  const formValido = clienteId && itens.some((i) => i.produto && i.precoUnitario > 0);

  const handleEmitir = () => {
    if (!formValido) { setValidado(true); return; }
    setEmitido(true);
  };

  if (emitido) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-secondary" size={40} />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Fatura Emitida!
          </h2>
          <p className="text-muted-foreground mb-2">
            <span className="font-mono font-bold text-foreground">FT-2026/006</span> foi assinada digitalmente e registada.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            O cliente receberá uma cópia por email automaticamente.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
              <Eye size={18} />
              Visualizar PDF
            </button>
            <Link
              to={backHref}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-muted text-foreground rounded-lg font-semibold hover:bg-muted/80 transition-all"
            >
              Ver todas as Faturas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 pb-32 lg:pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to={backHref} className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
          <ArrowLeft size={22} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
            Emitir Fatura
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Preencha os dados abaixo para emitir uma fatura eletrónica</p>
        </div>
      </div>

      {/* Validation alert */}
      {validado && !formValido && (
        <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/25 rounded-xl">
          <AlertCircle className="text-destructive flex-shrink-0 mt-0.5" size={18} />
          <p className="text-sm text-destructive">
            Selecione um cliente e adicione pelo menos um item com produto e preço preenchidos.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-5">

          {/* Série + Data + Número */}
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <h3 className="text-base font-bold text-foreground mb-5" style={{ fontFamily: "var(--font-display)" }}>
              Dados do Documento
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Série</label>
                <select
                  value={serie}
                  onChange={(e) => setSerie(e.target.value)}
                  className="w-full px-3 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                >
                  <option value="FT-001">FT — Fatura</option>
                  <option value="FR-001">FR — Fatura Recibo</option>
                  <option value="NC-001">NC — Nota de Crédito</option>
                  <option value="ND-001">ND — Nota de Débito</option>
                </select>
                <p className={`text-xs mt-1.5 ${seriesInfo[serie]?.cor}`}>
                  {seriesInfo[serie]?.descricao}
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Data de Emissão</label>
                <input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="w-full px-3 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Número
                  <span className="ml-1.5 text-xs text-muted-foreground font-normal">(automático)</span>
                </label>
                <input
                  type="text"
                  value="FT-2026/006"
                  readOnly
                  className="w-full px-3 py-3 bg-muted border border-border rounded-lg font-mono text-sm text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Cliente + Vencimento */}
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <h3 className="text-base font-bold text-foreground mb-5" style={{ fontFamily: "var(--font-display)" }}>
              Cliente
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Cliente <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <select
                    value={clienteId}
                    onChange={(e) => setClienteId(e.target.value)}
                    className={`w-full px-3 py-3 bg-input border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm appearance-none pr-10 ${
                      validado && !clienteId ? "border-destructive" : "border-border"
                    }`}
                  >
                    <option value="">Selecionar cliente...</option>
                    {clientesLista.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome} — NIF {c.nif}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
                </div>
                {clienteSelecionado && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      clienteSelecionado.tipo === "Empresarial"
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary/10 text-secondary"
                    }`}>
                      {clienteSelecionado.tipo}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">{clienteSelecionado.nif}</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Data de Vencimento
                  <span className="ml-1.5 text-xs text-muted-foreground font-normal">(opcional)</span>
                </label>
                <input
                  type="date"
                  value={vencimento}
                  onChange={(e) => setVencimento(e.target.value)}
                  min={data}
                  className="w-full px-3 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>

            {/* Retencao toggle — only if empresarial */}
            {clienteEmpresarial && (
              <div className="mt-4 flex items-start justify-between p-4 bg-orange-50 border border-orange-200 rounded-xl dark:bg-orange-500/10 dark:border-orange-500/20">
                <div className="flex items-start gap-3">
                  <Info className="text-orange-500 flex-shrink-0 mt-0.5" size={16} />
                  <div>
                    <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                      Retenção na Fonte (6,5%)
                    </p>
                    <p className="text-xs text-orange-600/80 dark:text-orange-400/70 mt-0.5">
                      Aplicável a serviços prestados entre empresas angolanas.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setRetencaoAtiva(!retencaoAtiva)}
                  className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-200 ${
                    retencaoAtiva ? "bg-orange-500" : "bg-muted"
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                    retencaoAtiva ? "translate-x-7" : "translate-x-1"
                  }`} />
                </button>
              </div>
            )}
          </div>

          {/* Itens */}
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                Itens da Fatura
              </h3>
              <button
                onClick={adicionarItem}
                className="flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary border border-secondary/20 rounded-lg font-semibold hover:bg-secondary/20 transition-all text-sm"
              >
                <Plus size={15} />
                Adicionar Item
              </button>
            </div>

            <div className="space-y-3">
              {itens.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-colors ${
                    validado && (!item.produto || item.precoUnitario === 0)
                      ? "border-destructive/40 bg-destructive/5"
                      : "border-border bg-muted/20 hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Item {idx + 1}
                    </span>
                    <button
                      onClick={() => removerItem(item.id)}
                      disabled={itens.length === 1}
                      className="p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Remover item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    {/* Produto */}
                    <div className="sm:col-span-5">
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                        Produto / Serviço <span className="text-destructive">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={item.produto}
                          onChange={(e) => atualizarItem(item.id, "produto", e.target.value)}
                          className="w-full px-3 py-2.5 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary text-sm appearance-none pr-8"
                        >
                          <option value="">Selecionar...</option>
                          {produtosLista.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nome}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={14} />
                      </div>
                    </div>

                    {/* Qtd */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Qtd.</label>
                      <input
                        type="number"
                        value={item.quantidade}
                        onChange={(e) => atualizarItem(item.id, "quantidade", parseFloat(e.target.value) || 0)}
                        min="0.01"
                        step="0.01"
                        className="w-full px-3 py-2.5 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary text-sm text-center"
                      />
                    </div>

                    {/* Preço */}
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Preço Unit. (Kz)</label>
                      <input
                        type="number"
                        value={item.precoUnitario || ""}
                        onChange={(e) => atualizarItem(item.id, "precoUnitario", parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        placeholder="0"
                        className="w-full px-3 py-2.5 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary text-sm"
                      />
                    </div>

                    {/* IVA */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5">IVA</label>
                      <div className="relative">
                        <select
                          value={item.iva}
                          onChange={(e) => atualizarItem(item.id, "iva", parseFloat(e.target.value))}
                          className="w-full px-3 py-2.5 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary text-sm appearance-none pr-7"
                        >
                          <option value="0">0%</option>
                          <option value="7">7%</option>
                          <option value="14">14%</option>
                          <option value="21.5">21,5%</option>
                        </select>
                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={12} />
                      </div>
                    </div>

                    {/* Descricao */}
                    <div className="sm:col-span-9">
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                        Descrição
                        <span className="ml-1 font-normal">(opcional)</span>
                      </label>
                      <input
                        type="text"
                        value={item.descricao}
                        onChange={(e) => atualizarItem(item.id, "descricao", e.target.value)}
                        placeholder="Detalhe adicional..."
                        className="w-full px-3 py-2.5 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary text-sm"
                      />
                    </div>

                    {/* Subtotal row */}
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Subtotal</label>
                      <div className="px-3 py-2.5 bg-muted/60 border border-border rounded-lg text-sm font-semibold text-foreground">
                        {subtotalItem(item).toLocaleString("pt-AO")} Kz
                      </div>
                      {item.iva > 0 && subtotalItem(item) > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          + {ivaItem(item).toLocaleString("pt-AO")} Kz IVA
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={adicionarItem}
              className="mt-4 w-full py-2.5 border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Adicionar outro item
            </button>
          </div>

          {/* Observações */}
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <label className="block text-sm font-semibold text-foreground mb-2">
              Observações
              <span className="ml-1.5 text-xs text-muted-foreground font-normal">(opcional)</span>
            </label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              placeholder="Condições de pagamento, notas adicionais, referências..."
              className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none text-sm"
            />
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm sticky top-6 space-y-5">
            <h3 className="text-base font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
              Resumo da Fatura
            </h3>

            {/* Totals */}
            <div className="space-y-2">
              {itens.filter((i) => i.produto && subtotalItem(i) > 0).map((item) => {
                const prod = produtosLista.find((p) => p.id === item.produto);
                return (
                  <div key={item.id} className="flex justify-between text-xs text-muted-foreground py-1">
                    <span className="truncate mr-2">{prod?.nome || "Item"} × {item.quantidade}</span>
                    <span className="flex-shrink-0">{subtotalItem(item).toLocaleString("pt-AO")} Kz</span>
                  </div>
                );
              })}

              {itens.some((i) => i.produto && subtotalItem(i) > 0) && (
                <div className="border-t border-border pt-2 mt-2" />
              )}

              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{subtotalGeral.toLocaleString("pt-AO")} Kz</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">IVA</span>
                <span className="font-semibold text-secondary">+{ivaTotal.toLocaleString("pt-AO")} Kz</span>
              </div>
              {retencao > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Retenção (6,5%)</span>
                  <span className="font-semibold text-orange-500">−{retencao.toLocaleString("pt-AO")} Kz</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-3 border-t border-border">
                <span className="font-bold text-foreground">Total a Pagar</span>
                <span className="text-2xl font-bold text-primary">{totalFinal.toLocaleString("pt-AO")} Kz</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5 pt-1">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-muted text-foreground rounded-lg font-semibold hover:bg-muted/80 transition-all text-sm">
                <Save size={16} />
                Salvar Rascunho
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-card border border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-all text-sm">
                <Eye size={16} />
                Pré-visualizar PDF
              </button>
              <button
                onClick={handleEmitir}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all text-sm shadow-lg ${
                  formValido
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20"
                    : "bg-primary/50 text-primary-foreground cursor-not-allowed"
                }`}
              >
                <Send size={16} />
                Emitir Fatura
              </button>
            </div>

            {/* Warning */}
            <div className="p-3.5 bg-primary/8 border border-primary/20 rounded-xl">
              <p className="text-xs text-primary flex items-start gap-2">
                <Info size={13} className="mt-0.5 flex-shrink-0" />
                <span>
                  Após emissão, a fatura é assinada digitalmente e <strong>não pode ser eliminada</strong>, apenas anulada.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 flex gap-3 z-40">
        <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-muted text-foreground rounded-lg font-semibold text-sm">
          <Save size={16} />
          Rascunho
        </button>
        <button
          onClick={handleEmitir}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-lg font-semibold shadow-lg shadow-primary/20 text-sm"
        >
          <Send size={16} />
          Emitir — {totalFinal.toLocaleString("pt-AO")} Kz
        </button>
      </div>
    </div>
  );
}
