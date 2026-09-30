import { describe, expect, it, vi, beforeEach } from "vitest";

/**
 * Testes do `authService.logout` — o pedido que invalida o JWT no backend
 * (`POST /v1/auth/logout`, protegido por `auth:api`).
 *
 * A instância do axios (`src/lib/api.ts`) é substituída por espiões, seguindo o
 * padrão de `features/auth/services/loginService.test.ts`: nenhum pedido HTTP é
 * feito e o token "guardado" é controlado pelo teste.
 */

const { mocks } = vi.hoisted(() => ({
  mocks: {
    post: vi.fn(),
    /** Valor devolvido por `getStoredToken()`. */
    storedToken: { value: null as string | null },
  },
}));

vi.mock("../lib/api", () => ({
  authApi: { post: mocks.post },
  getStoredToken: () => mocks.storedToken.value,
}));

import { authService } from "./authService";
import { httpError, networkError } from "../test/helpers";

const LOGOUT_PATH = "/v1/auth/logout";

describe("authService.logout", () => {
  beforeEach(() => {
    mocks.storedToken.value = null;
  });

  it("envia o JWT no header Authorization do POST /v1/auth/logout", async () => {
    mocks.storedToken.value = "jwt-abc";
    mocks.post.mockResolvedValueOnce({
      data: { success: true, message: "Desconectado com sucesso" },
    });

    await authService.logout();

    expect(mocks.post).toHaveBeenCalledWith(LOGOUT_PATH, null, {
      headers: { Authorization: "Bearer jwt-abc" },
    });
  });

  it("resolve o token no momento da chamada, antes de a sessão local ser limpa", async () => {
    // Cenário do defeito corrigido: o `AuthContext` apaga o token a seguir, e os
    // interceptores do axios só correm em microtask — o header tem de ficar
    // resolvido aqui, de forma síncrona, senão o pedido seguiria sem
    // `Authorization` (401) e o JWT nunca seria invalidado no backend.
    mocks.storedToken.value = "jwt-abc";
    mocks.post.mockImplementationOnce(async () => {
      mocks.storedToken.value = null;
      return { data: { success: true } };
    });

    await authService.logout();

    expect(mocks.post).toHaveBeenCalledWith(LOGOUT_PATH, null, {
      headers: { Authorization: "Bearer jwt-abc" },
    });
  });

  it("sem token guardado, não envia header de autorização", async () => {
    mocks.post.mockResolvedValueOnce({ data: { success: true } });

    await authService.logout();

    expect(mocks.post).toHaveBeenCalledWith(LOGOUT_PATH, null, undefined);
  });

  it("não rebenta quando o backend recusa o token (401)", async () => {
    mocks.storedToken.value = "jwt-expirado";
    mocks.post.mockRejectedValueOnce(httpError(401, { message: "Unauthenticated." }));

    await expect(authService.logout()).resolves.toBeUndefined();
  });

  it("não rebenta numa falha de rede", async () => {
    mocks.storedToken.value = "jwt-abc";
    mocks.post.mockRejectedValueOnce(networkError());

    await expect(authService.logout()).resolves.toBeUndefined();
    expect(mocks.post).toHaveBeenCalledTimes(1);
  });
});
