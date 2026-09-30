import { describe, expect, it, vi, beforeEach } from "vitest";
import { act, render, screen } from "@testing-library/react";

/**
 * Testes da sessão (`AuthContext`) — o logout ligado ao backend.
 *
 * `authService` é substituído por espiões: nenhum pedido HTTP é feito. O
 * redireccionamento usa `window.location`, que o jsdom expõe como propriedade
 * [LegacyUnforgeable] (`configurable: false`) — não é substituível nem
 * observável como URL —, pelo que a tentativa de navegação é detectada pelo
 * erro que o jsdom publica no virtual console ("Not implemented: navigation").
 */

const { mocks } = vi.hoisted(() => ({
  mocks: { logout: vi.fn(), getProfile: vi.fn() },
}));

vi.mock("../services/authService", () => ({ authService: mocks }));

import { AuthProvider, useAuth } from "./AuthContext";
import { LEGACY_TOKEN_KEY, TOKEN_KEY, getStoredToken } from "../lib/api";
import type { User } from "../types/api";

/** Chave da sessão de OTP pendente (`features/auth/utils/otpSession.ts`). */
const PENDING_EMAIL_KEY = "@Chilembo:pending-login-email";

const UTILIZADOR: User = { id: "user-1", name: "Ana Silva", email: "ana@kianda.ao" };

/** Estado observável do contexto dentro do teste. */
function SessionProbe() {
  const { user, isAuthenticated, isLoggingOut, login, logout } = useAuth();

  return (
    <div>
      <span data-testid="nome">{user?.name ?? "sem-sessao"}</span>
      <span data-testid="autenticado">{String(isAuthenticated)}</span>
      <span data-testid="a-sair">{String(isLoggingOut)}</span>
      <button type="button" onClick={() => login("jwt-abc", UTILIZADOR)}>
        entrar
      </button>
      <button type="button" onClick={logout}>
        sair
      </button>
    </div>
  );
}

function renderSessao() {
  return render(
    <AuthProvider>
      <SessionProbe />
    </AuthProvider>,
  );
}

/** Abre a sessão pelo mesmo caminho da `VerifyOtpPage`. */
function entrar() {
  act(() => {
    fireEventClick("entrar");
  });
}

function fireEventClick(label: string) {
  (screen.getByText(label) as HTMLButtonElement).click();
}

/** Promessa cujo desfecho o teste controla (para observar o pedido em curso). */
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((resolver) => {
    resolve = resolver;
  });

  return { promise, resolve };
}

/** Tentativas de navegação registadas pelo jsdom (o `window.location` é imutável). */
function tentativasDeNavegacao(): string[] {
  return consoleError.mock.calls
    .map(([first]) => String(first))
    .filter((mensagem) => mensagem.includes("Not implemented: navigation"));
}

let consoleError: ReturnType<typeof vi.spyOn>;

describe("AuthContext.logout", () => {
  beforeEach(() => {
    sessionStorage.clear();
    consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  it("avisa o backend, limpa a sessão local e tenta voltar a /login", async () => {
    sessionStorage.setItem(PENDING_EMAIL_KEY, "ana@kianda.ao");
    mocks.logout.mockResolvedValueOnce(undefined);
    renderSessao();
    entrar();
    expect(getStoredToken()).toBe("jwt-abc");

    await act(async () => {
      fireEventClick("sair");
    });

    expect(mocks.logout).toHaveBeenCalledTimes(1);
    expect(getStoredToken()).toBeNull();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(LEGACY_TOKEN_KEY)).toBeNull();
    // A sessão de OTP pendente não deve sobreviver ao logout.
    expect(sessionStorage.getItem(PENDING_EMAIL_KEY)).toBeNull();
    expect(screen.getByTestId("nome")).toHaveTextContent("sem-sessao");
    expect(screen.getByTestId("autenticado")).toHaveTextContent("false");
    expect(screen.getByTestId("a-sair")).toHaveTextContent("false");
    expect(tentativasDeNavegacao()).toHaveLength(1);
  });

  it("mantém o token e o estado 'A sair...' enquanto o backend não responde", async () => {
    const pedido = deferred();
    mocks.logout.mockReturnValueOnce(pedido.promise);
    renderSessao();
    entrar();

    act(() => {
      fireEventClick("sair");
    });

    // O token ainda está guardado: é ele que segue no `Authorization` do pedido.
    expect(mocks.logout).toHaveBeenCalledTimes(1);
    expect(getStoredToken()).toBe("jwt-abc");
    expect(screen.getByTestId("a-sair")).toHaveTextContent("true");
    expect(screen.getByTestId("autenticado")).toHaveTextContent("true");

    await act(async () => {
      pedido.resolve();
      await pedido.promise;
    });

    expect(getStoredToken()).toBeNull();
    expect(screen.getByTestId("a-sair")).toHaveTextContent("false");
    expect(screen.getByTestId("autenticado")).toHaveTextContent("false");
  });

  it("sai na mesma quando o backend falha (500/401/rede)", async () => {
    mocks.logout.mockRejectedValueOnce(new Error("Request failed with status code 500"));
    renderSessao();
    entrar();

    await act(async () => {
      fireEventClick("sair");
    });

    expect(getStoredToken()).toBeNull();
    expect(screen.getByTestId("nome")).toHaveTextContent("sem-sessao");
    expect(screen.getByTestId("a-sair")).toHaveTextContent("false");
    expect(tentativasDeNavegacao()).toHaveLength(1);
  });

  it("ignora cliques repetidos enquanto o logout decorre", async () => {
    const pedido = deferred();
    mocks.logout.mockReturnValueOnce(pedido.promise);
    renderSessao();
    entrar();

    act(() => {
      fireEventClick("sair");
      fireEventClick("sair");
    });

    expect(mocks.logout).toHaveBeenCalledTimes(1);

    await act(async () => {
      pedido.resolve();
      await pedido.promise;
    });
  });
});
