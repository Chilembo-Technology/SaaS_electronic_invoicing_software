import { Plus, Search, Edit2, Trash2, Building2, User, X } from "lucide-react";
import { useState } from "react";

interface Cliente {
  id: number;
  nome: string;
  nif: string;
  tipo: "Individual" | "Empresarial";
  telefone: string;
  email: string;
}

const clientesIniciais: Cliente[] = [
  { id: 1, nome: "António Silva", nif: "5417896523", tipo: "Individual", telefone: "+244 923 456 789", email: "antonio@email.com" },
  { id: 2, nome: "Tech Solutions Lda", nif: "5000123456", tipo: "Empresarial", telefone: "+244 923 111 222", email: "contato@techsolutions.ao" },
  { id: 3, nome: "Maria Costa", nif: "5417896524", tipo: "Individual", telefone: "+244 923 333 444", email: "maria@email.com" },
  { id: 4, nome: "Global Import & Export", nif: "5000987654", tipo: "Empresarial", telefone: "+244 923 555 666", email: "info@globalimport.ao" },
];

import { useDocumentTitle } from "../../hooks/useDocumentTitle";

export function Clientes() {
  useDocumentTitle("Clientes");

  const [clientes, setClientes] = useState<Cliente[]>(clientesIniciais);
  const [modalAberto, setModalAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const [novoCliente, setNovoCliente] = useState({
    nome: "",
    nif: "",
    tipo: "Individual" as "Individual" | "Empresarial",
    telefone: "",
    email: "",
    endereco: "",
  });

  const clientesFiltrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    c.nif.includes(busca) ||
    c.email.toLowerCase().includes(busca.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const novoId = Math.max(...clientes.map(c => c.id), 0) + 1;
    setClientes([...clientes, { ...novoCliente, id: novoId }]);
    setModalAberto(false);
    setNovoCliente({
      nome: "",
      nif: "",
      tipo: "Individual",
      telefone: "",
      email: "",
      endereco: "",
    });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Clientes
          </h1>
          <p className="text-muted-foreground">
            Gerencie seus clientes cadastrados
          </p>
        </div>
        <button
          onClick={() => setModalAberto(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          Novo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome, NIF ou email..."
          className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  NIF
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Telefone
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {clientesFiltrados.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${cliente.tipo === "Empresarial" ? "bg-primary/10" : "bg-secondary/10"}`}>
                        {cliente.tipo === "Empresarial" ? (
                          <Building2 className="text-primary" size={20} />
                        ) : (
                          <User className="text-secondary" size={20} />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{cliente.nome}</p>
                        <p className="text-sm text-muted-foreground">{cliente.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm">{cliente.nif}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                      cliente.tipo === "Empresarial"
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary/10 text-secondary"
                    }`}>
                      {cliente.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {cliente.telefone}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <Edit2 size={16} className="text-muted-foreground" />
                      </button>
                      <button className="p-2 hover:bg-destructive/10 rounded-lg transition-colors">
                        <Trash2 size={16} className="text-destructive" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {clientesFiltrados.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum cliente encontrado</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
                Novo Cliente
              </h2>
              <button
                onClick={() => setModalAberto(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Tipo de Cliente
                  </label>
                  <div className="flex gap-4">
                    <label className="flex-1 flex items-center gap-3 p-4 border-2 border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                      <input
                        type="radio"
                        name="tipo"
                        value="Individual"
                        checked={novoCliente.tipo === "Individual"}
                        onChange={(e) => setNovoCliente({ ...novoCliente, tipo: e.target.value as any })}
                        className="w-4 h-4"
                      />
                      <User size={20} />
                      <span className="font-medium">Individual</span>
                    </label>
                    <label className="flex-1 flex items-center gap-3 p-4 border-2 border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                      <input
                        type="radio"
                        name="tipo"
                        value="Empresarial"
                        checked={novoCliente.tipo === "Empresarial"}
                        onChange={(e) => setNovoCliente({ ...novoCliente, tipo: e.target.value as any })}
                        className="w-4 h-4"
                      />
                      <Building2 size={20} />
                      <span className="font-medium">Empresarial</span>
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Nome Completo / Razão Social *
                  </label>
                  <input
                    type="text"
                    value={novoCliente.nome}
                    onChange={(e) => setNovoCliente({ ...novoCliente, nome: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    NIF *
                  </label>
                  <input
                    type="text"
                    value={novoCliente.nif}
                    onChange={(e) => setNovoCliente({ ...novoCliente, nif: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    value={novoCliente.telefone}
                    onChange={(e) => setNovoCliente({ ...novoCliente, telefone: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={novoCliente.email}
                    onChange={(e) => setNovoCliente({ ...novoCliente, email: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Endereço
                  </label>
                  <textarea
                    value={novoCliente.endereco}
                    onChange={(e) => setNovoCliente({ ...novoCliente, endereco: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                  />
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
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
