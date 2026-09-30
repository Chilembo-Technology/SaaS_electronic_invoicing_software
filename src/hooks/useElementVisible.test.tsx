import { describe, expect, it } from "vitest";
import { act, render, screen } from "@testing-library/react";

import { lastIntersectionObserver } from "../test/helpers";
import { useElementVisible } from "./useElementVisible";

/**
 * O hook é a base do comportamento de scroll da página inicial: a navbar só
 * esconde as acções duplicadas enquanto a faixa "Sessão iniciada" está no ecrã.
 *
 * O `IntersectionObserver` é substituído pelo mock de `src/test/setup.ts`, que
 * não dispara nada sozinho — cada teste simula a entrada/saída do ecrã com
 * `triggerVisibility(...)`.
 */

/** Identidade estável (fora do componente), tal como no uso real. */
const OBSERVER_OPTIONS: IntersectionObserverInit = { threshold: 0 };

function Box() {
  const { ref, visible } = useElementVisible<HTMLDivElement>(OBSERVER_OPTIONS);

  return (
    <div ref={ref} data-testid="caixa">
      {visible ? "no ecrã" : "fora do ecrã"}
    </div>
  );
}

describe("useElementVisible", () => {
  it("observa o elemento e começa no estado visível", () => {
    render(<Box />);

    const observer = lastIntersectionObserver();

    expect(observer).toBeDefined();
    expect(observer?.elements[0]?.tagName).toBe("DIV");
    expect(screen.getByText("no ecrã")).toBeInTheDocument();
  });

  it("passa a invisível quando o elemento sai do ecrã e volta quando reaparece", () => {
    render(<Box />);

    act(() => lastIntersectionObserver()?.triggerVisibility(false));
    expect(screen.getByText("fora do ecrã")).toBeInTheDocument();

    act(() => lastIntersectionObserver()?.triggerVisibility(true));
    expect(screen.getByText("no ecrã")).toBeInTheDocument();
  });

  it("desliga o observer quando o componente é desmontado", () => {
    const { unmount } = render(<Box />);

    expect(lastIntersectionObserver()).toBeDefined();

    unmount();

    expect(lastIntersectionObserver()).toBeUndefined();
  });

  it("continua a funcionar sem `IntersectionObserver` (falha em aberto)", () => {
    const original = globalThis.IntersectionObserver;

    // Simula um ambiente sem `IntersectionObserver` (o mock do setup não é
    // configurável, logo não pode ser removido — fica `undefined`).
    Object.defineProperty(globalThis, "IntersectionObserver", {
      value: undefined,
      writable: true,
    });

    try {
      render(<Box />);

      // Sem observer o hook mantém o estado inicial — nunca esconde nada.
      expect(screen.getByText("no ecrã")).toBeInTheDocument();
    } finally {
      Object.defineProperty(globalThis, "IntersectionObserver", {
        value: original,
        writable: true,
      });
    }
  });
});
