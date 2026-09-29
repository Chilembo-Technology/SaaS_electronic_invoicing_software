import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

/**
 * O aviso de demonstração só deve aparecer em desenvolvimento ou quando o build
 * o pede (`VITE_SHOW_DEMO_NOTICE=true`) — nunca em produção.
 */
const env = vi.hoisted(() => ({ show: true }));

vi.mock("../utils/demoNotice", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../utils/demoNotice")>();
  return {
    ...actual,
    get shouldShowDemoNotice() {
      return env.show;
    },
  };
});

import { LandingFooter } from "./LandingFooter";

const renderFooter = () =>
  render(
    <MemoryRouter>
      <LandingFooter />
    </MemoryRouter>,
  );

describe("LandingFooter", () => {
  it("mostra o aviso discreto quando o aviso está activo", () => {
    env.show = true;
    renderFooter();

    expect(
      screen.getByText("Conteúdo de demonstração. Sem valor fiscal nem comercial."),
    ).toBeInTheDocument();
  });

  it("esconde o aviso (e o texto antigo) quando está em produção", () => {
    env.show = false;
    renderFooter();

    expect(screen.queryByText(/Conteúdo de demonstração/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Ambiente de demonstração/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/fictícios/i)).not.toBeInTheDocument();
  });

  it("mostra sempre os direitos de autor e a nota de conformidade com a AGT", () => {
    env.show = false;
    renderFooter();

    expect(screen.getByText(/CHILEMBO TECHNOLOGY/)).toBeInTheDocument();
    expect(screen.getByText(/regras da AGT/i)).toBeInTheDocument();
  });

  it("encaminha para o registo e para o login", () => {
    renderFooter();

    expect(screen.getByRole("link", { name: "Criar conta" })).toHaveAttribute("href", "/registar");
    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "Recuperar senha" })).toHaveAttribute(
      "href",
      "/recuperar-senha",
    );
  });
});
