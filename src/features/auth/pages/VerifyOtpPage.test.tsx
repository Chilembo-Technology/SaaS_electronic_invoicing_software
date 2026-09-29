import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";

/**
 * Teste de integração da página de validação do código OTP
 * (`/login/verify-otp`), incluindo o encaminhamento de quem chega sem pedido
 * de OTP em curso. Serviço, toasts e contexto estão substituídos por espiões.
 */

const { serviceMocks, toastMocks, authMocks } = vi.hoisted(() => ({
  serviceMocks: { requestOtp: vi.fn(), verifyOtp: vi.fn() },
  toastMocks: { success: vi.fn(), error: vi.fn() },
  authMocks: { user: null, isAuthenticated: false, isLoading: false, login: vi.fn(), logout: vi.fn() },
}));

vi.mock("../services/loginService", () => ({ loginService: serviceMocks }));
vi.mock("sonner", () => ({ toast: toastMocks }));
vi.mock("../../../contexts/AuthContext", () => ({ useAuth: () => authMocks }));

import { VerifyOtpPage } from "./VerifyOtpPage";
import { toLoginApiError } from "../utils/loginApiError";
import { httpError } from "../../../test/helpers";
import { clearPendingLogin, savePendingLogin } from "../utils/otpSession";
import type { AuthenticatedSession } from "../types/login";

const SESSION: AuthenticatedSession = {
  token: "jwt-token",
  tokenType: "bearer",
  expiresIn: 3600,
  expiresAt: "2026-09-29 11:30:00",
  message: "Código OTP válido",
  user: { id: "user-1", name: "Ana Silva", email: "ana@kianda.ao" },
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/login/verify-otp"]}>
      <Routes>
        <Route path="/login" element={<div>PAGINA_LOGIN</div>} />
        <Route path="/login/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/dashboard" element={<div>PAINEL</div>} />
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

function startPendingLogin() {
  savePendingLogin(
    { email: "ana@kianda.ao", password: "segredo123" },
    "2026-09-29 10:30:00",
  );
}

beforeEach(() => {
  clearPendingLogin();
  sessionStorage.clear();
});

describe("VerifyOtpPage — acesso e formulário", () => {
  it("volta ao login quando não há pedido de OTP em curso", async () => {
    renderPage();

    expect(await screen.findByText("PAGINA_LOGIN")).toBeInTheDocument();
  });

  it("mostra o email do pedido em curso e o campo de 9 dígitos", () => {
    startPendingLogin();
    renderPage();

    expect(screen.getByText("ana@kianda.ao")).toBeInTheDocument();
    expect(screen.getByLabelText(/Código de verificação/)).toBeInTheDocument();
    // A expiração devolvida pelo `/login` é mostrada ao utilizador.
    expect(screen.getByText(/O código é válido até às/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Validar código" })).toBeDisabled();
  });

  it("exige o código completo antes de chamar a API", async () => {
    startPendingLogin();
    renderPage();

    fillCode("12345678");
    submit();

    expect(await screen.findByText("O código deve ter exatamente 9 dígitos.")).toBeInTheDocument();
    expect(serviceMocks.verifyOtp).not.toHaveBeenCalled();
  });
});

describe("VerifyOtpPage — validação e sessão", () => {
  it("valida o código, guarda a sessão e segue para o painel", async () => {
    startPendingLogin();
    serviceMocks.verifyOtp.mockResolvedValueOnce(SESSION);
    renderPage();

    fillCode("123456789");
    submit();

    expect(await screen.findByText("PAINEL")).toBeInTheDocument();
    expect(serviceMocks.verifyOtp).toHaveBeenCalledWith({
      email: "ana@kianda.ao",
      code: 123456789,
    });
    expect(authMocks.login).toHaveBeenCalledWith("jwt-token", SESSION.user);
    expect(toastMocks.success).toHaveBeenCalledWith(
      "Sessão iniciada",
      expect.objectContaining({ description: expect.stringContaining("Ana Silva") }),
    );
  });

  it("mostra o código inválido/expirado (401) junto ao campo, sem toast", async () => {
    startPendingLogin();
    serviceMocks.verifyOtp.mockRejectedValueOnce(
      toLoginApiError(httpError(401, { success: false, message: "Código OTP inválido ou expirado" })),
    );
    renderPage();

    fillCode("111111111");
    submit();

    // Uma vez inline (FieldError) e outra no banner global.
    expect(await screen.findAllByText("Código OTP inválido ou expirado")).toHaveLength(2);
    expect(toastMocks.error).not.toHaveBeenCalled();
    expect(authMocks.login).not.toHaveBeenCalled();
  });

  it("reenvia o código com as credenciais guardadas em memória", async () => {
    startPendingLogin();
    serviceMocks.requestOtp.mockResolvedValueOnce({
      message: "Código OTP gerado e enviado ao seu email",
      expiresAt: "2026-09-29 10:45:00",
      otpId: "otp-2",
    });
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: /Reenviar código/ }));

    expect(await screen.findByText(/O código é válido até às/)).toBeInTheDocument();
    expect(serviceMocks.requestOtp).toHaveBeenCalledWith({
      email: "ana@kianda.ao",
      password: "segredo123",
    });
    expect(toastMocks.success).toHaveBeenCalledWith("Novo código enviado", expect.anything());
  });

  it("desactiva o reenvio quando as credenciais se perderam (página recarregada)", async () => {
    // Simula uma recarga: o email sobrevive em sessionStorage, as credenciais não.
    sessionStorage.setItem("@Chilembo:pending-login-email", "ana@kianda.ao");
    renderPage();

    expect(screen.getByRole("button", { name: /Reenviar código/ })).toBeDisabled();
    expect(screen.getByText(/O reenvio exige a introdução das credenciais/)).toBeInTheDocument();
  });
});
