import { Upload, Eye, Palette, FileText, Save } from "lucide-react";
import { useState } from "react";

export function Configuracoes() {
  const [corPrimaria, setCorPrimaria] = useState("#2563EB");
  const [template, setTemplate] = useState("moderno");

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          Configurações
        </h1>
        <p className="text-muted-foreground">
          Personalize as faturas da sua empresa
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personalização Visual */}
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              <Palette className="inline mr-2" size={20} />
              Aparência
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Logotipo da Empresa
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                    <Upload className="text-muted-foreground" size={24} />
                  </div>
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all text-sm">
                    Upload Logo
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Cor Primária
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={corPrimaria}
                    onChange={(e) => setCorPrimaria(e.target.value)}
                    className="w-16 h-12 rounded-lg border border-border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={corPrimaria}
                    onChange={(e) => setCorPrimaria(e.target.value)}
                    className="flex-1 px-4 py-2 bg-input-background border border-border rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Template da Fatura
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['moderno', 'classico', 'minimalista'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTemplate(t)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        template === t
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="aspect-[3/4] bg-muted rounded mb-2"></div>
                      <p className="text-xs font-medium capitalize">{t}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              <FileText className="inline mr-2" size={20} />
              Textos Personalizados
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Cabeçalho Personalizado
                </label>
                <textarea
                  placeholder="Texto que aparecerá no topo da fatura..."
                  rows={2}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Rodapé Personalizado
                </label>
                <textarea
                  placeholder="Texto que aparecerá no rodapé da fatura..."
                  rows={2}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Mensagem Padrão
                </label>
                <textarea
                  placeholder="Mensagem padrão em todas as faturas..."
                  rows={3}
                  defaultValue="Obrigado pela preferência!"
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Séries de Faturação
            </h3>

            <div className="space-y-3">
              {[
                { prefixo: 'FT', nome: 'Fatura', tipo: 'Fatura' },
                { prefixo: 'FR', nome: 'Fatura Recibo', tipo: 'Fatura Recibo' },
                { prefixo: 'NC', nome: 'Nota de Crédito', tipo: 'Nota de Crédito' },
              ].map((serie) => (
                <div key={serie.prefixo} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-semibold text-foreground">{serie.nome}</p>
                    <p className="text-sm text-muted-foreground">Prefixo: {serie.prefixo}</p>
                  </div>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                    Ativo
                  </span>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/90 transition-all text-sm">
              + Nova Série
            </button>
          </div>

          <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
            <Save size={20} />
            Salvar Configurações
          </button>
        </div>

        {/* Pré-visualização */}
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
                <Eye className="inline mr-2" size={20} />
                Pré-visualização
              </h3>
            </div>

            <div className="bg-white border-2 border-border rounded-lg p-8 shadow-sm">
              {/* Mock Invoice Preview */}
              <div className="border-b-2 pb-4 mb-4" style={{ borderColor: corPrimaria }}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="w-16 h-16 bg-muted rounded-lg mb-2"></div>
                    <h4 className="font-bold text-sm">SUA EMPRESA LDA</h4>
                    <p className="text-xs text-muted-foreground">NIF: 5000000000</p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-2xl font-bold" style={{ color: corPrimaria }}>FATURA</h2>
                    <p className="text-xs text-muted-foreground mt-1">FT-2026/001</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold mb-1">Cliente:</p>
                <p className="text-xs">Tech Solutions Lda</p>
                <p className="text-xs text-muted-foreground">NIF: 5000123456</p>
              </div>

              <div className="border border-border rounded-lg overflow-hidden mb-4">
                <div className="bg-muted px-3 py-2">
                  <div className="grid grid-cols-12 gap-2 text-xs font-semibold">
                    <div className="col-span-6">Descrição</div>
                    <div className="col-span-2 text-right">Qtd</div>
                    <div className="col-span-2 text-right">Preço</div>
                    <div className="col-span-2 text-right">Total</div>
                  </div>
                </div>
                <div className="px-3 py-2">
                  <div className="grid grid-cols-12 gap-2 text-xs">
                    <div className="col-span-6">Consultoria em TI</div>
                    <div className="col-span-2 text-right">1</div>
                    <div className="col-span-2 text-right">50.000</div>
                    <div className="col-span-2 text-right">50.000</div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>50.000 Kz</span>
                </div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-muted-foreground">IVA (14%)</span>
                  <span>7.000 Kz</span>
                </div>
                <div className="flex justify-between font-bold" style={{ color: corPrimaria }}>
                  <span>TOTAL</span>
                  <span>57.000 Kz</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t text-center">
                <p className="text-xs text-muted-foreground">Obrigado pela preferência!</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Certificado AGT nº 12345/2026 | Assinado digitalmente
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
