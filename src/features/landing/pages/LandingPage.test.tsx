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

/**
 * Primeiro link com o texto indicado. Usa consultas por TEXTO e não por papel
 * acessível (`getByRole('link', { name })`): na landing page completa o jsdom
 * calcula o nome acessível de todos os elementos, o que tornava estes testes
 * lentos (até ~6 s com a suite em paralelo) e fazia o primeiro exceder o
 * limite de 5 s de forma intermitente.
 */
const linkWithText = (text: string) =>
  screen.getAllByText(text)[0].closest("a") as HTMLAnchorElement;

/** Acções de conta que a navbar mostra sempre com sessão iniciada. */
const navbarActions = () => ({
  name: screen.getAllByText("Super Admin")[0],
  role: screen.getAllByText("super-admin")[0],
  logout: screen.getAllByTitle("Sair da Conta")[0],
  panel: screen.getAllByText("Ir para o Painel")[0].closest("a") as HTMLAnchorElement,
});

/*
 * Cada teste faz o render da landing page COMPLETA (todas as secções): ~1 s
 * isolado no primeiro render, 3–4× mais com a suite em paralelo e a máquina
 * carregada. O limite por omissão (5 s) era excedido de forma intermitente
 * (2 em 10 execuções da suite). Os testes são determinísticos (sem datas,
 * timers nem pedidos); o limite reflecte só o custo do render.
 */
describe("LandingPage — navbar", { timeout: 15_000 }, () => {
  beforeEach(() => {
    authMocks.isAuthenticated = true;
    authMocks.isLoggingOut = false;
  });

  it("não mostra a faixa 'Sessão iniciada' nem o CTA 'Ir para o Dashboard'", () => {
    renderPage();

    expect(screen.queryByText("Sessão iniciada")).not.toBeInTheDocument();
    expect(screen.queryByText("luischilembomateus@gmail.com")).not.toBeInTheDocument();
    expect(screen.queryByText("Ir para o Dashboard")).not.toBeInTheDocument();
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
    expect(linkWithText("Início")).not.toHaveAttribute("aria-hidden");
  });

  it("sem sessão iniciada mostra as acções públicas e nenhuma acção de conta", () => {
    authMocks.isAuthenticated = false;
    renderPage();

    expect(screen.queryByText("Sessão iniciada")).not.toBeInTheDocument();
    expect(screen.queryByTitle("Sair da Conta")).not.toBeInTheDocument();
    expect(screen.queryByText("Ir para o Painel")).not.toBeInTheDocument();
    expect(linkWithText("Entrar")).toHaveAttribute("href", "/login");
  });
});
