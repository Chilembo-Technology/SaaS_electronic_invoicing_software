import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";

/**
 * Teste de integração do ecrã 3 da recuperação de palavra-passe
 * (`/recuperar-senha/nova-senha`).
 *
 * O email chega pelo `state` do React Router; o serviço e os toasts são
 * substituídos por espiões.
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

import { NewPasswordPage } from "./NewPasswordPage";
import { toLoginApiError } from "../utils/loginApiError";
import { LOGIN_API_MESSAGES } from "../utils/loginApiError";
import { httpError, validationErrorBody } from "../../../test/helpers";

const PENDING = { email: "ana@kianda.ao", expiresAt: "2026-09-30 10:30:00" };

function renderPage(state?: unknown) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: "/recuperar-senha/nova-senha", state }]}>
      <Routes>
        <Route path="/recuperar-senha" element={<div>PASSO_EMAIL</div>} />
        <Route path="/recuperar-senha/nova-senha" element={<NewPasswordPage />} />
        <Route path="/login" element={<div>PAGINA_LOGIN</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

function fill(passwords: { password?: string; confirmPassword?: string }) {
  if (passwords.password !== undefined) {
    fireEvent.change(screen.getByLabelText(/Nova senha/), { target: { value: passwords.password } });
  }
  if (passwords.confirmPassword !== undefined) {
    fireEvent.change(screen.getByLabelText(/Confirmar senha/), {
      target: { value: passwords.confirmPassword },
    });
  }
}

function submit() {
  fireEvent.submit(document.querySelector("form") as HTMLFormElement);
}

describe("NewPasswordPage — formulário", () => {
  it("volta ao ecrã 1 quando não há pedido de recuperação em curso", async () => {
    renderPage();

    expect(await screen.findByText("PASSO_EMAIL")).toBeInTheDocument();
  });

  it("mostra o email e os dois campos de senha", () => {
    renderPage(PENDING);

    expect(screen.getByText(/ana@kianda.ao/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nova senha/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirmar senha/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Alterar palavra-passe" })).toBeDisabled();
  });

  it("impõe o comprimento mínimo sem chamar a API", async () => {
    renderPage(PENDING);
    fill({ password: "curta", confirmPassword: "curta" });
    submit();

    expect(
      await screen.findByText("A senha deve ter pelo menos 8 caracteres."),
    ).toBeInTheDocument();
    expect(serviceMocks.submitNewPassword).not.toHaveBeenCalled();
  });

  it("avisa quando as senhas não coincidem, sem chamar a API", async () => {
    renderPage(PENDING);
    fill({ password: "segredo123", confirmPassword: "segredo124" });
    submit();

    expect(await screen.findByText("As senhas não coincidem.")).toBeInTheDocument();
    expect(serviceMocks.submitNewPassword).not.toHaveBeenCalled();
  });
});

describe("NewPasswordPage — alteração da senha", () => {
  it("altera a senha, mostra o toast e volta ao login", async () => {
    serviceMocks.submitNewPassword.mockResolvedValueOnce({
      message: "Nova senha definida com sucesso",
    });

    renderPage(PENDING);
    fill({ password: "segredo123", confirmPassword: "segredo123" });
    submit();

    expect(await screen.findByText("PAGINA_LOGIN")).toBeInTheDocument();
    // Só `password` é enviado (o serviço traduz para `new_password` no wire).
    expect(serviceMocks.submitNewPassword).toHaveBeenCalledWith({
      email: "ana@kianda.ao",
      password: "segredo123",
    });
    expect(toastMocks.success).toHaveBeenCalledWith(
      "Palavra-passe alterada com sucesso",
      expect.anything(),
    );
  });

  it("mostra o 422 do backend no campo da senha (`new_password` traduzido)", async () => {
    serviceMocks.submitNewPassword.mockRejectedValueOnce(
      toLoginApiError(
        httpError(422, validationErrorBody({ new_password: ["O campo senha é obrigatorio."] })),
      ),
    );

    renderPage(PENDING);
    fill({ password: "segredo123", confirmPassword: "segredo123" });
    submit();

    expect(await screen.findByText("O campo senha é obrigatorio.")).toBeInTheDocument();
    expect(screen.queryByText("PAGINA_LOGIN")).not.toBeInTheDocument();
  });

  it("mostra toast e banner numa falha de servidor (500)", async () => {
    serviceMocks.submitNewPassword.mockRejectedValueOnce(
      toLoginApiError(httpError(500, { message: "Server Error" })),
    );

    renderPage(PENDING);
    fill({ password: "segredo123", confirmPassword: "segredo123" });
    submit();

    expect(await screen.findByText(LOGIN_API_MESSAGES.server)).toBeInTheDocument();
    expect(toastMocks.error).toHaveBeenCalledWith(LOGIN_API_MESSAGES.server);
  });
});
