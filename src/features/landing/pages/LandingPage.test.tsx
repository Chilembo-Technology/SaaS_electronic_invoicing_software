import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

/**
 * A página inicial mostra sempre as ações de conta na navbar quando há sessão
 * (nome, perfil, "Sair da Conta" e "Ir para o Painel"). Já não existe faixa de
 * boas-vindas no conteúdo nem qualquer comportamento ligado ao scroll.
 *
 * O `AuthContext` é substituído por espiões — nenhum pedido HTTP é feito.
 */

const { authMocks } = vi.hoisted(() => ({
  authMocks: {
    user: {
      id: "user-1",
      name: "Super Admin",
      email: "luischilembomateus@gmail.com",
      role: "super-admin",
    },
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    isLoggingOut: false as boolean,
  },
}));

vi.mock("../../../contexts/AuthContext", () => ({ useAuth: () => authMocks }));

import { LandingPage } from "./LandingPage";

const renderPage = () =>
  render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  );

/** Acções de conta que a navbar mostra sempre com sessão iniciada. */
const navbarActions = () => ({
  name: screen.getAllByText("Super Admin")[0],
  role: screen.getAllByText("super-admin")[0],
  logout: screen.getAllByTitle("Sair da Conta")[0],
  panel: screen.getAllByText("Ir para o Painel")[0].closest("a") as HTMLAnchorElement,
});

describe("LandingPage — navbar", () => {
  beforeEach(() => {
    authMocks.isAuthenticated = true;
    authMocks.isLoggingOut = false;
  });

  it("não mostra a faixa 'Sessão iniciada' nem o CTA 'Ir para o Dashboard'", () => {
    renderPage();

    expect(screen.queryByText("Sessão iniciada")).not.toBeInTheDocument();
    expect(screen.queryByText("luischilembomateus@gmail.com")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Ir para o Dashboard" })).not.toBeInTheDocument();
  });

  it("mostra sempre o nome, o perfil, a saída e o painel na navbar", () => {
    renderPage();

    expect(navbarActions().name).not.toHaveAttribute("aria-hidden");
    expect(navbarActions().role).not.toHaveAttribute("aria-hidden");
    expect(navbarActions().logout).not.toHaveAttribute("aria-hidden");
    expect(navbarActions().panel).not.toHaveAttribute("aria-hidden");
    expect(navbarActions().panel).toHaveAttribute("href", "/dashboard");

    // O avatar e os links da navbar mantêm-se intactos.
    expect(screen.getAllByText("SA")[0]).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Início" })[0]).not.toHaveAttribute("aria-hidden");
  });

  it("sem sessão iniciada mostra as acções públicas e nenhuma acção de conta", () => {
    authMocks.isAuthenticated = false;
    renderPage();

    expect(screen.queryByText("Sessão iniciada")).not.toBeInTheDocument();
    expect(screen.queryByTitle("Sair da Conta")).not.toBeInTheDocument();
    expect(screen.queryByText("Ir para o Painel")).not.toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Entrar" })[0]).toHaveAttribute("href", "/login");
  });
});
