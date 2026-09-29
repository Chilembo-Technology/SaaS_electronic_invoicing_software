import { useState, useEffect } from "react";
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
  X,
  Flame,
  Info,
  Building2,
} from "lucide-react";
import { organizationService } from "../../services/organizationService";
import { authService } from "../../services/authService";

type Categoria = "empresas" | "usuarios" | "faturas" | "clientes" | "produtos";

interface ItemLixeira {
  id: number | string;
  categoria: Categoria;
  nome: string;
  detalhe: string;
  apagadoPor: string;
  apagadoEm: string;
  expiresIn: number;
}

const lixeiraInicial: ItemLixeira[] = [
  { id: "e1", categoria: "empresas", nome: "Consultoria Global Lda", detalhe: "NIF 5000998877 · Enterprise", apagadoPor: "Admin", apagadoEm: "2026-08-10", expiresIn: 25 },
  { id: "u1", categoria: "usuarios", nome: "Carlos Eduardo", detalhe: "carlos@email.com · Operador", apagadoPor: "Admin", apagadoEm: "2026-08-12", expiresIn: 27 },
  { id: 1, categoria: "faturas", nome: "FT-2026/017", detalhe: "Construções Palmeira · 85.000 Kz", apagadoPor: "João Mendes", apagadoEm: "2026-06-22", expiresIn: 8 },
  { id: 2, categoria: "faturas", nome: "NC-2026/002", detalhe: "MercadoLuanda S.A. · 32.000 Kz", apagadoPor: "Ana Silva", apagadoEm: "2026-06-19", expiresIn: 5 },
  { id: 5, categoria: "clientes", nome: "António da Silva", detalhe: "NIF 5417896523 · Individual", apagadoPor: "João Mendes", apagadoEm: "2026-06-20", expiresIn: 6 },
  { id: 8, categoria: "produtos", nome: "Licença Software Pro", detalhe: "80.000 Kz · IVA 14%", apagadoPor: "João Mendes", apagadoEm: "2026-06-21", expiresIn: 7 },
];

const tabConfig: { key: Categoria; label: string; icon: React.ElementType }[] = [
  { key: "empresas", label: "Empresas", icon: Building2 },
  { key: "usuarios", label: "Usuários", icon: Users },
  { key: "faturas", label: "Faturas", icon: FileText },
  { key: "clientes", label: "Clientes", icon: Users },
  { key: "produtos", label: "Produtos", icon: Package },
];

const categoryColor: Record<Categoria, string> = {
  empresas: "bg-primary/10 text-primary",
  usuarios: "bg-secondary/10 text-secondary",
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

import { useDocumentTitle } from "../../hooks/useDocumentTitle";

export function Lixeira() {
  useDocumentTitle("Lixeira");

  const [itens, setItens] = useState<ItemLixeira[]>(lixeiraInicial);
  const [activeTab, setActiveTab] = useState<Categoria>("empresas");
  const [busca, setBusca] = useState("");
  const [selecionados, setSelecionados] = useState<Set<number | string>>(new Set());
  const [modalConfirm, setModalConfirm] = useState<
    | { tipo: "item"; id: number | string; nome: string }
    | { tipo: "selecionados" }
    | { tipo: "categoria"; cat: Categoria }
    | { tipo: "tudo" }
    | null
  >(null);
  const [sortOrder, setSortOrder] = useState<"recente" | "expira">("recente");

  useEffect(() => {
    async function fetchTrash() {
      try {
        const trashCompanies = await organizationService.listTrash();
        const trashUsers = await authService.listTrash();

        const mappedCompanies: ItemLixeira[] = (trashCompanies || []).map((c) => ({
          id: c.id,
          categoria: "empresas",
          nome: c.name,
          detalhe: `NIF ${c.nif || c.taxId || "5000000000"}`,
          apagadoPor: "Sistema",
          apagadoEm: (c.deletedAt || new Date().toISOString()).toString(),
          expiresIn: 30,
        }));

        const mappedUsers: ItemLixeira[] = (trashUsers || []).map((u) => ({
          id: u.id,
          categoria: "usuarios",
          nome: u.name || "Usuário",
          detalhe: `${u.email}`,
          apagadoPor: "Administrador",
          apagadoEm: (u.deletedAt || new Date().toISOString()).toString(),
          expiresIn: 30,
        }));

        const outrostens = lixeiraInicial.filter((i) => i.categoria !== "empresas" && i.categoria !== "usuarios");
        setItens([...mappedCompanies, ...mappedUsers, ...outrostens]);
      } catch (err) {
        console.warn("Carregados itens locais da lixeira.", err);
      }
    }
    fetchTrash();
  }, []);

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

  const toggleSelect = (id: number | string) => {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
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

  const restaurar = async (ids: (number | string)[]) => {
    for (const id of ids) {
      const item = itens.find((i) => i.id === id);
      if (!item) continue;
      try {
        if (item.categoria === "empresas") {
          await organizationService.restoreCompanies([id]);
        } else if (item.categoria === "usuarios") {
          await authService.restoreUser(id);
        }
      } catch (err) {
        console.warn("Restaurado localmente.", err);
      }
    }

    setItens((prev) => prev.filter((i) => !ids.includes(i.id)));
    setSelecionados((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  };

  const eliminarPermanente = async (ids: (number | string)[]) => {
    for (const id of ids) {
      const item = itens.find((i) => i.id === id);
      if (!item) continue;
      try {
        if (item.categoria === "empresas") {
          await organizationService.deletePermanently(id);
        } else if (item.categoria === "usuarios") {
          await authService.deletePermanently(id);
        }
      } catch (err) {
        console.warn("Eliminado permanentemente localmente.", err);
      }
    }

    setItens((prev) => prev.filter((i) => !ids.includes(i.id)));
    setSelecionados((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
    setModalConfirm(null);
  };

  const modalInfo = (() => {
    if (!modalConfirm) return null;
    if (modalConfirm.tipo === "item")
      return { title: "Eliminar permanentemente?", body: `"${modalConfirm.nome}" será eliminado de forma irreversível.`, onConfirm: () => eliminarPermanente([modalConfirm.id]) };
    if (modalConfirm.tipo === "selecionados")
      return { title: `Eliminar ${selecionadosNaTab.length} item(ns)?`, body: "Os itens selecionados serão eliminados de forma permanente e irreversível.", onConfirm: () => eliminarPermanente(selecionadosNaTab.map((i) => i.id)) };
    if (modalConfirm.tipo === "categoria")
      return { title: `Esvaziar ${modalConfirm.cat}?`, body: `Todos os ${contagemPorCategoria(modalConfirm.cat)} itens serão eliminados permanentemente.`, onConfirm: () => eliminarPermanente(itens.filter((i) => i.categoria === modalConfirm.cat).map((i) => i.id)) };
    return { title: "Esvaziar toda a lixeira?", body: `${totalItens} itens serão eliminados de forma permanente e irreversível. Esta ação não pode ser desfeita.`, onConfirm: () => eliminarPermanente(itens.map((i) => i.id)) };
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
      <div className="flex gap-2 border-b border-border overflow-x-auto">
        {tabConfig.map(({ key, label, icon: Icon }) => {
          const count = contagemPorCategoria(key);
          return (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setBusca(""); setSelecionados(new Set()); }}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px whitespace-nowrap ${
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
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={17} />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder={`Buscar em ${activeTab}...`}
            className="w-full pl-11 pr-4 py-2.5 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {selecionadosNaTab.length > 0 && (
            <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
              <button
                onClick={() => restaurar(selecionadosNaTab.map((i) => i.id))}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-white rounded-md text-xs font-semibold hover:bg-secondary/90 transition-all shadow-sm"
              >
                <RotateCcw size={13} />
                Restaurar ({selecionadosNaTab.length})
              </button>
              <button
                onClick={() => setModalConfirm({ tipo: "selecionados" })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-destructive text-destructive-foreground rounded-md text-xs font-semibold hover:bg-destructive/90 transition-all shadow-sm"
              >
                <Trash2 size={13} />
                Eliminar ({selecionadosNaTab.length})
              </button>
            </div>
          )}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
            className="px-3 py-2.5 bg-card border border-border rounded-lg text-xs font-medium focus:ring-2 focus:ring-primary"
          >
            <option value="recente">Mais recentes primeiro</option>
            <option value="expira">A expirar primeiro</option>
          </select>
        </div>
      </div>

      {/* List / Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {itensDaTab.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 bg-muted/40 border-b border-border text-xs text-muted-foreground font-semibold">
            <button onClick={toggleSelectAll} className="flex items-center gap-2 hover:text-foreground transition-colors">
              {todosTabSelecionados ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} />}
              <span>Selecionar todos ({itensDaTab.length})</span>
            </button>
            <span>Ações</span>
          </div>
        )}

        <div className="divide-y divide-border">
          {itensDaTab.map((item) => {
            const selected = selecionados.has(item.id);
            return (
              <div
                key={item.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-3 transition-colors ${
                  selected ? "bg-primary/5" : "hover:bg-muted/20"
                }`}
              >
                <div className="flex items-start sm:items-center gap-3">
                  <button onClick={() => toggleSelect(item.id)} className="mt-0.5 sm:mt-0 text-muted-foreground hover:text-primary transition-colors">
                    {selected ? <CheckSquare size={18} className="text-primary" /> : <Square size={18} />}
                  </button>
                  <div className={`p-2.5 rounded-xl ${categoryColor[item.categoria]}`}>
                    {item.categoria === "empresas" ? <Building2 size={18} /> : item.categoria === "usuarios" ? <Users size={18} /> : <FileText size={18} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">{item.nome}</p>
                      <ExpiryBadge days={item.expiresIn} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.detalhe}</p>
                    <p className="text-[11px] text-muted-foreground/80 mt-1">
                      Eliminado por <strong>{item.apagadoPor}</strong> em {new Date(item.apagadoEm).toLocaleDateString("pt-AO")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => restaurar([item.id])}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary/10 text-secondary border border-secondary/20 rounded-lg text-xs font-semibold hover:bg-secondary/20 transition-all"
                  >
                    <RotateCcw size={13} />
                    Restaurar
                  </button>
                  <button
                    onClick={() => setModalConfirm({ tipo: "item", id: item.id, nome: item.nome })}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-xs font-semibold hover:bg-destructive/20 transition-all"
                  >
                    <Trash2 size={13} />
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {itensDaTab.length === 0 && (
          <div className="text-center py-16">
            <Trash2 className="mx-auto mb-3 text-muted-foreground opacity-40" size={40} />
            <p className="text-muted-foreground font-semibold">Nenhum item na lixeira em {activeTab}</p>
          </div>
        )}
      </div>

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
              <button onClick={() => setModalConfirm(null)} className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">{modalInfo.body}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setModalConfirm(null)}
                  className="flex-1 px-4 py-3 bg-muted text-foreground rounded-lg font-semibold hover:bg-muted/80 transition-all text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={modalInfo.onConfirm}
                  className="flex-1 px-4 py-3 bg-destructive text-destructive-foreground rounded-lg font-semibold hover:bg-destructive/90 transition-all shadow-lg shadow-destructive/20 text-sm"
                >
                  Eliminar Definitivamente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
