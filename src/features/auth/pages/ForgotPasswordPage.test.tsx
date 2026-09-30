import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";

/**
 * Teste de integração do ecrã 1 da recuperação de palavra-passe
 * (`/recuperar-senha`).
 *
 * O serviço e os toasts são substituídos por espiões — nenhum pedido HTTP é
 * feito e a navegação é observada por rotas marcadoras.
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

import { ForgotPasswordPage } from "./ForgotPasswordPage";
import { toLoginApiError } from "../utils/loginApiError";
import { LOGIN_API_MESSAGES } from "../utils/loginApiError";
import { API_ERROR_MESSAGES } from "../utils/apiError";
import { httpError, networkError, validationErrorBody } from "../../../test/helpers";

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/recuperar-senha"]}>
      <Routes>
        <Route path="/recuperar-senha" element={<ForgotPasswordPage />} />
        <Route path="/recuperar-senha/verificar-codigo" element={<div>PASSO_CODIGO</div>} />
        <Route path="/login" element={<div>PAGINA_LOGIN</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

function fillEmail(email: string) {
  fireEvent.change(screen.getByLabelText(/Email/), { target: { value: email } });
}

function submit() {
  fireEvent.submit(document.querySelector("form") as HTMLFormElement);
}

describe("ForgotPasswordPage — formulário", () => {
  it("apresenta o pedido de código e as ligações de apoio", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: "Recuperar palavra-passe" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Enviar código/ })).toBeDisabled();
    // O texto fala do CÓDIGO (não de um "link de recuperação"): é o que o backend envia.
    expect(screen.getByText(/9 dígitos/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Voltar ao login/ })).toHaveAttribute("href", "/login");
  });

  it("valida o email obrigatório sem chamar a API", async () => {
    renderPage();
    submit();

    expect(await screen.findByText("O campo email é obrigatório.")).toBeInTheDocument();
    expect(serviceMocks.requestPasswordReset).not.toHaveBeenCalled();
  });

  it("avisa de um email inválido depois do blur", async () => {
    renderPage();

    fillEmail("sem-arroba");
    fireEvent.blur(screen.getByLabelText(/Email/));

    expect(
      await screen.findByText("O campo email deve ser um endereço de email válido."),
    ).toBeInTheDocument();
  });

  it("pede o código e segue para a validação do OTP", async () => {
    serviceMocks.requestPasswordReset.mockResolvedValueOnce({
      message: "Código OTP gerado e enviado ao seu email",
      expiresAt: "2026-09-30 10:30:00",
      otpId: "otp-1",
    });

    renderPage();
    fillEmail(" Ana@Kianda.AO ");
    submit();

    expect(await screen.findByText("PASSO_CODIGO")).toBeInTheDocument();
    expect(serviceMocks.requestPasswordReset).toHaveBeenCalledWith("ana@kianda.ao");
    expect(toastMocks.success).toHaveBeenCalledWith("Código enviado", expect.anything());
  });
});

describe("ForgotPasswordPage — erros da API", () => {
  it("mostra o 422 do email inexistente INLINE no campo, sem toast", async () => {
    serviceMocks.requestPasswordReset.mockRejectedValueOnce(
      toLoginApiError(httpError(422, validationErrorBody({ email: ["Email inexistente"] }))),
    );

    renderPage();
    fillEmail("naoexiste@kianda.ao");
    submit();

    expect(await screen.findByText("Email inexistente")).toBeInTheDocument();
    expect(toastMocks.error).not.toHaveBeenCalled();
    // Sem código enviado, o utilizador não avança de passo.
    expect(screen.queryByText("PASSO_CODIGO")).not.toBeInTheDocument();
  });

  it("mostra toast e banner numa falha de servidor (500)", async () => {
    serviceMocks.requestPasswordReset.mockRejectedValueOnce(
      toLoginApiError(httpError(500, { message: "Server Error" })),
    );

    renderPage();
    fillEmail("ana@kianda.ao");
    submit();

    expect(await screen.findByText(LOGIN_API_MESSAGES.server)).toBeInTheDocument();
    expect(toastMocks.error).toHaveBeenCalledWith(LOGIN_API_MESSAGES.server);
  });

  it("trata a falha de rede com a mensagem própria e toast", async () => {
    serviceMocks.requestPasswordReset.mockRejectedValueOnce(toLoginApiError(networkError()));

    renderPage();
    fillEmail("ana@kianda.ao");
    submit();

    expect(await screen.findByText(API_ERROR_MESSAGES.network)).toBeInTheDocument();
    expect(toastMocks.error).toHaveBeenCalledWith(API_ERROR_MESSAGES.network);
  });

  it("avisa do rate limit (429) com o tempo de espera", async () => {
    serviceMocks.requestPasswordReset.mockRejectedValueOnce(
      toLoginApiError(httpError(429, { message: "Too Many Attempts.", retry_after: 90 })),
    );

    renderPage();
    fillEmail("ana@kianda.ao");
    submit();

    expect(await screen.findByText("Demasiadas tentativas")).toBeInTheDocument();
    expect(screen.getByText(/Tente novamente em 2 minutos\./)).toBeInTheDocument();
  });
});
