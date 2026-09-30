import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

/**
 * A faixa de boas-vindas só existe com sessão iniciada: sem sessão a página
 * inicial (deslogada) tem de ficar exactamente como estava.
 *
 * Tal como em `Layout.test.tsx`, o `AuthContext` é substituído por espiões.
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

import { WelcomeBackSection } from "./WelcomeBackSection";

const renderSection = () =>
  render(
    <MemoryRouter>
      <WelcomeBackSection />
    </MemoryRouter>,
  );

describe("WelcomeBackSection", () => {
  beforeEach(() => {
    authMocks.isAuthenticated = false;
    authMocks.isLoggingOut = false;
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  it("não renderiza nada sem sessão iniciada", () => {
    const { container } = renderSection();

    expect(container).toBeEmptyDOMElement();
  });

  it("cumprimenta o utilizador pelo nome e mostra o e-mail", () => {
    authMocks.isAuthenticated = true;
    renderSection();

    expect(screen.getByText("Bem-vindo de volta,")).toBeInTheDocument();
    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(screen.getByText("ana@kianda.ao")).toBeInTheDocument();
  });

  it("liga ao dashboard e permite sair da conta", () => {
    authMocks.isAuthenticated = true;
    renderSection();

    expect(screen.getByRole("link", { name: "Ir para o Dashboard" })).toHaveAttribute(
      "href",
      "/dashboard",
    );

    fireEvent.click(screen.getByTitle("Sair da Conta"));

    expect(window.confirm).toHaveBeenCalledWith("Tem a certeza que quer sair da conta?");
    expect(authMocks.logout).toHaveBeenCalledTimes(1);
  });

  it("liga o `sectionRef` ao `<section>` da faixa (observado pela navbar)", () => {
    authMocks.isAuthenticated = true;
    const sectionRef: { current: HTMLElement | null } = { current: null };

    render(
      <MemoryRouter>
        <WelcomeBackSection sectionRef={sectionRef} />
      </MemoryRouter>,
    );

    expect(sectionRef.current?.tagName).toBe("SECTION");
  });
});
