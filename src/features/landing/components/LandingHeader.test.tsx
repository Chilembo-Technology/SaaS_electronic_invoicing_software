import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

/**
 * O header público tem de reagir à sessão sem nunca perder o link "Início".
 * O `AuthContext` é substituído por espiões (nenhum pedido HTTP é feito).
 */

const { authMocks } = vi.hoisted(() => ({
  authMocks: {
    user: { id: "user-1", name: "Ana Silva", email: "ana@kianda.ao", role: "Administrador" },
    isAuthenticated: false,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    isLoggingOut: false as boolean,
  },
}));

vi.mock("../../../contexts/AuthContext", () => ({ useAuth: () => authMocks }));

import { LandingHeader } from "./LandingHeader";

const renderHeader = (props: { hideAccountActions?: boolean } = {}) =>
  render(
    <MemoryRouter>
      <LandingHeader {...props} />
    </MemoryRouter>,
  );

describe("LandingHeader", () => {
  beforeEach(() => {
    authMocks.isAuthenticated = false;
    authMocks.isLoggingOut = false;
  });

  it('mostra o link "Início" sem sessão iniciada', () => {
    renderHeader();

    // O bloco mobile vive no DOM (apenas oculto por CSS), daí o `getAllByRole`.
    expect(screen.getAllByRole("link", { name: "Início" })[0]).toHaveAttribute("href", "/");
  });

  it("mantém as ações públicas quando não há sessão", () => {
    renderHeader();

    expect(screen.getAllByRole("link", { name: "Entrar" })[0]).toHaveAttribute("href", "/login");
    expect(screen.getAllByRole("link", { name: "Registar" })[0]).toHaveAttribute(
      "href",
      "/registar",
    );
    expect(screen.queryByTitle("Sair da Conta")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Ir para o Painel/ })).not.toBeInTheDocument();
  });

  it('com sessão iniciada mostra "Início", o nome, o botão de saída e o painel', () => {
    authMocks.isAuthenticated = true;
    renderHeader();

    expect(screen.getAllByRole("link", { name: "Início" })[0]).toHaveAttribute("href", "/");

    expect(screen.getAllByText("Ana Silva")[0]).toBeInTheDocument();
    expect(screen.getAllByTitle("Sair da Conta")[0]).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Ir para o Painel/ })[0]).toHaveAttribute(
      "href",
      "/dashboard",
    );

    expect(screen.queryByRole("link", { name: "Entrar" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Registar" })).not.toBeInTheDocument();
  });

  it("mostra o perfil, a saída e o painel por omissão", () => {
    authMocks.isAuthenticated = true;
    renderHeader();

    expect(screen.getAllByText("Administrador")[0]).not.toHaveAttribute("aria-hidden");
    expect(screen.getAllByTitle("Sair da Conta")[0]).not.toHaveAttribute("aria-hidden");
    expect(screen.getAllByText("Ir para o Painel")[0].closest("a")).not.toHaveAttribute(
      "aria-hidden",
    );
  });

  it("esconde o perfil, a saída e o painel quando as acções estão duplicadas", () => {
    authMocks.isAuthenticated = true;
    renderHeader({ hideAccountActions: true });

    // Continuam no DOM (a transição precisa deles), mas fora da árvore de
    // acessibilidade e sem interacção.
    expect(screen.getAllByText("Administrador")[0]).toHaveAttribute("aria-hidden", "true");
    expect(screen.getAllByTitle("Sair da Conta")[0]).toHaveAttribute("aria-hidden", "true");
    expect(screen.getAllByText("Ir para o Painel")[0].closest("a")).toHaveAttribute(
      "aria-hidden",
      "true",
    );

    // O avatar, o nome, o link "Início" e as restantes âncoras mantêm-se.
    expect(screen.getAllByText("AS")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Ana Silva")[0]).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Início" })[0]).not.toHaveAttribute("aria-hidden");
    expect(screen.getAllByText("Planos")[0]).toBeInTheDocument();
  });
});
