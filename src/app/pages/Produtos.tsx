import { Plus, Search, Edit2, Trash2, Package, X, ToggleLeft, ToggleRight } from "lucide-react";
import { useState } from "react";

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  iva: number;
  ativo: boolean;
}

const produtosIniciais: Produto[] = [
  { id: 1, nome: "Consultoria em TI", descricao: "Serviço de consultoria especializada", preco: 50000, iva: 14, ativo: true },
  { id: 2, nome: "Desenvolvimento Web", descricao: "Criação de websites e aplicações", preco: 150000, iva: 14, ativo: true },
  { id: 3, nome: "Suporte Técnico", descricao: "Suporte técnico mensal", preco: 25000, iva: 14, ativo: true },
  { id: 4, nome: "Licença Software", descricao: "Licença anual de software", preco: 80000, iva: 14, ativo: false },
];

const taxasIVA = [
  { valor: 0, label: "0% (Isento)" },
  { valor: 7, label: "7%" },
  { valor: 14, label: "14%" },
  { valor: 21.5, label: "21,5%" },
];

import { useDocumentTitle } from "../../hooks/useDocumentTitle";

export function Produtos() {
  useDocumentTitle("Produtos");

  const [produtos, setProdutos] = useState<Produto[]>(produtosIniciais);
  const [modalAberto, setModalAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const [novoProduto, setNovoProduto] = useState({
    nome: "",
    descricao: "",
    preco: "",
    iva: 14,
  });

  const produtosFiltrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    p.descricao.toLowerCase().includes(busca.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const novoId = Math.max(...produtos.map(p => p.id), 0) + 1;
    setProdutos([...produtos, {
      ...novoProduto,
      id: novoId,
      preco: parseFloat(novoProduto.preco),
      ativo: true
    }]);
    setModalAberto(false);
    setNovoProduto({
      nome: "",
      descricao: "",
      preco: "",
      iva: 14,
    });
  };

  const toggleAtivo = (id: number) => {
    setProdutos(produtos.map(p =>
      p.id === id ? { ...p, ativo: !p.ativo } : p
    ));
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Produtos e Serviços
          </h1>
          <p className="text-muted-foreground">
            Gerencie seus produtos e serviços
          </p>
        </div>
        <button
          onClick={() => setModalAberto(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          Novo Produto
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar produtos ou serviços..."
          className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {produtosFiltrados.map((produto) => (
          <div
            key={produto.id}
            className={`bg-card rounded-xl border-2 shadow-sm hover:shadow-md transition-all ${
              produto.ativo ? 'border-border' : 'border-muted opacity-60'
            }`}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Package className="text-primary" size={24} />
                </div>
                <button
                  onClick={() => toggleAtivo(produto.id)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  {produto.ativo ? (
                    <ToggleRight size={24} className="text-secondary" />
                  ) : (
                    <ToggleLeft size={24} className="text-muted-foreground" />
                  )}
                </button>
              </div>

              <h3 className="text-lg font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                {produto.nome}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {produto.descricao}
              </p>

              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Preço</p>
                  <p className="text-2xl font-bold text-primary">
                    {produto.preco.toLocaleString('pt-AO')} Kz
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">IVA</p>
                  <span className="inline-flex px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-semibold">
                    {produto.iva}%
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-border">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 hover:bg-muted rounded-lg transition-colors">
                  <Edit2 size={16} />
                  <span className="text-sm font-medium">Editar</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors">
                  <Trash2 size={16} />
                  <span className="text-sm font-medium">Excluir</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {produtosFiltrados.length === 0 && (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Package className="mx-auto mb-4 text-muted-foreground" size={48} />
          <p className="text-muted-foreground">Nenhum produto encontrado</p>
        </div>
      )}

      {/* Modal */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
                Novo Produto/Serviço
              </h2>
              <button
                onClick={() => setModalAberto(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  value={novoProduto.nome}
                  onChange={(e) => setNovoProduto({ ...novoProduto, nome: e.target.value })}
                  placeholder="Ex: Consultoria em TI"
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Descrição
                </label>
                <textarea
                  value={novoProduto.descricao}
                  onChange={(e) => setNovoProduto({ ...novoProduto, descricao: e.target.value })}
                  placeholder="Descreva o produto ou serviço..."
                  rows={3}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Preço (Kz) *
                  </label>
                  <input
                    type="number"
                    value={novoProduto.preco}
                    onChange={(e) => setNovoProduto({ ...novoProduto, preco: e.target.value })}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Taxa de IVA *
                  </label>
                  <select
                    value={novoProduto.iva}
                    onChange={(e) => setNovoProduto({ ...novoProduto, iva: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  >
                    {taxasIVA.map(taxa => (
                      <option key={taxa.valor} value={taxa.valor}>
                        {taxa.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="flex-1 px-6 py-3 bg-muted text-foreground rounded-lg font-semibold hover:bg-muted/80 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
