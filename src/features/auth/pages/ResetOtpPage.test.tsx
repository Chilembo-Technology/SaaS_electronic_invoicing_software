import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";

/**
 * Teste de integração do ecrã 2 da recuperação de palavra-passe
 * (`/recuperar-senha/verificar-codigo`).
 *
 * O email chega pelo `state` do React Router — cada teste escolhe o estado
 * inicial. Serviço e toasts estão substituídos por espiões.
 */

const { serviceMocks, toastMocks } = vi.hoisted(() => ({
  serviceMocks: {
    requestPasswordReset: vi.fn(),
    verifyResetOtp: vi.fn(),
    submitNewPassword: vi.fn(),
  },
  toastMocks: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("../services/passwordResetService", () => ({ passwordResetService: serviceMocks }));
vi.mock("sonner", () => ({ toast: toastMocks }));

import { ResetOtpPage } from "./ResetOtpPage";
import { toLoginApiError } from "../utils/loginApiError";
import { httpError, validationErrorBody } from "../../../test/helpers";

const PENDING = { email: "ana@kianda.ao", expiresAt: "2026-09-30 10:30:00" };

function renderPage(state?: unknown) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: "/recuperar-senha/verificar-codigo", state }]}>
      <Routes>
        <Route path="/recuperar-senha" element={<div>PASSO_EMAIL</div>} />
        <Route path="/recuperar-senha/verificar-codigo" element={<ResetOtpPage />} />
        <Route path="/recuperar-senha/nova-senha" element={<div>PASSO_SENHA</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

/** Escreve o código no campo OTP (input controlado da primitiva `InputOTP`). */
function fillCode(code: string) {
  fireEvent.change(screen.getByLabelText(/Código de verificação/), { target: { value: code } });
}

function submit() {
  fireEvent.submit(document.querySelector("form") as HTMLFormElement);
}

describe("ResetOtpPage — acesso e formulário", () => {
  it("volta ao ecrã 1 quando não há pedido de recuperação em curso", async () => {
    renderPage();

    expect(await screen.findByText("PASSO_EMAIL")).toBeInTheDocument();
  });

  it("mostra o email, a validade do código e o campo de 9 dígitos", () => {
    renderPage(PENDING);

    expect(screen.getByText("ana@kianda.ao")).toBeInTheDocument();
    expect(screen.getByLabelText(/Código de verificação/)).toBeInTheDocument();
    expect(screen.getByText(/O código é válido até às/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Verificar código" })).toBeDisabled();
  });

  it("exige o código completo antes de chamar a API", async () => {
    renderPage(PENDING);

    fillCode("12345678");
    submit();

    expect(await screen.findByText("O código deve ter exatamente 9 dígitos.")).toBeInTheDocument();
    expect(serviceMocks.verifyResetOtp).not.toHaveBeenCalled();
  });
});

describe("ResetOtpPage — validação do código", () => {
  it("valida o código e segue para a nova senha, sem guardar o token", async () => {
    serviceMocks.verifyResetOtp.mockResolvedValueOnce({ message: "Código OTP válido" });

    renderPage(PENDING);
    fillCode("123456789");
    submit();

    expect(await screen.findByText("PASSO_SENHA")).toBeInTheDocument();
    expect(serviceMocks.verifyResetOtp).toHaveBeenCalledWith({
      email: "ana@kianda.ao",
      // O DTO do backend recebe `code` como inteiro.
      code: 123456789,
    });
  });

  it("mostra o código rejeitado (401) inline, sem toast", async () => {
    serviceMocks.verifyResetOtp.mockRejectedValueOnce(
      toLoginApiError(httpError(401, { success: false, message: "Código OTP inválido ou expirado" })),
    );

    renderPage(PENDING);
    fillCode("111111111");
    submit();

    // A mesma mensagem do backend aparece inline (campo) e no banner global,
    // tal como no passo 2 do login — mas nunca em toast.
    expect(await screen.findAllByText("Código OTP inválido ou expirado")).toHaveLength(2);
    expect(screen.getByText("Não foi possível validar o código")).toBeInTheDocument();
    expect(toastMocks.error).not.toHaveBeenCalled();
    expect(screen.queryByText("PASSO_SENHA")).not.toBeInTheDocument();
  });
});

describe("ResetOtpPage — reenvio do código", () => {
  it("reenvia pelo `recuver-password` e passa a mostrar o novo prazo", async () => {
    serviceMocks.requestPasswordReset.mockResolvedValueOnce({
      message: "Código OTP gerado e enviado ao seu email",
      expiresAt: "2026-09-30 10:45:00",
      otpId: "otp-2",
    });

    renderPage(PENDING);
    fireEvent.click(screen.getByRole("button", { name: /Reenviar código/ }));

    expect(await screen.findByText(/O código é válido até às 10:45/)).toBeInTheDocument();
    expect(serviceMocks.requestPasswordReset).toHaveBeenCalledWith("ana@kianda.ao");
    expect(toastMocks.success).toHaveBeenCalledWith("Novo código enviado", expect.anything());
    // Cooldown: evita reenvios em rajada depois do sucesso.
    expect(screen.getByRole("button", { name: /Reenviar em 30s/ })).toBeDisabled();
  });

  it("mostra o 422 do reenvio no banner, sem escrever no campo do código", async () => {
    serviceMocks.requestPasswordReset.mockRejectedValueOnce(
      toLoginApiError(httpError(422, validationErrorBody({ email: ["Email inexistente"] }))),
    );

    renderPage(PENDING);
    fireEvent.click(screen.getByRole("button", { name: /Reenviar código/ }));

    expect(await screen.findByText("Não foi possível reenviar o código")).toBeInTheDocument();
    expect(screen.getAllByText("Email inexistente")).toHaveLength(1);
    expect(toastMocks.error).not.toHaveBeenCalled();
  });
});
