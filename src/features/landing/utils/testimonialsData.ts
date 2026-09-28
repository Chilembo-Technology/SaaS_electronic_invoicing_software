import type { Testimonial } from "../types/landing";

/** Testemunhos fictícios de clientes (dados de demonstração). */
export const testimonials: Testimonial[] = [
  {
    id: "kianda-logistica",
    quote:
      "A Fatura Mais poupou-nos cerca de 10 horas por semana. Emitimos, validamos e comunicamos tudo à AGT sem sair da plataforma.",
    highlight: "10 horas por semana",
    author: "Ana Tavares",
    role: "Diretora Financeira",
    company: "Kianda Logística · Luanda",
    initials: "AT",
    rating: 5,
  },
  {
    id: "mercabom",
    quote:
      "Passámos a emitir faturas e recibos em minutos. O cálculo de IVA e de retenção deixou de ser um risco e o SAF-T sai sempre a tempo.",
    highlight: "faturas em minutos",
    author: "José Manuel",
    role: "Sócio-gerente",
    company: "MercaBom Supermercados · Benguela",
    initials: "JM",
    rating: 5,
  },
  {
    id: "ribeiro-associados",
    quote:
      "Trabalho com vários clientes angolanos e o SAF-T deixou de ser um pesadelo. A exportação e o arquivo digital são impecáveis.",
    highlight: "SAF-T impecável",
    author: "Marta Ribeiro",
    role: "Contabilista Certificada",
    company: "Ribeiro & Associados · Huambo",
    initials: "MR",
    rating: 5,
  },
];
