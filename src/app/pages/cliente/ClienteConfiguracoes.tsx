import { useState } from "react";
import {
  Building2,
  User,
  Lock,
  Bell,
  Palette,
  Upload,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";

type Tab = "empresa" | "perfil" | "seguranca" | "notificacoes" | "aparencia";

import { useDocumentTitle } from "../../../hooks/useDocumentTitle";

export function ClienteConfiguracoes() {
  useDocumentTitle("Configurações do cliente");

  const [activeTab, setActiveTab] = useState<Tab>("empresa");
  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [logoColor, setLogoColor] = useState("#2563EB");

  const [empresa, setEmpresa] = useState({
    nome: "TechLuanda Lda.",
    nif: "5417083421",
    email: "geral@techluanda.co.ao",
    telefone: "+244 923 456 789",
    endereco: "Rua Comandante Gika, 45",
    municipio: "Luanda",
    provincia: "Luanda",
    actividade: "Tecnologia de Informação",
  });

  const [perfil, setPerfil] = useState({
    nome: "João Mendes",
    email: "joao.mendes@techluanda.co.ao",
    cargo: "Operador",
    telefone: "+244 912 345 678",
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "empresa", label: "Empresa", icon: Building2 },
    { key: "perfil", label: "Meu Perfil", icon: User },
    { key: "seguranca", label: "Segurança", icon: Lock },
    { key: "notificacoes", label: "Notificações", icon: Bell },
    { key: "aparencia", label: "Aparência", icon: Palette },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Configurações
          </h1>
          <p className="text-muted-foreground">Gerencie os dados da sua empresa e preferências</p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 px-4 py-2 bg-secondary/10 border border-secondary/30 text-secondary rounded-lg text-sm font-semibold">
            <CheckCircle size={16} />
            Guardado com sucesso
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs sidebar */}
        <aside className="lg:w-56 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all text-sm font-medium ${
                  activeTab === key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">

          {/* Empresa */}
          {activeTab === "empresa" && (
            <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1" style={{ fontFamily: "var(--font-display)" }}>
                  Dados da Empresa
                </h2>
                <p className="text-sm text-muted-foreground">Informações que aparecem nas faturas emitidas</p>
              </div>

              {/* Logo */}
              <div className="flex items-center gap-6 p-5 bg-muted/40 rounded-xl border border-border">
                <div
                  className="w-20 h-20 rounded-xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
                  style={{ backgroundColor: logoColor }}
                >
                  TL
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">Logo da Empresa</p>
                  <p className="text-xs text-muted-foreground mb-3">PNG, JPG até 2MB. Recomendado 200×200px</p>
                  <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
                    <Upload size={15} />
                    Carregar Logotipo
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-foreground mb-2">Denominação Social *</label>
                  <input
                    type="text"
                    value={empresa.nome}
                    onChange={(e) => setEmpresa({ ...empresa, nome: e.target.value })}
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">NIF *</label>
                  <input
                    type="text"
                    value={empresa.nif}
                    readOnly
                    className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-sm text-muted-foreground cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground mt-1">O NIF não pode ser alterado</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Actividade Económica</label>
                  <input
                    type="text"
                    value={empresa.actividade}
                    onChange={(e) => setEmpresa({ ...empresa, actividade: e.target.value })}
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Email</label>
                  <input
                    type="email"
                    value={empresa.email}
                    onChange={(e) => setEmpresa({ ...empresa, email: e.target.value })}
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Telefone</label>
                  <input
                    type="tel"
                    value={empresa.telefone}
                    onChange={(e) => setEmpresa({ ...empresa, telefone: e.target.value })}
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-foreground mb-2">Endereço</label>
                  <input
                    type="text"
                    value={empresa.endereco}
                    onChange={(e) => setEmpresa({ ...empresa, endereco: e.target.value })}
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Município</label>
                  <input
                    type="text"
                    value={empresa.municipio}
                    onChange={(e) => setEmpresa({ ...empresa, municipio: e.target.value })}
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Província</label>
                  <select
                    value={empresa.provincia}
                    onChange={(e) => setEmpresa({ ...empresa, provincia: e.target.value })}
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  >
                    {["Luanda","Benguela","Huíla","Malanje","Bié","Moxico","Cuando Cubango","Cunene","Namibe","Zaire","Uíge","Kwanza Norte","Kwanza Sul","Lunda Norte","Lunda Sul","Cabinda","Huambo","Bengo"].map(p => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 text-sm"
                >
                  <Save size={16} />
                  Guardar Alterações
                </button>
              </div>
            </div>
          )}

          {/* Perfil */}
          {activeTab === "perfil" && (
            <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1" style={{ fontFamily: "var(--font-display)" }}>
                  Meu Perfil
                </h2>
                <p className="text-sm text-muted-foreground">Dados do utilizador autenticado</p>
              </div>

              <div className="flex items-center gap-5 p-5 bg-muted/40 rounded-xl border border-border">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                  JM
                </div>
                <div>
                  <p className="font-semibold text-foreground">{perfil.nome}</p>
                  <p className="text-sm text-muted-foreground">{perfil.cargo} · TechLuanda Lda.</p>
                  <button className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg text-xs font-medium hover:bg-muted transition-colors">
                    <Upload size={12} />
                    Alterar foto
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Nome Completo</label>
                  <input
                    type="text"
                    value={perfil.nome}
                    onChange={(e) => setPerfil({ ...perfil, nome: e.target.value })}
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Cargo</label>
                  <input
                    type="text"
                    value={perfil.cargo}
                    readOnly
                    className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-sm text-muted-foreground cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Email</label>
                  <input
                    type="email"
                    value={perfil.email}
                    onChange={(e) => setPerfil({ ...perfil, email: e.target.value })}
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Telefone</label>
                  <input
                    type="tel"
                    value={perfil.telefone}
                    onChange={(e) => setPerfil({ ...perfil, telefone: e.target.value })}
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 text-sm"
                >
                  <Save size={16} />
                  Guardar Alterações
                </button>
              </div>
            </div>
          )}

          {/* Segurança */}
          {activeTab === "seguranca" && (
            <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1" style={{ fontFamily: "var(--font-display)" }}>
                  Segurança
                </h2>
                <p className="text-sm text-muted-foreground">Altere a sua palavra-passe</p>
              </div>
              <div className="max-w-md space-y-4">
                {[
                  { label: "Palavra-passe Atual", placeholder: "••••••••" },
                  { label: "Nova Palavra-passe", placeholder: "Mínimo 8 caracteres" },
                  { label: "Confirmar Nova Palavra-passe", placeholder: "Repita a nova palavra-passe" },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="block text-sm font-semibold text-foreground mb-2">{field.label}</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-3 pr-12 bg-input border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                ))}
                <div className="pt-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 text-sm"
                  >
                    <Save size={16} />
                    Alterar Palavra-passe
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notificações */}
          {activeTab === "notificacoes" && (
            <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1" style={{ fontFamily: "var(--font-display)" }}>
                  Notificações
                </h2>
                <p className="text-sm text-muted-foreground">Configure quando e como receber alertas</p>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Fatura emitida", desc: "Receber email ao emitir uma fatura", default: true },
                  { label: "Alerta de IVA", desc: "Lembrete 5 dias antes da entrega do IVA", default: true },
                  { label: "Limite de faturação", desc: "Aviso ao atingir 80% do limite do plano", default: true },
                  { label: "Relatório mensal", desc: "Resumo financeiro no início de cada mês", default: false },
                  { label: "Novidades da plataforma", desc: "Actualizações e novas funcionalidades", default: false },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-4 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                    <button
                      className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
                        item.default ? "bg-primary" : "bg-muted"
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                          item.default ? "translate-x-7" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 text-sm"
                >
                  <Save size={16} />
                  Guardar Preferências
                </button>
              </div>
            </div>
          )}

          {/* Aparência */}
          {activeTab === "aparencia" && (
            <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1" style={{ fontFamily: "var(--font-display)" }}>
                  Aparência das Faturas
                </h2>
                <p className="text-sm text-muted-foreground">Personalize o visual das faturas emitidas</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-3">Cor Primária da Fatura</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={logoColor}
                      onChange={(e) => setLogoColor(e.target.value)}
                      className="w-12 h-12 rounded-lg border border-border cursor-pointer"
                    />
                    <div>
                      <p className="text-sm font-mono text-foreground">{logoColor.toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Cabeçalho e destaques</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    {["#2563EB", "#10B981", "#8B5CF6", "#EF4444", "#F97316", "#0F172A"].map((c) => (
                      <button
                        key={c}
                        onClick={() => setLogoColor(c)}
                        className="w-8 h-8 rounded-lg border-2 transition-all"
                        style={{
                          backgroundColor: c,
                          borderColor: logoColor === c ? "#fff" : "transparent",
                          outline: logoColor === c ? `2px solid ${c}` : "none",
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-3">Pré-visualização</label>
                  <div className="border border-border rounded-lg overflow-hidden shadow-sm">
                    <div className="h-10 flex items-center px-4 gap-2" style={{ backgroundColor: logoColor }}>
                      <div className="w-5 h-5 bg-white/30 rounded" />
                      <span className="text-white text-xs font-bold">FATURA ELETRÓNICA</span>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="h-2 bg-muted rounded w-3/4" />
                      <div className="h-2 bg-muted rounded w-1/2" />
                      <div className="mt-3 flex gap-2">
                        <div className="h-2 flex-1 bg-muted rounded" />
                        <div className="h-2 flex-1 rounded" style={{ backgroundColor: `${logoColor}30` }} />
                      </div>
                      <div className="flex gap-2">
                        <div className="h-2 flex-1 bg-muted rounded" />
                        <div className="h-2 flex-1 rounded" style={{ backgroundColor: `${logoColor}20` }} />
                      </div>
                      <div className="mt-2 flex justify-end">
                        <div className="h-5 w-20 rounded text-center flex items-center justify-center" style={{ backgroundColor: logoColor }}>
                          <span className="text-white text-[8px] font-bold">TOTAL</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Texto de Rodapé da Fatura</label>
                <textarea
                  rows={3}
                  placeholder="Ex: Obrigado pela preferência! Pagamentos em 30 dias. IBAN: AO06000400..."
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                  defaultValue="TechLuanda Lda. — NIF: 5417083421 — Obrigado pela sua preferência!"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 text-sm"
                >
                  <Save size={16} />
                  Guardar Aparência
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
