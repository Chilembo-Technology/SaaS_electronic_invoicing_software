import { describe, expect, it, vi } from "vitest";

/**
 * Testes do serviço de login — o ÚNICO ponto do fluxo que fala HTTP.
 * A instância do axios (`src/lib/api.ts`) é substituída por um espião, para
 * verificar rotas, payloads e o tratamento dos erros do Laravel.
 */

const { mocks } = vi.hoisted(() => ({
  mocks: { post: vi.fn() },
}));

vi.mock("../../../lib/api", () => ({
  authApi: { post: mocks.post },
}));

import { loginService } from "./loginService";
import { toUser } from "../../../services/authService";
import { isLoginApiError } from "../utils/loginApiError";
import { httpError, validationErrorBody } from "../../../test/helpers";

const CREDENTIALS = { email: " Admin@Kianda.AO ", password: "segredo123" };

const VERIFY_RESPONSE = {
  success: true,
  message: "Código OTP válido",
  data: {
    id: "user-1",
    first_name: "Ana",
    last_name: "Silva",
    email: "ana@kianda.ao",
    phone_number: "923000000",
    status: "active",
    company_id: "company-1",
    roles: ["Administrator"],
    permissions: ["invoices.create"],
    created_at: "2026-01-02T08:00:00+00:00",
  },
  access_token: "jwt-token",
  token_type: "bearer",
  expires_in: 3600,
  expires_at: "2026-09-29 11:30:00",
};

describe("loginService.requestOtp", () => {
  it("pede o código em POST /v1/auth/login com o email normalizado", async () => {
    mocks.post.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Código OTP gerado e enviado ao seu email",
        data: { id: "otp-1", user_id: "user-1", expires_at: "2026-09-29 10:30:00" },
      },
    });

    const result = await loginService.requestOtp(CREDENTIALS);

    expect(mocks.post).toHaveBeenCalledWith("/v1/auth/login", {
      email: "admin@kianda.ao",
      password: "segredo123",
    });
    expect(result).toEqual({
      message: "Código OTP gerado e enviado ao seu email",
      expiresAt: "2026-09-29 10:30:00",
      otpId: "otp-1",
    });
  });

  it("traduz o 422 das credenciais na mensagem do backend", async () => {
    mocks.post.mockRejectedValueOnce(
      httpError(422, validationErrorBody({ error: ["As credenciais estão incorretas."] })),
    );

    await expect(loginService.requestOtp(CREDENTIALS)).rejects.toMatchObject({
      status: 422,
      message: "The given data was invalid.",
      fieldErrors: { error: "As credenciais estão incorretas." },
      isValidationError: true,
    });
  });

  it("lê o `retry_after` de um 429", async () => {
    mocks.post.mockRejectedValueOnce(
      httpError(429, { message: "Too Many Attempts.", retry_after: 90 }),
    );

    try {
      await loginService.requestOtp(CREDENTIALS);
      throw new Error("devia ter falhado");
    } catch (error) {
      expect(isLoginApiError(error)).toBe(true);
      expect(error).toMatchObject({
        status: 429,
        retryAfterSeconds: 90,
        isValidationError: false,
      });
    }
  });

  it("usa a mensagem do cabeçalho Retry-After quando o corpo não a traz", async () => {
    const withHeader = httpError(429, { message: "Too Many Attempts." });
    // O axios devolve os cabeçalhos da resposta neste objecto (minúsculas).
    (withHeader.response as { headers: Record<string, string> }).headers = {
      "retry-after": "120",
    };
    mocks.post.mockRejectedValueOnce(withHeader);

    const error = await loginService.requestOtp(CREDENTIALS).catch((thrown: unknown) => thrown);

    expect(isLoginApiError(error)).toBe(true);
    expect(error).toMatchObject({ status: 429, retryAfterSeconds: 120 });
  });
describe("loginService.verifyOtp", () => {
  it("valida o código e devolve a sessão autenticada (JWT + utilizador mapeado)", async () => {
    mocks.post.mockResolvedValueOnce({ data: VERIFY_RESPONSE });

    const session = await loginService.verifyOtp({
      email: " ana@Kianda.AO ",
      code: 123456789,
    });

    expect(mocks.post).toHaveBeenCalledWith("/v1/auth/verify-otp", {
      email: "ana@kianda.ao",
      code: 123456789,
    });
    expect(session.token).toBe("jwt-token");
    expect(session.tokenType).toBe("bearer");
    expect(session.expiresIn).toBe(3600);
    expect(session.expiresAt).toBe("2026-09-29 11:30:00");
    expect(session.user).toMatchObject({
      id: "user-1",
      name: "Ana Silva",
      email: "ana@kianda.ao",
      role: "Administrator",
      status: "active",
      company_id: "company-1",
      roles: ["Administrator"],
      permissions: ["invoices.create"],
    });
  });

  it("falha quando a API aceita o código mas não devolve o token", async () => {
    mocks.post.mockResolvedValueOnce({ data: { success: true, message: "OK", data: {} } });

    await expect(
      loginService.verifyOtp({ email: "ana@kianda.ao", code: 123456789 }),
    ).rejects.toThrow(/não devolveu o token de acesso/);
  });

  it("traduz o 401 (código inválido/expirado) com a mensagem do backend", async () => {
    mocks.post.mockRejectedValueOnce(
      httpError(401, { success: false, message: "Código OTP inválido ou expirado" }),
    );

    await expect(
      loginService.verifyOtp({ email: "ana@kianda.ao", code: 111111111 }),
    ).rejects.toMatchObject({
      status: 401,
      message: "Código OTP inválido ou expirado",
      isValidationError: false,
      isNetworkError: false,
    });
  });

  it("traduz o 404 (utilizador não encontrado)", async () => {
    mocks.post.mockRejectedValueOnce(
      httpError(404, { success: false, message: "Usuário não encontrado" }),
    );

    await expect(
      loginService.verifyOtp({ email: "nao.existe@kianda.ao", code: 123456789 }),
    ).rejects.toMatchObject({ status: 404, message: "Usuário não encontrado" });
  });

  it("usa o texto de servidor (e não o do registo) num 500", async () => {
    mocks.post.mockRejectedValueOnce(httpError(500, { message: "Server Error" }));

    await expect(
      loginService.verifyOtp({ email: "ana@kianda.ao", code: 123456789 }),
    ).rejects.toMatchObject({
      status: 500,
      message: "Não foi possível concluir a operação. Tente novamente dentro de instantes.",
    });
  });
});

describe("toUser", () => {
  it("junta o nome e usa o primeiro papel como `role`/`perfil`", () => {
    expect(toUser({ id: "1", first_name: "Ana", last_name: "Silva", roles: ["Administrator"] })).toMatchObject({
      name: "Ana Silva",
      role: "Administrator",
      perfil: "Administrator",
      ativo: false,
    });
  });

  it("recorre ao email quando não há nome e nunca devolve `undefined`", () => {
    expect(toUser({ id: "2", email: "ana@kianda.ao" })).toMatchObject({
      name: "ana@kianda.ao",
      role: undefined,
    });
    expect(toUser(null).name).toBe("Utilizador");
  });
});

});
