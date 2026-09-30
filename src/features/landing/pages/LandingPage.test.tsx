import { describe, expect, it, vi, beforeEach } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import { lastIntersectionObserver } from "../../../test/helpers";

/**
 * Comportamento de scroll da página inicial: enquanto a faixa "Sessão iniciada"
 * (Zona 2) está no ecrã, a navbar esconde o perfil, a saída e "Ir para Painel";
 * quando a faixa sai do ecrã, a navbar volta a mostrá-los.
 *
 * O `AuthContext` é substituído por espiões e o `IntersectionObserver` pelo mock
 * de `src/test/setup.ts` — nenhum pedido HTTP é feito e nada depende do scroll
 * real do jsdom.
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

/** Acções que a navbar só mostra quando a faixa "Sessão iniciada" sai do ecrã. */
const navbarActions = () => ({
  name: screen.getAllByText("Super Admin")[0],
  role: screen.getAllByText("super-admin")[0],
  logout: screen.getAllByTitle("Sair da Conta")[0],
  panel: screen.getAllByText("Ir para o Painel")[0].closest("a") as HTMLAnchorElement,
});

describe("LandingPage — navbar e scroll", () => {
  beforeEach(() => {
    authMocks.isAuthenticated = true;
    authMocks.isLoggingOut = false;
  });

  it("observa a faixa 'Sessão iniciada' (Zona 2)", () => {
    renderPage();

    expect(screen.getByText("Sessão iniciada")).toBeInTheDocument();
    expect(lastIntersectionObserver()?.elements[0]?.tagName).toBe("SECTION");
  });

  it("com a faixa no ecrã, a navbar fica só com o avatar", () => {
    renderPage();

    expect(navbarActions().name).toHaveAttribute("aria-hidden", "true");
    expect(navbarActions().role).toHaveAttribute("aria-hidden", "true");
    expect(navbarActions().logout).toHaveAttribute("aria-hidden", "true");
    expect(navbarActions().panel).toHaveAttribute("aria-hidden", "true");

    // O avatar e os links da navbar mantêm-se intactos.
    expect(screen.getAllByText("SA")[0]).toBeInTheDocument();
    expect(screen.getAllByText("SA")[0]).not.toHaveAttribute("aria-hidden");
    expect(screen.getAllByRole("link", { name: "Início" })[0]).not.toHaveAttribute("aria-hidden");
  });

  it("quando a faixa sai do ecrã, a navbar volta a mostrar tudo", () => {
    renderPage();

    act(() => lastIntersectionObserver()?.triggerVisibility(false));

    expect(navbarActions().name).not.toHaveAttribute("aria-hidden");
    expect(navbarActions().role).not.toHaveAttribute("aria-hidden");
    expect(navbarActions().logout).not.toHaveAttribute("aria-hidden");
    expect(navbarActions().panel).not.toHaveAttribute("aria-hidden");
  });

  it("ao voltar ao topo, a navbar esconde outra vez as acções", () => {
    renderPage();

    act(() => lastIntersectionObserver()?.triggerVisibility(false));
    act(() => lastIntersectionObserver()?.triggerVisibility(true));

    expect(navbarActions().name).toHaveAttribute("aria-hidden", "true");
    expect(navbarActions().logout).toHaveAttribute("aria-hidden", "true");
  });

  it("a secção 'Sessão iniciada' fica inalterada e continua a funcionar", () => {
    renderPage();

    expect(screen.getByText("Bem-vindo de volta,")).toBeInTheDocument();
    expect(screen.getByText("luischilembomateus@gmail.com")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ir para o Dashboard" })).toHaveAttribute(
      "href",
      "/dashboard",
    );
    expect(screen.getAllByRole("button", { name: "Sair da conta" })[0]).toBeInTheDocument();
  });

  it("sem sessão iniciada não há acções na navbar (nem faixa)", () => {
    authMocks.isAuthenticated = false;
    renderPage();

    expect(screen.queryByText("Sessão iniciada")).not.toBeInTheDocument();
    expect(screen.queryByTitle("Sair da Conta")).not.toBeInTheDocument();
    expect(screen.queryByText("Ir para o Painel")).not.toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Entrar" })[0]).toHaveAttribute("href", "/login");
  });
});
