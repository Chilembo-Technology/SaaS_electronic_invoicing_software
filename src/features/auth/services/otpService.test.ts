import { describe, expect, it, vi } from "vitest";

/**
 * Testes do serviço de reenvio do código OTP — `POST /v1/otp/generate`
 * (`auth_service/routes/otp/otp_rooter.php`).
 * A instância do axios (`src/lib/api.ts`) é substituída por um espião, para
 * verificar a rota, o payload e o tratamento dos erros do Laravel.
 */

const { mocks } = vi.hoisted(() => ({
  mocks: { post: vi.fn() },
}));

vi.mock("../../../lib/api", () => ({
  authApi: { post: mocks.post },
}));

import { otpService } from "./otpService";
import { isLoginApiError } from "../utils/loginApiError";
import { httpError, networkError, validationErrorBody } from "../../../test/helpers";

describe("otpService.resendOtp", () => {
  it("pede um novo código em POST /v1/otp/generate com o email normalizado", async () => {
    mocks.post.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Código OTP gerado e enviado ao seu email",
        data: { id: "otp-2", user_id: "user-1", expires_at: "2026-09-29 10:45:00" },
      },
    });

    const result = await otpService.resendOtp(" Ana@Kianda.AO ");

    expect(mocks.post).toHaveBeenCalledWith("/v1/otp/generate", { email: "ana@kianda.ao" });
    expect(result).toEqual({
      message: "Código OTP gerado e enviado ao seu email",
      expiresAt: "2026-09-29 10:45:00",
      otpId: "otp-2",
    });
  });

  it("usa os valores por omissão quando o envelope vem incompleto", async () => {
    mocks.post.mockResolvedValueOnce({ data: { success: true } });

    await expect(otpService.resendOtp("ana@kianda.ao")).resolves.toEqual({
      message: "Código OTP gerado e enviado ao seu email",
      expiresAt: null,
      otpId: null,
    });
  });

  it("traduz o 422 (email inexistente) com a mensagem do backend", async () => {
    mocks.post.mockRejectedValueOnce(
      httpError(422, validationErrorBody({ email: ["O email não existe."] })),
    );

    await expect(otpService.resendOtp("naoexiste@kianda.ao")).rejects.toMatchObject({
      status: 422,
      fieldErrors: { email: "O email não existe." },
      isValidationError: true,
    });
  });

  it("lê o `retry_after` de um 429 (throttle no gateway)", async () => {
    mocks.post.mockRejectedValueOnce(
      httpError(429, { message: "Too Many Attempts.", retry_after: 60 }),
    );

    const error = await otpService.resendOtp("ana@kianda.ao").catch((thrown: unknown) => thrown);

    expect(isLoginApiError(error)).toBe(true);
    expect(error).toMatchObject({ status: 429, retryAfterSeconds: 60, isValidationError: false });
  });

  it("usa o texto de servidor num 500", async () => {
    mocks.post.mockRejectedValueOnce(httpError(500, { message: "Server Error" }));

    await expect(otpService.resendOtp("ana@kianda.ao")).rejects.toMatchObject({
      status: 500,
      message: "Não foi possível concluir a operação. Tente novamente dentro de instantes.",
    });
  });

  it("assinala a falha de rede (servidor inacessível)", async () => {
    mocks.post.mockRejectedValueOnce(networkError());

    await expect(otpService.resendOtp("ana@kianda.ao")).rejects.toMatchObject({
      isNetworkError: true,
    });
  });
});
