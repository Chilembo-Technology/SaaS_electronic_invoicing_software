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

