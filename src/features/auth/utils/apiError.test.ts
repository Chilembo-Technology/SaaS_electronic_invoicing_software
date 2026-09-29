import { describe, expect, it } from "vitest";
import { AxiosError } from "axios";

import { API_ERROR_MESSAGES, normalizeApiError } from "./apiError";
import { httpError, networkError, validationErrorBody } from "../../../test/helpers";

const COMPANY_FIELD_MAP = {
  admin_email: "adminEmail",
  tax_number: "taxNumber",
};

describe("normalizeApiError", () => {
  it("mapeia o 422 do Laravel para os campos do formulário", () => {
    const error = httpError(
      422,
      validationErrorBody({
        admin_email: ["O email do administrador já está em uso."],
        tax_number: ["O número de imposto já está em uso.", "Segunda mensagem ignorada."],
      }),
    );

    const result = normalizeApiError(error, COMPANY_FIELD_MAP);

    expect(result.status).toBe(422);
    expect(result.isValidationError).toBe(true);
    expect(result.isNetworkError).toBe(false);
    expect(result.fieldErrors).toEqual({
      adminEmail: "O email do administrador já está em uso.",
      taxNumber: "O número de imposto já está em uso.",
    });
  });

  it("mantém os nomes originais quando não há mapa de campos", () => {
    const result = normalizeApiError(httpError(422, validationErrorBody({ phone: ["Formato inválido."] })));

    expect(result.fieldErrors).toEqual({ phone: "Formato inválido." });
  });

  it("usa a mensagem de validação genérica quando o 422 não traz erros", () => {
    const result = normalizeApiError(httpError(422, { message: "The given data was invalid." }));

    expect(result.isValidationError).toBe(true);
    expect(result.fieldErrors).toEqual({});
    expect(result.message).toBe("The given data was invalid.");
  });

  it("aceita um erro de campo como string simples", () => {
    const result = normalizeApiError(httpError(422, validationErrorBody({ company_name: "Obrigatório." } as never)));

    expect(result.fieldErrors.company_name).toBe("Obrigatório.");
  });

  it("trata 5xx como erro de servidor (não de validação)", () => {
    const result = normalizeApiError(httpError(500, { message: "Server Error" }));

    expect(result.status).toBe(500);
    expect(result.message).toBe(API_ERROR_MESSAGES.server);
    expect(result.isValidationError).toBe(false);
    expect(result.isNetworkError).toBe(false);
  });

  it("trata falha de rede e timeout com mensagens distintas", () => {
    const network = normalizeApiError(networkError());
    expect(network.isNetworkError).toBe(true);
    expect(network.message).toBe(API_ERROR_MESSAGES.network);

    const timeout = normalizeApiError(networkError("ECONNABORTED"));
    expect(timeout.isNetworkError).toBe(true);
    expect(timeout.message).toBe(API_ERROR_MESSAGES.timeout);
  });

  it("trata 409, 429 e 404/405 com as mensagens próprias", () => {
    expect(normalizeApiError(httpError(409, {})).message).toBe(API_ERROR_MESSAGES.conflict);
    expect(normalizeApiError(httpError(409, { message: "NIF duplicado." })).message).toBe("NIF duplicado.");
    expect(normalizeApiError(httpError(429, {})).message).toBe(API_ERROR_MESSAGES.rateLimit);
    expect(normalizeApiError(httpError(404, {})).message).toBe(API_ERROR_MESSAGES.notFound);
    expect(normalizeApiError(httpError(405, {})).message).toBe(API_ERROR_MESSAGES.notFound);
  });

  it("usa a mensagem do corpo em outros erros (400) e recorre ao texto do erro", () => {
    expect(normalizeApiError(httpError(400, { error: "Parâmetros inválidos." })).message).toBe("Parâmetros inválidos.");
    expect(normalizeApiError(new Error("Falha inesperada no cliente.")).message).toBe(
      "Falha inesperada no cliente.",
    );
    expect(normalizeApiError("string qualquer").message).toBe(API_ERROR_MESSAGES.unexpected);
  });

  it("trata um AxiosError sem resposta como falha de rede", () => {
    const result = normalizeApiError(new AxiosError("Erro simples"));

    expect(result.isNetworkError).toBe(true);
    expect(result.isValidationError).toBe(false);
    expect(result.fieldErrors).toEqual({});
  });
});
