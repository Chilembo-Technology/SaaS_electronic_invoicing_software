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
