import "../styles/landing.css";

import { FaqSection } from "../components/FaqSection";
import { FeaturesSection } from "../components/FeaturesSection";
import { HeroSection } from "../components/HeroSection";
import { LandingFooter } from "../components/LandingFooter";
import { LandingHeader } from "../components/LandingHeader";
import { PricingSection } from "../components/PricingSection";
import { TestimonialsSection } from "../components/TestimonialsSection";
import { TrustBar } from "../components/TrustBar";

/**
 * Landing Page pública do "Fatura Mais" (utilizadores NÃO autenticados).
 *
 * Rota: `/`
 * Composição das secções — cada uma vive no seu próprio componente, para
 * manter os ficheiros pequenos e a responsabilidade única.
 */
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";

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
