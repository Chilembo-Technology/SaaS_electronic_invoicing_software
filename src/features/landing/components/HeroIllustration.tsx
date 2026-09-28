import { BadgeCheck, FileCheck2, TrendingUp } from "lucide-react";

interface InvoiceLine {
  label: string;
  qty: string;
  unit: string;
  total: string;
}

const invoiceLines: InvoiceLine[] = [
  { label: "Licença anual — Fatura Mais", qty: "1", unit: "180.000", total: "180.000" },
  { label: "Instalação e formação de equipa", qty: "1", unit: "45.000", total: "45.000" },
  { label: "Suporte premium (mensal)", qty: "12", unit: "3.500", total: "42.000" },
];

const totals = [
  { label: "Subtotal", value: "267.000 Kz", emphasis: false },
  { label: "IVA (14%)", value: "37.380 Kz", emphasis: false },
  { label: "Retenção na fonte (6,5%)", value: "− 17.355 Kz", emphasis: false },
  { label: "Total a pagar", value: "287.025 Kz", emphasis: true },
];

/**
 * Imagem ilustrativa do Hero: maquete de uma fatura eletrónica construída
 * apenas com markup/CSS (sem ficheiros de imagem externos, sem placeholders
 * quebrados e sem dependência de licenças de terceiros).
 */
export function HeroIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* Elementos decorativos */}
      <div className="absolute -right-6 -top-8 h-40 w-40 rounded-full bg-brand-green/20 blur-3xl" />
      <div className="absolute -bottom-10 -left-8 h-44 w-44 rounded-full bg-brand-teal/25 blur-3xl" />

      {/* Maquete da fatura */}
      <div className="landing-invoice-shadow landing-fade-up relative z-10 overflow-hidden rounded-2xl border border-border bg-white">
        <div className="landing-navy-band flex items-center justify-between gap-3 px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
              Fatura eletrónica
            </p>
            <p className="text-lg font-bold text-white">FT 2026/0342</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold text-white ring-1 ring-white/25">
            <BadgeCheck size={13} />
            Validada pela AGT
          </span>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex items-center justify-between border-b border-dashed border-border pb-3 text-xs">
            <div>
              <p className="font-bold text-foreground">Chilembo Technology, Lda</p>
              <p className="text-muted-foreground">NIF 5000000000 · Luanda</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-foreground">Cliente</p>
              <p className="text-muted-foreground">Kianda Logística</p>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            <span className="col-span-6">Descrição</span>
            <span className="col-span-2 text-center">Qtd.</span>
            <span className="col-span-4 text-right">Valor</span>
          </div>

          {invoiceLines.map((line) => (
            <div key={line.label} className="grid grid-cols-12 items-center gap-1 text-xs">
              <span className="col-span-6 truncate text-foreground">{line.label}</span>
              <span className="col-span-2 text-center text-muted-foreground">{line.qty}</span>
              <span className="col-span-4 text-right font-medium text-foreground">
                {line.total}
              </span>
            </div>
          ))}

          <div className="space-y-1.5 border-t border-border pt-3">
            {totals.map((total) => (
              <div
                key={total.label}
                className={
                  total.emphasis
                    ? "flex items-center justify-between rounded-lg bg-brand-navy/5 px-2 py-1.5"
                    : "flex items-center justify-between px-2 text-xs"
                }
              >
                <span
                  className={
                    total.emphasis
                      ? "text-sm font-bold text-brand-navy"
                      : "text-muted-foreground"
                  }
                >
                  {total.label}
                </span>
                <span
                  className={
                    total.emphasis
                      ? "text-sm font-bold text-brand-navy"
                      : "font-medium text-foreground"
                  }
                >
                  {total.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selos flutuantes */}
      <div className="landing-float absolute -left-3 bottom-16 z-20 flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 shadow-lg sm:-left-8">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-green/15 text-brand-green">
          <FileCheck2 size={16} />
        </span>
        <div>
          <p className="text-[11px] font-bold text-foreground">SAF-T exportado</p>
          <p className="text-[10px] text-muted-foreground">Fevereiro 2026</p>
        </div>
      </div>

      <div className="landing-float landing-delay-2 absolute -right-2 top-24 z-20 flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 shadow-lg sm:-right-6">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-teal/15 text-brand-teal">
          <TrendingUp size={16} />
        </span>
        <div>
          <p className="text-[11px] font-bold text-foreground">−10h por semana</p>
          <p className="text-[10px] text-muted-foreground">em trabalho manual</p>
        </div>
      </div>
    </div>
  );
}
