import { describe, expect, it, vi } from "vitest";

/**
 * Testes do serviço de recuperação de palavra-passe — o ÚNICO ponto do fluxo
 * que fala HTTP. A instância do axios (`src/lib/api.ts`) é substituída por um
 * espião, para verificar rotas, payloads (nomes de campo do Laravel) e o
 * tratamento dos erros.
 */

const { mocks } = vi.hoisted(() => ({
  mocks: { post: vi.fn() },
}));

vi.mock("../../../lib/api", () => ({
  authApi: { post: mocks.post },
}));

import { passwordResetService } from "./passwordResetService";
import { isLoginApiError } from "../utils/loginApiError";
import { httpError, networkError, validationErrorBody } from "../../../test/helpers";

const OTP_BODY = {
  success: true,
  message: "Código OTP gerado e enviado ao seu email",
  data: { id: "otp-1", user_id: "user-1", expires_at: "2026-09-30 10:30:00" },
};

describe("passwordResetService.requestPasswordReset", () => {
  it("pede o código em POST /v1/users/recuver-password com o email normalizado", async () => {
    mocks.post.mockResolvedValueOnce({ data: OTP_BODY });

    const result = await passwordResetService.requestPasswordReset(" Ana@Kianda.AO ");

    // ⚠️ O path real do backend tem "recuver" (com "u") — não é "recover".
    expect(mocks.post).toHaveBeenCalledWith("/v1/users/recuver-password", {
      email: "ana@kianda.ao",
    });
    expect(result).toEqual({
      message: "Código OTP gerado e enviado ao seu email",
      expiresAt: "2026-09-30 10:30:00",
      otpId: "otp-1",
    });
  });

  it("usa os valores por omissão quando o envelope vem incompleto", async () => {
    mocks.post.mockResolvedValueOnce({ data: { success: true } });

    await expect(passwordResetService.requestPasswordReset("ana@kianda.ao")).resolves.toEqual({
      message: "Código OTP gerado e enviado ao seu email",
      expiresAt: null,
      otpId: null,
    });
  });

  it("traduz o 422 do email inexistente («Email inexistente» do backend)", async () => {
    mocks.post.mockRejectedValueOnce(
      httpError(422, validationErrorBody({ email: ["Email inexistente"] })),
    );

    await expect(passwordResetService.requestPasswordReset("naoexiste@kianda.ao")).rejects.toMatchObject({
      status: 422,
      fieldErrors: { email: "Email inexistente" },
      isValidationError: true,
    });
  });

  it("assinala a falha de rede (servidor inacessível)", async () => {
    mocks.post.mockRejectedValueOnce(networkError());

    await expect(
      passwordResetService.requestPasswordReset("ana@kianda.ao"),
    ).rejects.toMatchObject({ isNetworkError: true });
  });
});

describe("passwordResetService.verifyResetOtp", () => {
  it("valida o código em POST /v1/auth/verify-otp e NÃO devolve o token", async () => {
    mocks.post.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Código OTP válido",
        data: { id: "user-1" },
        access_token: "jwt-token",
        token_type: "bearer",
        expires_in: 3600,
        expires_at: "2026-09-30 11:30:00",
      },
    });

    const result = await passwordResetService.verifyResetOtp({
      email: " Ana@Kianda.AO ",
      code: 123456789,
    });

    expect(mocks.post).toHaveBeenCalledWith("/v1/auth/verify-otp", {
      email: "ana@kianda.ao",
      code: 123456789,
    });
    // Só a mensagem é exposta: o JWT é descartado (validar o código não abre sessão).
    expect(result).toEqual({ message: "Código OTP válido" });
  });

  it("falha quando a API aceita o código mas não devolve o token", async () => {
    mocks.post.mockResolvedValueOnce({ data: { success: true, message: "OK" } });

    await expect(
      passwordResetService.verifyResetOtp({ email: "ana@kianda.ao", code: 123456789 }),
    ).rejects.toThrow(/não devolveu o token de acesso/);
  });

  it("traduz o 401 (código inválido ou expirado)", async () => {
    mocks.post.mockRejectedValueOnce(
      httpError(401, { success: false, message: "Código OTP inválido ou expirado" }),
    );

    const error = await passwordResetService
      .verifyResetOtp({ email: "ana@kianda.ao", code: 111111111 })
      .catch((thrown: unknown) => thrown);

    expect(isLoginApiError(error)).toBe(true);
    expect(error).toMatchObject({
      status: 401,
      message: "Código OTP inválido ou expirado",
      isValidationError: false,
      isNetworkError: false,
    });
  });
});

describe("passwordResetService.submitNewPassword", () => {
  it("envia `email` + `new_password` (nomes do Laravel) para /v1/users/new-password", async () => {
    mocks.post.mockResolvedValueOnce({
      data: { success: true, message: "Nova senha definida com sucesso" },
    });

    const result = await passwordResetService.submitNewPassword({
      email: " Ana@Kianda.AO ",
      password: "segredo123",
    });

    // ⚠️ `NewPasswordUserRequest` exige `new_password` — não existe `confirmed`
    // nem `password_confirmation` no backend.
    expect(mocks.post).toHaveBeenCalledWith("/v1/users/new-password", {
      email: "ana@kianda.ao",
      new_password: "segredo123",
    });
    expect(result).toEqual({ message: "Nova senha definida com sucesso" });
  });

  it("usa a mensagem por omissão quando o envelope vem incompleto", async () => {
    mocks.post.mockResolvedValueOnce({ data: { success: true } });

    await expect(
      passwordResetService.submitNewPassword({ email: "ana@kianda.ao", password: "segredo123" }),
    ).resolves.toEqual({ message: "Nova senha definida com sucesso" });
  });

  it("traduz o 422 do campo `new_password` com a mensagem do backend", async () => {
    mocks.post.mockRejectedValueOnce(
      httpError(422, validationErrorBody({ new_password: ["O campo senha é obrigatorio."] })),
    );

    await expect(
      passwordResetService.submitNewPassword({ email: "ana@kianda.ao", password: "" }),
    ).rejects.toMatchObject({
      status: 422,
      fieldErrors: { new_password: "O campo senha é obrigatorio." },
      isValidationError: true,
    });
  });

  it("usa o texto de servidor num 500", async () => {
    mocks.post.mockRejectedValueOnce(httpError(500, { message: "Server Error" }));

    await expect(
      passwordResetService.submitNewPassword({ email: "ana@kianda.ao", password: "segredo123" }),
    ).rejects.toMatchObject({
      status: 500,
      message: "Não foi possível concluir a operação. Tente novamente dentro de instantes.",
    });
  });
});
