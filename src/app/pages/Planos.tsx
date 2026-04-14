import { Check, Crown, Rocket, Star, AlertCircle } from "lucide-react";

const planos = [
  {
    nome: "Básico",
    preco: 15000,
    icon: Star,
    cor: "text-secondary",
    bgCor: "bg-secondary/10",
    faturas: 50,
    features: [
      "Até 50 faturas/mês",
      "1 usuário",
      "Relatórios básicos",
      "Suporte por email",
      "Exportação SAF-T",
    ]
  },
  {
    nome: "Profissional",
    preco: 35000,
    icon: Rocket,
    cor: "text-primary",
    bgCor: "bg-primary/10",
    faturas: 200,
    popular: true,
    features: [
      "Até 200 faturas/mês",
      "5 usuários",
      "Relatórios avançados",
      "Suporte prioritário",
      "Exportação SAF-T",
      "Personalização de templates",
      "API de integração",
    ]
  },
  {
    nome: "Enterprise",
    preco: 75000,
    icon: Crown,
    cor: "text-purple-600",
    bgCor: "bg-purple-500/10",
    faturas: null,
    features: [
      "Faturas ilimitadas",
      "Usuários ilimitados",
      "BI e Machine Learning",
      "Suporte 24/7",
      "Exportação SAF-T",
      "Templates personalizados",
      "API completa",
      "White-label",
      "Gestor de conta dedicado",
    ]
  },
];

export function Planos() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          Planos e Preços
        </h1>
        <p className="text-lg text-muted-foreground">
          Escolha o plano ideal para o seu negócio
        </p>
      </div>

      {/* Current Plan Alert */}
      <div className="flex items-start gap-3 p-4 bg-primary/10 border border-primary/20 rounded-lg max-w-3xl mx-auto">
        <AlertCircle className="text-primary mt-0.5" size={20} />
        <div>
          <p className="text-sm font-semibold text-primary">Plano Atual: Profissional</p>
          <p className="text-xs text-primary/80 mt-1">
            Você utilizou 156 de 200 faturas este mês. Considere fazer upgrade se precisar de mais.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {planos.map((plano) => {
          const Icon = plano.icon;
          return (
            <div
              key={plano.nome}
              className={`bg-card rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all relative ${
                plano.popular ? 'border-primary scale-105' : 'border-border'
              }`}
            >
              {plano.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold rounded-full shadow-lg">
                    MAIS POPULAR
                  </span>
                </div>
              )}

              <div className="p-8">
                <div className={`p-4 ${plano.bgCor} rounded-xl w-fit mb-4`}>
                  <Icon className={plano.cor} size={32} />
                </div>

                <h3 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                  {plano.nome}
                </h3>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-foreground">
                      {(plano.preco / 1000).toLocaleString('pt-AO')}K
                    </span>
                    <span className="text-muted-foreground">Kz/mês</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {plano.faturas ? `Até ${plano.faturas} faturas/mês` : 'Faturas ilimitadas'}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plano.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="text-secondary flex-shrink-0 mt-0.5" size={18} />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    plano.popular
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  {plano.popular ? 'Plano Atual' : 'Selecionar Plano'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="bg-gradient-to-br from-primary to-secondary p-8 rounded-xl shadow-lg text-white max-w-4xl mx-auto mt-12">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Precisa de um plano personalizado?
          </h3>
          <p className="text-white/90 mb-6">
            Entre em contato com nossa equipe para criar um plano sob medida para o seu negócio
          </p>
          <button className="px-8 py-3 bg-white text-primary rounded-lg font-semibold hover:bg-white/90 transition-all shadow-lg">
            Falar com Vendas
          </button>
        </div>
      </div>
    </div>
  );
}
