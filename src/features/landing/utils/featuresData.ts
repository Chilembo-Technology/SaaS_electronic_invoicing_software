import {
  FileCheck2,
  Files,
  Headphones,
  Lock,
  PenLine,
  ScanLine,
  ShieldCheck,
} from "lucide-react";

import type { DocumentFeatureGroup, TrustItem } from "../types/landing";

/** Selos da faixa de confiança/segurança apresentada sob o Hero. */
export const trustItems: TrustItem[] = [
  {
    icon: ShieldCheck,
    label: "Certificado pela AGT",
    description: "Software de faturação aprovado",
  },
  {
    icon: Lock,
    label: "Dados Criptografados",
    description: "AES-256 em repouso e em trânsito",
  },
  {
    icon: Headphones,
    label: "Suporte 24/7",
    description: "Equipa angolana sempre disponível",
  },
  {
    icon: FileCheck2,
    label: "SAF-T (AO) automático",
    description: "Exportação mensal sem esforço",
  },
];

/**
 * Funcionalidades agrupadas por família de documentos,
 * conforme a legislação de faturação eletrónica angolana.
 */
export const documentFeatureGroups: DocumentFeatureGroup[] = [
  {
    id: "faturas",
    icon: Files,
    title: "Faturas",
    description: "Todos os tipos de fatura previstos na legislação angolana.",
    items: [
      {
        title: "Fatura",
        description:
          "Venda de bens ou serviços com IVA e retenção na fonte calculados automaticamente.",
      },
      {
        title: "Auto-faturação",
        description:
          "Emissão em nome do cliente, conforme os requisitos de auto-faturação da AGT.",
      },
      {
        title: "Fatura Genérica",
        description:
          "Para vendas a consumidor final sem identificação do adquirente, com série própria.",
      },
      {
        title: "Fatura Global",
        description:
          "Consolida várias faturas genéricas de um período num único documento.",
      },
    ],
  },
  {
    id: "eletronica",
    icon: ScanLine,
    title: "Faturação Eletrónica",
    description: "Documentos assinados digitalmente e comunicados à AGT.",
    items: [
      {
        title: "Fatura/Recibo",
        description:
          "Fatura com quitação imediata: documento e recibo num só, pronto a entregar.",
      },
      {
        title: "Fatura em formato eletrónico",
        description:
          "XML assinado e validado, com numeração sequencial por empresa e série.",
      },
      {
        title: "Comunicação à AGT",
        description:
          "Envio automático dos documentos e reenvio em caso de falha de comunicação.",
      },
    ],
  },
  {
    id: "notas",
    icon: PenLine,
    title: "Notas e Recibos",
    description: "Corrija, anule ou comprove pagamentos sem perder o rasto fiscal.",
    items: [
      {
        title: "Nota de Débito",
        description:
          "Corrige valores a menos ou acrescenta encargos, com referência ao documento original.",
      },
      {
        title: "Nota de Crédito",
        description:
          "Anula ou reduz valores por devoluções, descontos ou erros de faturação.",
      },
      {
        title: "Recibo",
        description:
          "Comprova pagamentos totais ou parciais e mantém a conta corrente do cliente em ordem.",
      },
    ],
  },
];
