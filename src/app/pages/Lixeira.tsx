import { useState } from "react";
import {
  Trash2,
  RotateCcw,
  FileText,
  Users,
  Package,
  AlertTriangle,
  Clock,
  Search,
  CheckSquare,
  Square,
  ChevronDown,
  X,
  Flame,
  Info,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Categoria = "faturas" | "clientes" | "produtos";

interface ItemLixeira {
  id: number;
  categoria: Categoria;
  nome: string;
  detalhe: string;
  apagadoPor: string;
  apagadoEm: string;
  expiresIn: number; // days remaining until auto-purge
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const lixeiraInicial: ItemLixeira[] = [
  // Faturas
  { id: 1, categoria: "faturas", nome: "FT-2026/017", detalhe: "Construções Palmeira · 85.000 Kz", apagadoPor: "João Mendes", apagadoEm: "2026-06-22", expiresIn: 8 },
  { id: 2, categoria: "faturas", nome: "NC-2026/002", detalhe: "MercadoLuanda S.A. · 32.000 Kz", apagadoPor: "Ana Silva", apagadoEm: "2026-06-19", expiresIn: 5 },
  { id: 3, categoria: "faturas", nome: "FT-2026/011", detalhe: "João Baptista · 48.000 Kz", apagadoPor: "João Mendes", apagadoEm: "2026-06-15", expiresIn: 1 },
  { id: 4, categoria: "faturas", nome: "FR-2026/005", detalhe: "Global Import Lda · 210.000 Kz", apagadoPor: "Carlos Neto", apagadoEm: "2026-06-10", expiresIn: 16 },
  // Clientes
  { id: 5, categoria: "clientes", nome: "António da Silva", detalhe: "NIF 5417896523 · Individual", apagadoPor: "João Mendes", apagadoEm: "2026-06-20", expiresIn: 6 },
  { id: 6, categoria: "clientes", nome: "Omega Distribuidora Lda", detalhe: "NIF 5000112233 · Empresarial", apagadoPor: "Ana Silva", apagadoEm: "2026-06-17", expiresIn: 3 },
  { id: 7, categoria: "clientes", nome: "Pedro Lemos", detalhe: "NIF 5417001122 · Individual", apagadoPor: "Carlos Neto", apagadoEm: "2026-06-14", expiresIn: 20 },
  // Produtos
  { id: 8, categoria: "produtos", nome: "Licença Software Pro", detalhe: "80.000 Kz · IVA 14%", apagadoPor: "João Mendes", apagadoEm: "2026-06-21", expiresIn: 7 },
  { id: 9, categoria: "produtos", nome: "Suporte Técnico Premium", detalhe: "120.000 Kz · IVA 14%", apagadoPor: "Ana Silva", apagadoEm: "2026-06-18", expiresIn: 4 },
  { id: 10, categoria: "produtos", nome: "Consultoria Estratégica", detalhe: "200.000 Kz · IVA 21,5%", apagadoPor: "João Mendes", apagadoEm: "2026-06-12", expiresIn: 18 },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const tabConfig: { key: Categoria; label: string; icon: React.ElementType }[] = [
  { key: "faturas", label: "Faturas", icon: FileText },
  { key: "clientes", label: "Clientes", icon: Users },
  { key: "produtos", label: "Produtos", icon: Package },
];

const categoryIcon: Record<Categoria, React.ElementType> = {
  faturas: FileText,
  clientes: Users,
  produtos: Package,
};

const categoryColor: Record<Categoria, string> = {
  faturas: "bg-primary/10 text-primary",
  clientes: "bg-secondary/10 text-secondary",
  produtos: "bg-purple-500/10 text-purple-600",
};

function ExpiryBadge({ days }: { days: number }) {
  if (days <= 1)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-destructive/10 text-destructive">
        <Flame size={11} />
        {days === 1 ? "Expira hoje" : "Expirado"}
      </span>
    );
  if (days <= 5)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-600">
        <Clock size={11} />
        {days}d restantes
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
      <Clock size={11} />
      {days}d restantes
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Lixeira() {
  const [itens, setItens] = useState<ItemLixeira[]>(lixeiraInicial);
  const [activeTab, setActiveTab] = useState<Categoria>("faturas");
  const [busca, setBusca] = useState("");
  const [selecionados, setSelecionados] = useState<Set<number>>(new Set());
  const [modalConfirm, setModalConfirm] = useState<
    | { tipo: "item"; id: number; nome: string }
    | { tipo: "selecionados" }
    | { tipo: "categoria"; cat: Categoria }
    | { tipo: "tudo" }
    | null
  >(null);
  const [sortOrder, setSortOrder] = useState<"recente" | "expira">("recente");

  // ── Derived lists ────────────────────────────────────────────────────────────
  const itensDaTab = itens
    .filter((i) => i.categoria === activeTab)
    .filter(
      (i) =>
        i.nome.toLowerCase().includes(busca.toLowerCase()) ||
        i.detalhe.toLowerCase().includes(busca.toLowerCase()) ||
        i.apagadoPor.toLowerCase().includes(busca.toLowerCase())
    )
    .sort((a, b) =>
      sortOrder === "expira" ? a.expiresIn - b.expiresIn : new Date(b.apagadoEm).getTime() - new Date(a.apagadoEm).getTime()
    );

  const contagemPorCategoria = (cat: Categoria) => itens.filter((i) => i.categoria === cat).length;
  const totalItens = itens.length;

  // ── Selection helpers ────────────────────────────────────────────────────────
  const toggleSelect = (id: number) => {
    setSelecionados((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const idsNaTab = itensDaTab.map((i) => i.id);
    const todosSelected = idsNaTab.every((id) => selecionados.has(id));
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (todosSelected) idsNaTab.forEach((id) => next.delete(id));
      else idsNaTab.forEach((id) => next.add(id));
      return next;
    });
  };

  const selecionadosNaTab = itensDaTab.filter((i) => selecionados.has(i.id));

  // ── Actions ──────────────────────────────────────────────────────────────────
  const restaurar = (ids: number[]) => {
    setItens((prev) => prev.filter((i) => !ids.includes(i.id)));
    setSelecionados((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  };

  const eliminarPermanente = (ids: number[]) => {
    setItens((prev) => prev.filter((i) => !ids.includes(i.id)));
    setSelecionados((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
    setModalConfirm(null);
  };

  const eliminarCategoria = (cat: Categoria) => {
    setItens((prev) => prev.filter((i) => i.categoria !== cat));
    setSelecionados(new Set());
    setModalConfirm(null);
  };

  const esvaziarTudo = () => {
    setItens([]);
    setSelecionados(new Set());
    setModalConfirm(null);
  };

  // ── Confirm modal content ────────────────────────────────────────────────────
  const modalInfo = (() => {
    if (!modalConfirm) return null;
    if (modalConfirm.tipo === "item")
      return { title: "Eliminar permanentemente?", body: `"${modalConfirm.nome}" será eliminado de forma irreversível.`, onConfirm: () => eliminarPermanente([modalConfirm.id]) };
    if (modalConfirm.tipo === "selecionados")
      return { title: `Eliminar ${selecionadosNaTab.length} item(ns)?`, body: "Os itens selecionados serão eliminados de forma permanente e irreversível.", onConfirm: () => eliminarPermanente(selecionadosNaTab.map((i) => i.id)) };
    if (modalConfirm.tipo === "categoria")
      return { title: `Esvaziar ${modalConfirm.cat}?`, body: `Todos os ${contagemPorCategoria(modalConfirm.cat)} itens de "${modalConfirm.cat}" serão eliminados permanentemente.`, onConfirm: () => eliminarCategoria(modalConfirm.cat) };
    return { title: "Esvaziar toda a lixeira?", body: `${totalItens} itens serão eliminados de forma permanente e irreversível. Esta ação não pode ser desfeita.`, onConfirm: esvaziarTudo };
  })();

  const todosTabSelecionados = itensDaTab.length > 0 && itensDaTab.every((i) => selecionados.has(i.id));

  return (
    <div className="p-6 lg:p-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Lixeira
          </h1>
          <p className="text-muted-foreground">
            {totalItens === 0 ? "A lixeira está vazia." : `${totalItens} ite${totalItens === 1 ? "m" : "ns"} na lixeira`}
          </p>
        </div>
        {totalItens > 0 && (
          <button
            onClick={() => setModalConfirm({ tipo: "tudo" })}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-destructive/10 text-destructive border border-destructive/25 rounded-lg font-semibold hover:bg-destructive/20 transition-all text-sm"
          >
            <Trash2 size={16} />
            Esvaziar Lixeira
          </button>
        )}
      </div>

      {/* Auto-purge notice */}
      <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl dark:bg-orange-500/10 dark:border-orange-500/20">
        <Info className="text-orange-500 flex-shrink-0 mt-0.5" size={18} />
        <p className="text-sm text-orange-700 dark:text-orange-400">
          Os itens na lixeira são <strong>automaticamente eliminados após 30 dias</strong>. Restaure-os antes que o prazo expire.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {tabConfig.map(({ key, label, icon: Icon }) => {
          const count = contagemPorCategoria(key);
          return (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setBusca(""); setSelecionados(new Set()); }}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px ${
                activeTab === key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <Icon size={16} />
              {label}
              {count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={17} />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder={`Buscar em ${activeTab}...`}
            className="w-full pl-11 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSortOrder(sortOrder === "recente" ? "expira" : "recente")}
            className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
          >
            <ChevronDown size={15} />
            {sortOrder === "recente" ? "Mais recente" : "Expira primeiro"}
          </button>
          {itensDaTab.length > 0 && (
            <button
              onClick={() => setModalConfirm({ tipo: "categoria", cat: activeTab })}
              className="flex items-center gap-2 px-4 py-2.5 bg-card border border-destructive/30 text-destructive rounded-lg text-sm hover:bg-destructive/10 transition-colors"
            >
              <Trash2 size={15} />
              Esvaziar aba
            </button>
          )}
        </div>
      </div>

      {/* Batch action bar */}
      {selecionadosNaTab.length > 0 && (
        <div className="flex items-center justify-between px-5 py-3 bg-primary/5 border border-primary/20 rounded-xl">
          <p className="text-sm font-semibold text-primary">
            {selecionadosNaTab.length} item(ns) selecionado(s)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => restaurar(selecionadosNaTab.map((i) => i.id))}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-xs font-semibold hover:bg-secondary/90 transition-all"
            >
              <RotateCcw size={13} />
              Restaurar selecionados
            </button>
            <button
              onClick={() => setModalConfirm({ tipo: "selecionados" })}
              className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-xs font-semibold hover:bg-destructive/90 transition-all"
            >
              <Trash2 size={13} />
              Eliminar permanentemente
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {itensDaTab.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-xl">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Trash2 className="text-muted-foreground" size={36} />
          </div>
          <p className="text-lg font-semibold text-foreground mb-1">
            {busca ? "Nenhum resultado" : `Nenhum ${activeTab.slice(0, -1)} na lixeira`}
          </p>
          <p className="text-sm text-muted-foreground">
            {busca ? "Tente outro termo de busca." : "Os itens apagados aparecerão aqui."}
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-5 py-4 w-10">
                    <button onClick={toggleSelectAll} className="text-muted-foreground hover:text-foreground transition-colors">
                      {todosTabSelecionados
                        ? <CheckSquare size={18} className="text-primary" />
                        : <Square size={18} />
                      }
                    </button>
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                    Apagado por
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                    Apagado em
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Expiração
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {itensDaTab.map((item) => {
                  const Icon = categoryIcon[item.categoria];
                  const colorClass = categoryColor[item.categoria];
                  const isSelected = selecionados.has(item.id);

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${isSelected ? "bg-primary/5" : "hover:bg-muted/30"}`}
                    >
                      <td className="px-5 py-4">
                        <button
                          onClick={() => toggleSelect(item.id)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {isSelected
                            ? <CheckSquare size={18} className="text-primary" />
                            : <Square size={18} />
                          }
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg flex-shrink-0 ${colorClass}`}>
                            <Icon size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{item.nome}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{item.detalhe}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">{item.apagadoPor}</span>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {new Date(item.apagadoEm).toLocaleDateString("pt-AO")}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <ExpiryBadge days={item.expiresIn} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => restaurar([item.id])}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-secondary bg-secondary/10 hover:bg-secondary/20 transition-colors"
                            title="Restaurar"
                          >
                            <RotateCcw size={13} />
                            <span className="hidden sm:inline">Restaurar</span>
                          </button>
                          <button
                            onClick={() => setModalConfirm({ tipo: "item", id: item.id, nome: item.nome })}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors"
                            title="Eliminar permanentemente"
                          >
                            <Trash2 size={13} />
                            <span className="hidden sm:inline">Eliminar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer summary */}
          <div className="px-5 py-3 border-t border-border bg-muted/30 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {itensDaTab.length} item(ns) · {selecionadosNaTab.length} selecionado(s)
            </p>
            <p className="text-xs text-muted-foreground">
              Eliminação automática após 30 dias
            </p>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {modalConfirm && modalInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full border border-border">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="text-destructive" size={20} />
                </div>
                <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                  {modalInfo.title}
                </h2>
              </div>
              <button
                onClick={() => setModalConfirm(null)}
                className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-start gap-3 p-4 bg-destructive/8 border border-destructive/20 rounded-xl">
                <AlertTriangle className="text-destructive flex-shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-destructive/90">{modalInfo.body}</p>
              </div>

              <p className="text-sm text-muted-foreground">
                Esta ação é <strong className="text-foreground">permanente e irreversível</strong>. Os dados não poderão ser recuperados.
              </p>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setModalConfirm(null)}
                  className="flex-1 px-5 py-3 bg-muted text-foreground rounded-lg font-semibold hover:bg-muted/80 transition-all text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={modalInfo.onConfirm}
                  className="flex-1 px-5 py-3 bg-destructive text-destructive-foreground rounded-lg font-semibold hover:bg-destructive/90 transition-all shadow-lg shadow-destructive/20 text-sm flex items-center justify-center gap-2"
                >
                  <Trash2 size={15} />
                  Eliminar permanentemente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
