import type { FaqItem } from "../types/landing";

/** Perguntas frequentes da Landing Page. */
export const faqItems: FaqItem[] = [
  {
    id: "agt",
    question: "A Fatura Mais é certificada pela AGT?",
    answer:
      "Sim. A Fatura Mais é um software de faturação eletrónica em conformidade com as regras da Administração Geral Tributária (AGT) de Angola. Os documentos são numerados sequencialmente por série, assinados digitalmente e comunicados à AGT, e o sistema gera o ficheiro SAF-T (AO) exigido para efeitos fiscais.",
  },
  {
    id: "pos-pago",
    question: "Como funciona o plano pós-pago?",
    answer:
      "No plano Pós-Pago Flex não existe mensalidade fixa: paga apenas 45 Kz por cada documento emitido, com um mínimo mensal de 12.500 Kz. No início de cada mês recebe a fatura detalhada com todos os documentos emitidos, o que torna o custo previsível mesmo quando a sua faturação oscila.",
  },
  {
    id: "mudar-plano",
    question: "Posso mudar de plano ou de periodicidade mais tarde?",
    answer:
      "Pode. O upgrade é imediato e o valor já pago é proporcionalmente creditado. No downgrade, a alteração aplica-se no ciclo de faturação seguinte. Os planos Mensal e Trimestral podem ser cancelados a qualquer momento, sem penalizações.",
  },
  {
    id: "impostos",
    question: "O sistema suporta as taxas de IVA e a retenção angolanas?",
    answer:
      "Sim. A Fatura Mais aplica automaticamente as taxas de IVA de 0%, 7%, 14% e 21,5%, a retenção na fonte de 6,5% em serviços entre empresas e o cálculo de descontos, encargos e conversão de moeda estrangeira para Kwanzas (AOA) à taxa de câmbio do dia.",
  },
  {
    id: "multiempresa",
    question: "Consigo gerir várias empresas na mesma conta?",
    answer:
      "Sim. Cada empresa fica isolada num ambiente próprio (multi-tenant), com os seus utilizadores, perfis, séries e numeração independentes. O Administrador alterna entre empresas com um clique, e cada perfil de utilizador só acede aos dados da empresa a que pertence.",
  },
  {
    id: "migracao",
    question: "Quanto tempo demora a migração do meu sistema atual?",
    answer:
      "Para a maioria dos clientes, a migração de clientes, produtos e histórico conclui-se em menos de 48 horas, com o apoio da nossa equipa de implantação. Durante o processo, o seu sistema antigo continua a funcionar normalmente.",
  },
];
