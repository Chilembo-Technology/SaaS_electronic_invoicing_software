import { useState } from "react";
import { Check, Crown, Rocket, Star, AlertCircle, ArrowRight, Zap } from "lucide-react";

const planosData = [
  {
    id: "basico",
    nome: "Básico",
    descricao: "Para freelancers e pequenos negócios",
    precoMensal: 15000,
    precoAnual: 12000,
    icon: Star,
    cor: "text-secondary",
    bgCor: "bg-secondary/10",
    borderCor: "border-border",
    faturas: 50,
    usuarios: 1,
    features: [
      "Até 50 faturas/mês",
      "1 utilizador",
      "Relatórios básicos",
      "Suporte por email",
      "Exportação SAF-T",
    ],
    naoPossui: ["BI e relatórios avançados", "API de integração", "White-label"],
  },
  {
    id: "profissional",
    nome: "Profissional",
    descricao: "Para empresas em crescimento",
    precoMensal: 35000,
    precoAnual: 28000,
    icon: Rocket,
    cor: "text-primary",
    bgCor: "bg-primary/10",
    borderCor: "border-primary",
    faturas: 500,
    usuarios: 5,
    popular: true,
    features: [
      "Até 500 faturas/mês",
      "5 utilizadores",
      "Relatórios avançados + BI",
      "Suporte prioritário",
      "Exportação SAF-T",
      "Templates personalizados",
      "API de integração",
    ],
    naoPossui: ["White-label", "Gestor de conta dedicado"],
  },
  {
    id: "enterprise",
    nome: "Enterprise",
    descricao: "Para grandes organizações",
    precoMensal: 75000,
    precoAnual: 60000,
    icon: Crown,
    cor: "text-purple-600",
    bgCor: "bg-purple-500/10",
    borderCor: "border-purple-400",
    faturas: null,
    usuarios: null,
    features: [
      "Faturas ilimitadas",
      "Utilizadores ilimitados",
      "BI e Machine Learning",
      "Suporte 24/7 dedicado",
      "Exportação SAF-T",
      "Templates personalizados",
      "API completa + Webhooks",
      "White-label",
      "Gestor de conta dedicado",
    ],
    naoPossui: [],
  },
];

const planoAtualId = "profissional";
const faturasUsadas = 184;
const limiteAtual = 500;
const usoPct = (faturasUsadas / limiteAtual) * 100;

import { useDocumentTitle } from "../../hooks/useDocumentTitle";

export function Planos() {
  useDocumentTitle("Planos");

  const [anual, setAnual] = useState(false);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
          Planos e Preços
        </h1>
        <p className="text-muted-foreground text-lg">Escolha o plano ideal para o seu negócio</p>

        {/* Annual toggle */}
        <div className="inline-flex items-center gap-3 mt-4 p-1.5 bg-muted rounded-xl">
          <button
            onClick={() => setAnual(false)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              !anual ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setAnual(true)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              anual ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Anual
            <span className="px-2 py-0.5 bg-secondary text-secondary-foreground text-[10px] font-bold rounded-full">
              −20%
            </span>
          </button>
        </div>
      </div>

      {/* Current plan status */}
      <div className="max-w-2xl mx-auto bg-card border border-primary/20 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <Rocket className="text-primary" size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Plano Profissional — Ativo</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {faturasUsadas} de {limiteAtual} faturas utilizadas este mês
              </p>
            </div>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            usoPct >= 90 ? "bg-destructive/10 text-destructive" :
            usoPct >= 75 ? "bg-orange-500/10 text-orange-600" :
            "bg-secondary/10 text-secondary"
          }`}>
            {Math.round(usoPct)}% usado
          </span>
        </div>
        <div className="mt-3 w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              usoPct >= 90 ? "bg-destructive" : usoPct >= 75 ? "bg-orange-500" : "bg-secondary"
            }`}
            style={{ width: `${Math.min(usoPct, 100)}%` }}
          />
        </div>
        {usoPct >= 75 && (
          <div className="flex items-center gap-2 mt-3 text-xs text-orange-600 dark:text-orange-400">
            <AlertCircle size={13} />
            {usoPct >= 90
              ? "Quase no limite — considere fazer upgrade para não ser bloqueado."
              : "A aproximar do limite mensal. Faça upgrade para continuar a crescer."}
          </div>
        )}
      </div>

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {planosData.map((plano) => {
          const Icon = plano.icon;
          const isAtual = plano.id === planoAtualId;
          const preco = anual ? plano.precoAnual : plano.precoMensal;

          return (
            <div
              key={plano.id}
              className={`bg-card rounded-2xl border-2 shadow-md hover:shadow-xl transition-all relative flex flex-col ${
                plano.popular ? "border-primary" : "border-border"
              } ${isAtual ? "ring-2 ring-primary/30" : ""}`}
            >
              {plano.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="px-5 py-1.5 bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold rounded-full shadow-lg">
                    MAIS POPULAR
                  </span>
                </div>
              )}
              {isAtual && !plano.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="px-5 py-1.5 bg-card border border-border text-foreground text-xs font-bold rounded-full shadow">
                    SEU PLANO ATUAL
                  </span>
                </div>
              )}

              <div className="p-7 flex-1 flex flex-col">
                {/* Icon + name */}
                <div className={`p-3 ${plano.bgCor} rounded-xl w-fit mb-4`}>
                  <Icon className={plano.cor} size={26} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-1" style={{ fontFamily: "var(--font-display)" }}>
                  {plano.nome}
                </h3>
                <p className="text-sm text-muted-foreground mb-5">{plano.descricao}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-bold text-foreground">
                      {(preco / 1000).toFixed(0)}K
                    </span>
                    <span className="text-muted-foreground text-sm">Kz/{anual ? "mês" : "mês"}</span>
                  </div>
                  {anual && (
                    <p className="text-xs text-secondary mt-1 font-semibold">
                      Poupança de {((plano.precoMensal - plano.precoAnual) * 12 / 1000).toFixed(0)}K Kz/ano
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {anual ? "Faturado anualmente" : "Faturado mensalmente"}
                  </p>
                </div>

                {/* Limits highlight */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                  <div className="p-3 bg-muted/50 rounded-xl text-center">
                    <p className="text-lg font-bold text-foreground">
                      {plano.faturas ? plano.faturas : "∞"}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">faturas/mês</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-xl text-center">
                    <p className="text-lg font-bold text-foreground">
                      {plano.usuarios ? plano.usuarios : "∞"}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">utilizadores</p>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-6 flex-1">
                  {plano.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check className="text-secondary flex-shrink-0 mt-0.5" size={16} />
                      <span className="text-sm text-foreground">{f}</span>
                    </li>
                  ))}
                  {plano.naoPossui.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 opacity-40">
                      <div className="w-4 h-4 rounded-full border border-muted-foreground/40 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground line-through">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                    isAtual
                      ? "bg-primary/10 text-primary border border-primary/25 cursor-default"
                      : plano.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                      : "bg-muted text-foreground hover:bg-muted/70 border border-border"
                  }`}
                >
                  {isAtual ? (
                    "Plano Atual"
                  ) : (
                    <>
                      Selecionar {plano.nome}
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom plan CTA */}
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/15 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-xl flex-shrink-0">
              <Zap className="text-primary" size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-1" style={{ fontFamily: "var(--font-display)" }}>
                Precisa de um plano personalizado?
              </h3>
              <p className="text-sm text-muted-foreground">
                Volumes elevados, multi-tenant, integrações customizadas? Fale connosco.
              </p>
            </div>
          </div>
          <button className="flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 text-sm">
            Falar com Vendas
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
