import { AxiosError } from "axios";

/**
 * Auxiliares partilhados pelos testes (não é um ficheiro de testes — não é
 * recolhido pelo `include` do vitest).
 */

/** Erro do axios COM resposta HTTP (400, 422, 500…). */
export function httpError(status: number, data: unknown, code = "ERR_BAD_REQUEST"): AxiosError {
  return new AxiosError("Request failed", code, undefined, undefined, {
    data,
    status,
    statusText: "",
    headers: {},
    config: {} as never,
  } as never);
}

/** Erro do axios SEM resposta: falha de rede ou timeout. */
export function networkError(code = "ERR_NETWORK"): AxiosError {
  return new AxiosError("Network Error", code, undefined, undefined, undefined);
}

/** Corpo 422 do Laravel com os erros por campo. */
export function validationErrorBody(errors: Record<string, string[]>): {
  message: string;
  errors: Record<string, string[]>;
} {
  return { message: "The given data was invalid.", errors };
}

/** Instância viva do mock de `IntersectionObserver` (ver `src/test/setup.ts`). */
export interface IntersectionObserverMockInstance {
  /** Elementos observados. */
  elements: Element[];
  /** Simula uma observação: `false` = elemento fora do ecrã. */
  triggerVisibility(isIntersecting: boolean): void;
}

/**
 * A instância mais recente do mock de `IntersectionObserver`.
 *
 * O `useElementVisible` cria uma instância por elemento observado (a faixa
 * "Sessão iniciada" da página inicial), pelo que a última ligada é a que
 * interessa ao teste.
 */
export function lastIntersectionObserver(): IntersectionObserverMockInstance | undefined {
  const observerConstructor = globalThis.IntersectionObserver as unknown as
    | { instances?: IntersectionObserverMockInstance[] }
    | undefined;

  const instances = observerConstructor?.instances;

  return instances && instances.length > 0 ? instances[instances.length - 1] : undefined;
}

