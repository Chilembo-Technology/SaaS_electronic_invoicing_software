import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

/**
 * Testes do bloco de conta (`UserMenu`) usado pelo header público e pela faixa
 * de boas-vindas da página inicial.
 *
 * É o único ponto destas páginas que chama o `logout` do `AuthContext` — o mesmo
 * caminho da sidebar (`Layout`). O contexto é substituído por espiões: nenhum
 * pedido HTTP é feito.
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

vi.mock("../contexts/AuthContext", () => ({ useAuth: () => authMocks }));

import { UserMenu } from "./UserMenu";

describe("UserMenu", () => {
  beforeEach(() => {
    authMocks.isLoggingOut = false;
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  it("mostra as iniciais, o nome e o perfil do utilizador (como na sidebar)", () => {
    render(<UserMenu />);

    expect(screen.getByText("AS")).toBeInTheDocument();
    expect(screen.getByText("Ana Silva")).toBeInTheDocument();
    expect(screen.getByText("Administrador")).toBeInTheDocument();
  });

  it("confirma antes de sair e delega no logout do contexto", () => {
    render(<UserMenu />);

    fireEvent.click(screen.getByTitle("Sair da Conta"));

    expect(window.confirm).toHaveBeenCalledWith("Tem a certeza que quer sair da conta?");
    expect(authMocks.logout).toHaveBeenCalledTimes(1);
  });

  it("não termina a sessão quando a confirmação é cancelada", () => {
    vi.mocked(window.confirm).mockReturnValue(false);
    render(<UserMenu />);

    fireEvent.click(screen.getByTitle("Sair da Conta"));

    expect(authMocks.logout).not.toHaveBeenCalled();
  });

  it('mostra "A sair..." e desactiva o botão enquanto o logout decorre', () => {
    authMocks.isLoggingOut = true;
    render(<UserMenu logoutLabel="Sair da conta" />);

    const botao = screen.getByTitle("Sair da Conta");
    expect(botao).toBeDisabled();
    expect(botao.querySelector("svg.animate-spin")).toBeTruthy();
    expect(screen.getByText("A sair...")).toBeInTheDocument();
  });

  it("avisa quem o usa depois de a saída ser confirmada (ex.: fechar o menu mobile)", () => {
    const onLogoutConfirmed = vi.fn();
    render(<UserMenu logoutLabel="Sair da conta" onLogoutConfirmed={onLogoutConfirmed} />);

    fireEvent.click(screen.getByTitle("Sair da Conta"));

    expect(onLogoutConfirmed).toHaveBeenCalledTimes(1);
  });

  it("esconde o nome, o perfil e a saída quando `hideActions` está ligado (fica o avatar)", () => {
    render(<UserMenu hideActions />);

    expect(screen.getByText("AS")).toBeInTheDocument();
    expect(screen.getByText("AS")).not.toHaveAttribute("aria-hidden");
    expect(screen.getByText("Ana Silva")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("Administrador")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByTitle("Sair da Conta")).toHaveAttribute("aria-hidden", "true");
  });

  it("pode ser usado sem a identidade (apenas o botão de saída)", () => {
    render(<UserMenu logoutLabel="Sair da conta" showIdentity={false} />);

    expect(screen.queryByText("Ana Silva")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sair da conta" })).toBeInTheDocument();
  });
});
