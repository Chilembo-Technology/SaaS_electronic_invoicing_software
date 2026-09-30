import "../styles/landing.css";

import { FaqSection } from "../components/FaqSection";
import { FeaturesSection } from "../components/FeaturesSection";
import { HeroSection } from "../components/HeroSection";
import { LandingFooter } from "../components/LandingFooter";
import { LandingHeader } from "../components/LandingHeader";
import { PricingSection } from "../components/PricingSection";
import { TestimonialsSection } from "../components/TestimonialsSection";
import { TrustBar } from "../components/TrustBar";
import { WelcomeBackSection } from "../components/WelcomeBackSection";

/**
 * Opções do observer da faixa "Sessão iniciada" (Zona 2).
 *
 * Vivem fora do componente para manter a identidade do objecto entre renders —
 * senão o observer seria religado a cada render. O `rootMargin` de 80px é a
 * altura do header fixo (`h-20`): a faixa conta como visível enquanto estiver
 * abaixo dessa linha, ou seja, até passar para trás do header.
 */
const WELCOME_SECTION_OBSERVER: IntersectionObserverInit = {
  threshold: 0,
  rootMargin: "-80px 0px 0px 0px",
};

/**
 * Landing Page pública do "Fatura Mais".
 *
 * Rota: `/`
 * Composição das secções — cada uma vive no seu próprio componente, para
 * manter os ficheiros pequenos e a responsabilidade única.
 *
 * O conteúdo de marketing destina-se a visitantes, mas a página também reage à
 * sessão: com sessão iniciada, a `WelcomeBackSection` (nome + "Ir para o
 * Dashboard" + "Sair da conta") aparece no topo do `<main>` e o `LandingHeader`
 * mostra a conta. Sem sessão, a `WelcomeBackSection` não renderiza nada e a
 * página mantém-se exactamente como estava.
 *
 * Reage também ao scroll: enquanto a faixa está no ecrã, a navbar esconde as
 * acções que a faixa já oferece (perfil, saída e "Ir para Painel"); quando a
 * faixa passa para trás do header, a navbar volta a mostrá-las.
 */
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";
import { useElementVisible } from "../../../hooks/useElementVisible";

export function LandingPage() {
  useDocumentTitle("Início");

  // Visibilidade da faixa "Sessão iniciada" (Zona 2). O `ref` é ligado ao
  // `<section>` da faixa; sem sessão a faixa não existe e o hook mantém o
  // estado inicial (nunca esconde acções por engano).
  const { ref: welcomeSectionRef, visible: isWelcomeSectionVisible } =
    useElementVisible<HTMLElement>(WELCOME_SECTION_OBSERVER);

  return (
    <div className="landing-scope min-h-screen bg-background">
      <LandingHeader hideAccountActions={isWelcomeSectionVisible} />

      <main>
        <WelcomeBackSection sectionRef={welcomeSectionRef} />
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
