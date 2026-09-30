import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";

/**
 * Testes da sidebar (`Layout`) — o botão "Sair da Conta" tem de chamar o
 * `logout` do `AuthContext` (que avisa o backend). O contexto é substituído por
 * espiões: nenhum pedido HTTP é feito e o redireccionamento não é tocado.
 */

const { authMocks } = vi.hoisted(() => ({
  authMocks: {
    user: { id: "user-1", name: "Ana Silva", email: "ana@kianda.ao", role: "Administrador" },
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    isLoggingOut: false as boolean,
  },
}));

vi.mock("../../contexts/AuthContext", () => ({ useAuth: () => authMocks }));

import { Layout } from "./Layout";

function renderLayout() {
  return render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<div>PAINEL</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

/** Abre o menu mobile (o único botão com o ícone `Menu`), onde vive o 2.º "Sair". */
function abrirMenuMobile(container: HTMLElement) {
  const icone = container.querySelector("svg.lucide-menu") as SVGElement | null;
  const toggle = icone?.closest("button") as HTMLButtonElement | null;

  if (!toggle) throw new Error("Botão do menu mobile não encontrado");

  fireEvent.click(toggle);
}

describe('Layout — botão "Sair da Conta"', () => {
  beforeEach(() => {
    authMocks.isLoggingOut = false;
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  it("chama o logout do contexto depois de o utilizador confirmar", () => {
    renderLayout();

    fireEvent.click(screen.getByTitle("Sair da Conta"));

    expect(window.confirm).toHaveBeenCalledWith("Tem a certeza que quer sair da conta?");
    expect(authMocks.logout).toHaveBeenCalledTimes(1);
  });

  it("não termina a sessão quando a confirmação é cancelada", () => {
    vi.mocked(window.confirm).mockReturnValue(false);
    renderLayout();

    fireEvent.click(screen.getByTitle("Sair da Conta"));

    expect(authMocks.logout).not.toHaveBeenCalled();
  });

  it("mostra 'A sair...' e desactiva o botão enquanto o logout decorre", () => {
    authMocks.isLoggingOut = true;
    const { container } = renderLayout();

    const botaoDesktop = screen.getByTitle("Sair da Conta");
    expect(botaoDesktop).toBeDisabled();
    expect(botaoDesktop.querySelector("svg.animate-spin")).toBeTruthy();

    abrirMenuMobile(container);
    expect(screen.getByText("A sair...")).toBeInTheDocument();

    const botaoMobile = screen.getByText("A sair...").closest("button") as HTMLButtonElement;
    expect(botaoMobile).toBeDisabled();
  });

  it("o botão do menu mobile está ligado ao mesmo logout", () => {
    const { container } = renderLayout();

    abrirMenuMobile(container);
    fireEvent.click(screen.getByText("Sair da Conta (ana@kianda.ao)"));

    expect(authMocks.logout).toHaveBeenCalledTimes(1);
  });
});
