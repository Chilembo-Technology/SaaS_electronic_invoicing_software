import { Upload, Eye, Palette, FileText, Save, Check, Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

const presetCores = ["#2563EB", "#10B981", "#8B5CF6", "#EF4444", "#F97316", "#0EA5E9", "#EC4899", "#0F172A"];

const templates = [
  {
    id: "moderno",
    label: "Moderno",
    preview: (cor: string) => (
      <div className="aspect-[3/4] rounded overflow-hidden border border-border bg-white text-[5px] flex flex-col">
        <div className="h-4 flex items-center px-2 gap-1" style={{ backgroundColor: cor }}>
          <div className="w-3 h-2 bg-white/40 rounded-sm" />
          <div className="flex-1 h-1 bg-white/30 rounded" />
        </div>
        <div className="flex-1 p-2 space-y-1">
          <div className="h-1 bg-gray-200 rounded w-3/4" />
          <div className="h-1 bg-gray-100 rounded w-1/2" />
          <div className="mt-2 h-5 bg-gray-50 border border-gray-200 rounded" />
          <div className="flex justify-end mt-1">
            <div className="w-8 h-2 rounded" style={{ backgroundColor: cor, opacity: 0.8 }} />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "classico",
    label: "Clássico",
    preview: (cor: string) => (
      <div className="aspect-[3/4] rounded overflow-hidden border border-border bg-white text-[5px] flex flex-col">
        <div className="p-2 border-b-2" style={{ borderColor: cor }}>
          <div className="flex justify-between items-start">
            <div className="w-4 h-4 bg-gray-200 rounded" />
            <div className="text-right space-y-0.5">
              <div className="h-1.5 w-8 rounded font-bold" style={{ backgroundColor: cor }} />
              <div className="h-0.5 bg-gray-200 rounded w-6 ml-auto" />
            </div>
          </div>
        </div>
        <div className="flex-1 p-2 space-y-1">
          <div className="h-0.5 bg-gray-200 rounded w-full" />
          <div className="h-0.5 bg-gray-100 rounded w-2/3" />
          <div className="mt-2 space-y-0.5">
            <div className="h-0.5 bg-gray-200 rounded" />
            <div className="h-0.5 bg-gray-200 rounded" />
          </div>
          <div className="flex justify-end mt-1">
            <div className="h-1 w-8 rounded-sm" style={{ backgroundColor: cor, opacity: 0.9 }} />
          </div>
        </div>
        <div className="h-2 border-t border-gray-200 flex items-center justify-center">
          <div className="h-0.5 w-16 bg-gray-200 rounded" />
        </div>
      </div>
    ),
  },
  {
    id: "minimalista",
    label: "Minimal",
    preview: (cor: string) => (
      <div className="aspect-[3/4] rounded overflow-hidden border border-border bg-white text-[5px] flex flex-col p-2 space-y-1.5">
        <div className="flex justify-between">
          <div className="h-0.5 w-10 bg-gray-900 rounded" />
          <div className="h-1 w-6 rounded" style={{ backgroundColor: cor }} />
        </div>
        <div className="h-px bg-gray-900 opacity-20" />
        <div className="space-y-0.5">
          <div className="h-0.5 bg-gray-200 rounded w-3/4" />
          <div className="h-0.5 bg-gray-100 rounded w-1/2" />
        </div>
        <div className="flex-1 space-y-0.5 mt-1">
          <div className="h-0.5 bg-gray-200 rounded" />
          <div className="h-0.5 bg-gray-100 rounded" />
          <div className="h-0.5 bg-gray-200 rounded" />
        </div>
        <div className="h-px" style={{ backgroundColor: cor, opacity: 0.4 }} />
        <div className="flex justify-end">
          <div className="h-0.5 w-8 bg-gray-900 rounded" />
        </div>
      </div>
    ),
  },
];

const seriesIniciais = [
  { prefixo: "FT", nome: "Fatura", sequencia: 42, ativa: true },
  { prefixo: "FR", nome: "Fatura Recibo", sequencia: 12, ativa: true },
  { prefixo: "NC", nome: "Nota de Crédito", sequencia: 5, ativa: true },
  { prefixo: "ND", nome: "Nota de Débito", sequencia: 0, ativa: false },
];

import { useDocumentTitle } from "../../hooks/useDocumentTitle";

export function Configuracoes() {
  useDocumentTitle("Configurações");

  const [corPrimaria, setCorPrimaria] = useState("#2563EB");
  const [template, setTemplate] = useState("moderno");
  const [cabecalho, setCabecalho] = useState("");
  const [rodape, setRodape] = useState("NIF: 5000000000 | Obrigado pela preferência!");
  const [mensagem, setMensagem] = useState("Obrigado pela preferência!");
  const [series] = useState(seriesIniciais);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Configurações
          </h1>
          <p className="text-muted-foreground">Personalize a identidade visual das suas faturas</p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 px-4 py-2 bg-secondary/10 border border-secondary/25 text-secondary rounded-xl text-sm font-semibold">
            <Check size={16} />
            Guardado
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left column — settings */}
        <div className="lg:col-span-3 space-y-5">

          {/* Logotipo */}
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Upload size={18} className="text-muted-foreground" />
              <h3 className="text-base font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                Logotipo
              </h3>
            </div>
            <div className="flex items-center gap-5">
              <div className="w-24 h-24 bg-muted rounded-xl flex items-center justify-center border-2 border-dashed border-border flex-shrink-0 overflow-hidden">
                <div className="text-center">
                  <Upload className="text-muted-foreground mx-auto mb-1" size={20} />
                  <p className="text-xs text-muted-foreground">Logo</p>
                </div>
              </div>
              <div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all text-sm shadow-sm shadow-primary/20 mb-2">
                  <Upload size={15} />
                  Carregar Logotipo
                </button>
                <p className="text-xs text-muted-foreground">PNG ou JPG, máximo 2MB. Recomendado 400×200px.</p>
              </div>
            </div>
          </div>

          {/* Cor + Presets */}
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Palette size={18} className="text-muted-foreground" />
              <h3 className="text-base font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                Cor da Marca
              </h3>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <input
                type="color"
                value={corPrimaria}
                onChange={(e) => setCorPrimaria(e.target.value)}
                className="w-14 h-12 rounded-lg border border-border cursor-pointer flex-shrink-0"
              />
              <input
                type="text"
                value={corPrimaria}
                onChange={(e) => {
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) setCorPrimaria(e.target.value);
                }}
                className="flex-1 px-4 py-2.5 bg-input border border-border rounded-lg font-mono text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                maxLength={7}
              />
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Cores predefinidas</p>
              <div className="flex gap-2 flex-wrap">
                {presetCores.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCorPrimaria(c)}
                    className="w-9 h-9 rounded-lg border-2 transition-all hover:scale-110"
                    style={{
                      backgroundColor: c,
                      borderColor: corPrimaria === c ? "white" : "transparent",
                      outline: corPrimaria === c ? `3px solid ${c}` : "none",
                      outlineOffset: "2px",
                    }}
                    title={c}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Template */}
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Eye size={18} className="text-muted-foreground" />
              <h3 className="text-base font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                Template da Fatura
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`group p-3 rounded-xl border-2 transition-all text-left ${
                    template === t.id
                      ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                      : "border-border hover:border-primary/40 hover:bg-muted/30"
                  }`}
                >
                  {t.preview(corPrimaria)}
                  <div className="flex items-center justify-between mt-2.5">
                    <p className="text-xs font-semibold text-foreground">{t.label}</p>
                    {template === t.id && (
                      <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                        <Check className="text-white" size={10} />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Textos */}
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <FileText size={18} className="text-muted-foreground" />
              <h3 className="text-base font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                Textos Personalizados
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Cabeçalho
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">— aparece no topo</span>
                </label>
                <textarea
                  value={cabecalho}
                  onChange={(e) => setCabecalho(e.target.value)}
                  placeholder="Ex: Válido para efeitos fiscais. Documento emitido por sistema certificado."
                  rows={2}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Rodapé
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">— aparece no final</span>
                </label>
                <textarea
                  value={rodape}
                  onChange={(e) => setRodape(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Mensagem padrão
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">— em todas as faturas</span>
                </label>
                <textarea
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Séries */}
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                Séries de Faturação
              </h3>
              <button className="flex items-center gap-2 px-3 py-2 bg-secondary/10 text-secondary border border-secondary/20 rounded-lg font-semibold hover:bg-secondary/20 transition-all text-xs">
                <Plus size={14} />
                Nova Série
              </button>
            </div>
            <div className="space-y-2.5">
              {series.map((s) => (
                <div key={s.prefixo} className="flex items-center gap-3 p-3.5 bg-muted/30 rounded-xl border border-border">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-foreground">{s.prefixo}</span>
                      <span className="text-sm text-muted-foreground">— {s.nome}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Próximo número: <span className="font-mono font-semibold">{s.prefixo}-2026/{String(s.sequencia + 1).padStart(3, "0")}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      s.ativa ? "bg-secondary/10 text-secondary" : "bg-muted text-muted-foreground"
                    }`}>
                      {s.ativa ? "Ativa" : "Inativa"}
                    </span>
                    <button className="p-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground">
                      <Pencil size={14} />
                    </button>
                    <button className="p-1.5 hover:bg-destructive/10 rounded-md transition-colors text-muted-foreground hover:text-destructive">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all shadow-lg shadow-primary/25 disabled:opacity-70"
          >
            {saving ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                A guardar...
              </>
            ) : saved ? (
              <>
                <Check size={18} />
                Guardado!
              </>
            ) : (
              <>
                <Save size={18} />
                Guardar Configurações
              </>
            )}
          </button>
        </div>

        {/* Right column — live preview */}
        <div className="lg:col-span-2">
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm sticky top-6">
            <div className="flex items-center gap-2 mb-5">
              <Eye size={18} className="text-muted-foreground" />
              <h3 className="text-base font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                Pré-visualização
              </h3>
              <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                Actualiza em tempo real
              </span>
            </div>

            {/* Invoice preview */}
            <div className="bg-white border border-border rounded-xl p-6 shadow-sm text-[11px]">
              {/* Header bar */}
              {template === "moderno" && (
                <div className="h-2 rounded-full mb-4" style={{ backgroundColor: corPrimaria }} />
              )}

              <div className={`flex items-start justify-between mb-5 ${
                template === "classico" ? "pb-4 border-b-2" : ""
              }`}
              style={template === "classico" ? { borderColor: corPrimaria } : {}}>
                <div>
                  <div className="w-12 h-10 bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-gray-400">LOGO</span>
                  </div>
                  <p className="font-bold text-gray-800 text-xs">SUA EMPRESA LDA</p>
                  <p className="text-gray-400">NIF: 5000000000</p>
                  <p className="text-gray-400">Luanda, Angola</p>
                </div>
                <div className="text-right">
                  <h2
                    className="text-xl font-bold"
                    style={{ color: corPrimaria, fontFamily: "var(--font-display)" }}
                  >
                    FATURA
                  </h2>
                  <p className="text-gray-400 mt-0.5">FT-2026/001</p>
                  <p className="text-gray-400">01/07/2026</p>
                </div>
              </div>

              {cabecalho && (
                <div className="mb-3 p-2 bg-gray-50 rounded text-gray-500 text-[9px]">{cabecalho}</div>
              )}

              <div className="mb-4 p-2.5 bg-gray-50 rounded-lg">
                <p className="font-semibold text-gray-500 mb-1">Faturado a:</p>
                <p className="font-bold text-gray-800">Tech Solutions Lda</p>
                <p className="text-gray-400">NIF: 5000123456</p>
              </div>

              <table className="w-full mb-4">
                <thead>
                  <tr style={{ backgroundColor: `${corPrimaria}15` }}>
                    <th className="px-2 py-1.5 text-left text-gray-600 font-semibold">Descrição</th>
                    <th className="px-2 py-1.5 text-right text-gray-600 font-semibold">Qtd</th>
                    <th className="px-2 py-1.5 text-right text-gray-600 font-semibold">Preço</th>
                    <th className="px-2 py-1.5 text-right text-gray-600 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="px-2 py-1.5 text-gray-700">Consultoria em TI</td>
                    <td className="px-2 py-1.5 text-right text-gray-600">2</td>
                    <td className="px-2 py-1.5 text-right text-gray-600">50.000</td>
                    <td className="px-2 py-1.5 text-right font-semibold text-gray-800">100.000</td>
                  </tr>
                </tbody>
              </table>

              <div className="border-t border-gray-100 pt-3 space-y-1">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span><span>100.000 Kz</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>IVA (14%)</span><span>14.000 Kz</span>
                </div>
                <div className="flex justify-between font-bold text-sm pt-1 mt-1 border-t border-gray-200" style={{ color: corPrimaria }}>
                  <span>TOTAL</span><span>114.000 Kz</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 text-center text-gray-400">
                <p>{mensagem || "Obrigado pela preferência!"}</p>
                {rodape && <p className="mt-1">{rodape}</p>}
                <p className="mt-2 text-[9px]">Certificado AGT nº 12345/2026 · Assinado digitalmente</p>
              </div>

              {template === "moderno" && (
                <div className="mt-3 h-1.5 rounded-full" style={{ backgroundColor: `${corPrimaria}40` }} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
