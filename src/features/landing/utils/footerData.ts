import { Clock, Facebook, Instagram, Linkedin, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import type { FooterColumn } from "../types/landing";

/** Colunas de links úteis do footer. */
export const footerColumns: FooterColumn[] = [
  {
    title: "Produto",
    links: [
      { label: "Funcionalidades", href: "#funcionalidades" },
      { label: "Planos e Preços", href: "#planos" },
      { label: "Testemunhos", href: "#testemunhos" },
      { label: "Perguntas Frequentes", href: "#faq" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre a Chilembo Technology", href: "#contacto" },
      { label: "Contactos", href: "#contacto" },
      { label: "Parceiros certificados", href: "#contacto" },
      { label: "Trabalhe connosco", href: "#contacto" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Termos e Condições", href: "#contacto" },
      { label: "Política de Privacidade", href: "#contacto" },
      { label: "Política de Cookies", href: "#contacto" },
      { label: "Segurança da Informação", href: "#contacto" },
    ],
  },
  {
    title: "Conta",
    links: [
      { label: "Entrar", href: "/login" },
      { label: "Criar conta", href: "/registar" },
      { label: "Recuperar senha", href: "/recuperar-senha" },
      { label: "Planos e subscrição", href: "#planos" },
    ],
  },
];

/** Informações de contacto (dados fictícios de demonstração). */
export const contactInfo = [
  { icon: MapPin, label: "Rua Amílcar Cabral, 123 — Luanda, Angola" },
  { icon: Phone, label: "+244 923 000 000" },
  { icon: Mail, label: "comercial@faturamais.ao" },
  { icon: Clock, label: "Seg–Sex, 08h00–18h00 (WAT)" },
];

export const socialLinks = [
  { label: "Facebook", href: "#contacto", icon: Facebook },
  { label: "Instagram", href: "#contacto", icon: Instagram },
  { label: "LinkedIn", href: "#contacto", icon: Linkedin },
  { label: "WhatsApp", href: "#contacto", icon: MessageCircle },
];

export const footerTagline =
  "Software de faturação eletrónica certificado pela AGT, feito em Angola para empresas angolanas.";

export const footerCopyright = `© ${new Date().getFullYear()} CHILEMBO TECHNOLOGY · Todos os direitos reservados`;

