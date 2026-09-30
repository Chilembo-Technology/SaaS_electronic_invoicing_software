import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

/**
 * Setup global dos testes.
 *   - `@testing-library/jest-dom` acrescenta matchers de DOM (toBeInTheDocument…);
 *   - `cleanup` garante um DOM limpo entre testes;
 *   - `localStorage` é limpo para os testes de token não vazarem estado.
 */
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllEnvs();
});

// O jsdom não implementa object URLs — necessários na pré-visualização do logotipo.
if (typeof URL.createObjectURL !== "function") {
  Object.defineProperty(URL, "createObjectURL", {
    value: () => "blob:preview",
    writable: true,
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    value: () => undefined,
    writable: true,
  });
}

// O jsdom não implementa ResizeObserver — usado pelas primitivas Radix (Checkbox, Select…).
if (typeof globalThis.ResizeObserver !== "function") {
  class ResizeObserverMock {
    observe() {
      return undefined;
    }
    unobserve() {
      return undefined;
    }
    disconnect() {
      return undefined;
    }
  }

  Object.defineProperty(globalThis, "ResizeObserver", {
    value: ResizeObserverMock,
    writable: true,
  });
}

// O jsdom não implementa scrollIntoView — usado ao focar o primeiro campo inválido.
if (typeof Element.prototype.scrollIntoView !== "function") {
  Object.defineProperty(Element.prototype, "scrollIntoView", {
    value: () => undefined,
    writable: true,
  });
}

// O jsdom não implementa elementFromPoint — consultado pela primitiva `input-otp`
// (campo do código OTP) para detectar o elemento sob o cursor/clique.
if (typeof document.elementFromPoint !== "function") {
  Object.defineProperty(document, "elementFromPoint", {
    value: () => null,
    writable: true,
  });
}

/**
 * O jsdom não implementa IntersectionObserver — usado por `useElementVisible`
 * para saber se a faixa "Sessão iniciada" (página inicial) está no ecrã.
 *
 * O mock não dispara nada sozinho: guarda as instâncias vivas (removidas no
 * `disconnect`) e os elementos observados, e os testes simulam a
 * entrada/saída do ecrã com `triggerVisibility(...)`. O acesso a partir dos
 * testes passa por `lastIntersectionObserver()` (`src/test/helpers.ts`).
 */
if (typeof globalThis.IntersectionObserver !== "function") {
  class IntersectionObserverMock {
    /** Instâncias ligadas — a última é a mais recente. */
    static instances: IntersectionObserverMock[] = [];

    readonly root: Element | Document | null = null;
    readonly rootMargin: string = "";
    readonly thresholds: readonly number[] = [];
    /** Elementos actualmente observados. */
    readonly elements: Element[] = [];

    private readonly callback: (entries: { isIntersecting: boolean; target: Element }[]) => void;

    constructor(
      callback: (entries: { isIntersecting: boolean; target: Element }[]) => void,
      options?: IntersectionObserverInit,
    ) {
      this.callback = callback;
      this.rootMargin = options?.rootMargin ?? "";
      this.thresholds = (Array.isArray(options?.threshold) ? options?.threshold : [0]) as readonly number[];
      IntersectionObserverMock.instances.push(this);
    }

    observe(target: Element): void {
      if (!this.elements.includes(target)) this.elements.push(target);
    }

    unobserve(target: Element): void {
      const index = this.elements.indexOf(target);
      if (index >= 0) this.elements.splice(index, 1);
    }

    disconnect(): void {
      this.elements.length = 0;

      const index = IntersectionObserverMock.instances.indexOf(this);
      if (index >= 0) IntersectionObserverMock.instances.splice(index, 1);
    }

    takeRecords(): { isIntersecting: boolean; target: Element }[] {
      return [];
    }

    /** Ajuda de teste: simula uma mudança de visibilidade dos elementos observados. */
    triggerVisibility(isIntersecting: boolean): void {
      this.callback(this.elements.map((target) => ({ isIntersecting, target })));
    }
  }

  Object.defineProperty(globalThis, "IntersectionObserver", {
    value: IntersectionObserverMock,
    writable: true,
  });
}

