import { beforeEach, describe, expect, it, vi } from "vitest";

import { httpError } from "../test/helpers";
import { notifySubscriptionError } from "./subscriptionErrorToast";
import { PLANS_HREF } from "./subscriptionErrors";

const toastError = vi.hoisted(() => vi.fn());

vi.mock("sonner", () => ({ toast: { error: toastError } }));

describe("notifySubscriptionError", () => {
  beforeEach(() => {
    toastError.mockReset();
  });

  it("mostra um toast com a mensagem e o botão da acção num 402", async () => {
    const error = httpError(402, { success: false, message: "técnica", code: "LIMIT_REACHED" });

    await expect(notifySubscriptionError(error)).rejects.toBe(error);

    expect(toastError).toHaveBeenCalledTimes(1);
    const [title, options] = toastError.mock.calls[0];
    expect(title).toBe("Limite de documentos atingido");
    expect(options.id).toBe("subscription-LIMIT_REACHED");
    expect(options.description).toMatch(/compre um pacote/);
    expect(options.action.label).toBe("Ver planos e pacotes");

    const assign = vi.fn();
    vi.stubGlobal("location", { ...window.location, assign });
    options.action.onClick();
    expect(assign).toHaveBeenCalledWith(PLANS_HREF);
    vi.unstubAllGlobals();
  });

  it("mostra o toast sem botão no 503 USER_SEATS_BUSY", async () => {
    const error = httpError(503, { code: "USER_SEATS_BUSY" });

    await expect(notifySubscriptionError(error)).rejects.toBe(error);

    expect(toastError).toHaveBeenCalledTimes(1);
    expect(toastError.mock.calls[0][1].action).toBeUndefined();
  });

  it("não mostra nada noutros erros e deixa-os seguir", async () => {
    const error = httpError(422, { message: "Validação", errors: {} });

    await expect(notifySubscriptionError(error)).rejects.toBe(error);
    await expect(notifySubscriptionError(new Error("x"))).rejects.toThrow("x");

    expect(toastError).not.toHaveBeenCalled();
  });
});
