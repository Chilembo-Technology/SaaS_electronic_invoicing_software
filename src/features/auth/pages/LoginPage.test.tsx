import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";

/**
 * Teste de integração da página de entrada (`/login`).
 *
 * O serviço de login, os toasts e o contexto de autenticação são substituídos
 * por espiões — nenhum pedido HTTP é feito e a navegação é observada por rotas
 * marcadoras.
 */

const { serviceMocks, toastMocks, authMocks } = vi.hoisted(() => ({
  serviceMocks: { requestOtp: vi.fn(), verifyOtp: vi.fn() },
  toastMocks: { success: vi.fn(), error: vi.fn() },
  authMocks: {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
  },
}));

vi.mock("../services/loginService", () => ({ loginService: serviceMocks }));
vi.mock("sonner", () => ({ toast: toastMocks }));
vi.mock("../../../contexts/AuthContext", () => ({ useAuth: () => authMocks }));

import { LoginPage } from "./LoginPage";
import { toLoginApiError } from "../utils/loginApiError";
import { API_ERROR_MESSAGES } from "../utils/apiError";
import { httpError, networkError, validationErrorBody } from "../../../test/helpers";
import { clearPendingLogin, readPendingLogin } from "../utils/otpSession";

function renderPage() {
  const utils = render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/verify-otp" element={<div>PASSO_OTP</div>} />
        <Route path="/dashboard" element={<div>PAINEL</div>} />
      </Routes>
    </MemoryRouter>,
  );

  return { ...utils, form: () => utils.container.querySelector("form") as HTMLFormElement };
}

/** Preenche os campos (inputs controlados do `FormField`). */
function fill(fields: { email?: string; password?: string }) {
  if (fields.email !== undefined) {
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: fields.email } });
  }
  if (fields.password !== undefined) {
    fireEvent.change(screen.getByLabelText(/Senha/), { target: { value: fields.password } });
  }
}

function submit() {
  fireEvent.submit(document.querySelector("form") as HTMLFormElement);
}

const VALID_CREDENTIALS = { email: "admin@kianda.ao", password: "segredo123" };

beforeEach(() => {
  clearPendingLogin();
  sessionStorage.clear();
});

describe("LoginPage — passo 1 (credenciais)", () => {
  it("apresenta o formulário e as ligações de apoio", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: "Entrar na sua conta" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Entrar/ })).toBeDisabled();
    expect(screen.getByRole("link", { name: /Esqueci-me da senha/ })).toHaveAttribute(
      "href",
      "/recuperar-senha",
    );
    expect(screen.getByRole("link", { name: /Criar conta/ })).toHaveAttribute("href", "/registar");
  });

  it("valida os campos obrigatórios com as mensagens do backend, sem chamar a API", async () => {
    renderPage();
    submit();

    expect(await screen.findByText("O e-mail é obrigatório.")).toBeInTheDocument();
    expect(screen.getByText("A senha é obrigatória.")).toBeInTheDocument();
    expect(serviceMocks.requestOtp).not.toHaveBeenCalled();
  });

  it("avisa de um email inválido depois do blur", async () => {
    renderPage();

    fill({ email: "sem-arroba" });
    fireEvent.blur(screen.getByLabelText(/Email/));

    expect(await screen.findByText("Informe um e-mail válido.")).toBeInTheDocument();
  });

  it("pede o OTP e segue para a validação do código", async () => {
    serviceMocks.requestOtp.mockResolvedValueOnce({
      message: "Código OTP gerado e enviado ao seu email",
      expiresAt: "2026-09-29 10:30:00",
      otpId: "otp-1",
    });

    renderPage();
    fill(VALID_CREDENTIALS);
    submit();

    expect(await screen.findByText("PASSO_OTP")).toBeInTheDocument();
    expect(serviceMocks.requestOtp).toHaveBeenCalledWith(VALID_CREDENTIALS);
    expect(toastMocks.success).toHaveBeenCalled();
    // O email fica guardado para o passo 2 (o `/verify-otp` volta a exigi-lo).
    expect(readPendingLogin()).toEqual({
      email: "admin@kianda.ao",
      expiresAt: "2026-09-29 10:30:00",
    });
  });
});

describe("LoginPage — erros da API", () => {
  it("mostra as credenciais inválidas (422) no banner, sem toast", async () => {
    serviceMocks.requestOtp.mockRejectedValueOnce(
      toLoginApiError(
        httpError(422, validationErrorBody({ error: ["As credenciais estão incorretas."] })),
      ),
    );

    renderPage();
    fill(VALID_CREDENTIALS);
    submit();

    expect(await screen.findByText("As credenciais estão incorretas.")).toBeInTheDocument();
    expect(toastMocks.error).not.toHaveBeenCalled();
    expect(screen.queryByText("PASSO_OTP")).not.toBeInTheDocument();
  });

  it("mostra o erro do campo quando o 422 identifica um campo", async () => {
    serviceMocks.requestOtp.mockRejectedValueOnce(
      toLoginApiError(httpError(422, validationErrorBody({ email: ["Conta inactiva/inexistente"] }))),
    );

    renderPage();
    fill(VALID_CREDENTIALS);
    submit();

    expect(await screen.findByText("Conta inactiva/inexistente")).toBeInTheDocument();
  });

  it("mostra toast e banner numa falha de servidor (500)", async () => {
    serviceMocks.requestOtp.mockRejectedValueOnce(
      toLoginApiError(httpError(500, { message: "Server Error" })),
    );

    renderPage();
    fill(VALID_CREDENTIALS);
    submit();

    expect(
      await screen.findByText("Não foi possível concluir a operação. Tente novamente dentro de instantes."),
    ).toBeInTheDocument();
    expect(toastMocks.error).toHaveBeenCalledWith(
      "Não foi possível concluir a operação. Tente novamente dentro de instantes.",
    );
  });

  it("avisa do rate limit (429) com o tempo de espera", async () => {
    serviceMocks.requestOtp.mockRejectedValueOnce(
      toLoginApiError(httpError(429, { message: "Too Many Attempts.", retry_after: 90 })),
    );

    renderPage();
    fill(VALID_CREDENTIALS);
    submit();

    expect(await screen.findByText(/Tente novamente em 2 minutos/)).toBeInTheDocument();
    expect(screen.getByText("Demasiadas tentativas")).toBeInTheDocument();
    expect(toastMocks.error).toHaveBeenCalledWith("Too Many Attempts.");
  });

  it("trata a falha de rede com a mensagem própria e toast", async () => {
    serviceMocks.requestOtp.mockRejectedValueOnce(toLoginApiError(networkError()));

    renderPage();
    fill(VALID_CREDENTIALS);
    submit();

    expect(await screen.findByText(API_ERROR_MESSAGES.network)).toBeInTheDocument();
    expect(toastMocks.error).toHaveBeenCalledWith(API_ERROR_MESSAGES.network);
  });
});
