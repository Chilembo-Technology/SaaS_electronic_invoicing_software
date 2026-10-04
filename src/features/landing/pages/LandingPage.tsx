import "../styles/landing.css";

import { FaqSection } from "../components/FaqSection";
import { FeaturesSection } from "../components/FeaturesSection";
import { HeroSection } from "../components/HeroSection";
import { LandingFooter } from "../components/LandingFooter";
import { LandingHeader } from "../components/LandingHeader";
import { PricingSection } from "../components/PricingSection";
import { TestimonialsSection } from "../components/TestimonialsSection";
import { TrustBar } from "../components/TrustBar";

import { useDocumentTitle } from "../../../hooks/useDocumentTitle";

/**
 * Landing Page pública do "Fatura Mais".
 *
 * Rota: `/`
 * Composição das secções — cada uma vive no seu próprio componente, para
 * manter os ficheiros pequenos e a responsabilidade única.
 *
 * O conteúdo é de marketing, mas o `LandingHeader` reage à sessão: com sessão
 * iniciada mostra sempre o nome, o perfil, "Sair da Conta" e o CTA "Ir para o
 * Painel"; sem sessão mostra "Entrar" e "Registar". As ações de conta da navbar
 * ficam fixas — não há qualquer comportamento ligado ao scroll nem faixa de
 * boas-vindas no conteúdo.
 */
export function LandingPage() {
  useDocumentTitle("Início");

  return (
    <div className="landing-scope min-h-screen bg-background">
      <LandingHeader />

      <main>
        <HeroSection />
        <TrustBar />
        <FeaturesSection />
        <PricingSection />
        <TestimonialsSection />
        <FaqSection />
      </main>

      <LandingFooter />
    </div>
  );
}
