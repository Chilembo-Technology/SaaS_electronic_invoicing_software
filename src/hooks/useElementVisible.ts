import { useCallback, useEffect, useState } from "react";

/** Opções por omissão: conta como visível qualquer intersecção com o ecrã. */
const DEFAULT_OBSERVER_OPTIONS: IntersectionObserverInit = { threshold: 0 };

/**
 * Diz se um elemento está visível no ecrã, com `IntersectionObserver`.
 *
 * Devolve um *callback ref* em vez de um `useRef`: a página inicial só monta a
 * faixa "Sessão iniciada" depois de a sessão ser restaurada — um `useRef` daria
 * `ref.current === null` quando o `useEffect` correu pela primeira vez e o
 * observer nunca chegaria a ser ligado. O callback ref avisa o hook quando o
 * elemento aparece (ou desaparece), religando o observer.
 *
 * Sem `IntersectionObserver` disponível (browser antigo ou, nos testes, sem o
 * mock de `src/test/setup.ts`) o hook não observa nada e mantém o estado
 * inicial: falha em aberto, ou seja, nunca esconde acções do utilizador.
 *
 * Uso:
 *   const { ref, visible } = useElementVisible<HTMLElement>();
 *   <section ref={ref}>…</section>
 *
 * @param options opções do `IntersectionObserver` (`threshold`, `rootMargin`…).
 *                Devem ter identidade estável (constante fora do componente),
 *                para não religar o observer a cada render.
 */
export function useElementVisible<T extends HTMLElement>(
  options?: IntersectionObserverInit,
): { ref: (node: T | null) => void; visible: boolean } {
  const [element, setElement] = useState<T | null>(null);
  const [visible, setVisible] = useState<boolean>(true);

  // Identidade estável: o React não volta a chamar o ref a cada render.
  const ref = useCallback((node: T | null) => {
    setElement(node);
  }, []);

  useEffect(() => {
    if (!element || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry) setVisible(entry.isIntersecting);
    }, options ?? DEFAULT_OBSERVER_OPTIONS);

    observer.observe(element);

    return () => observer.disconnect();
  }, [element, options]);

  return { ref, visible };
}
