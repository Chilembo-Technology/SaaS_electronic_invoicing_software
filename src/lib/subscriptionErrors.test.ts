import { describe, expect, it } from "vitest";

import {
  PLANS_HREF,
  SUBSCRIPTION_ERROR_CODES,
  SUPPORT_HREF,
  getSubscriptionError,
  subscriptionErrorFromResponse,
} from "./subscriptionErrors";

/**
 * Códigos que os serviços podem devolver hoje (copiados do backend):
 *   - subscription_service app/Enums/EmissionBlockReason.php;
 *   - fiscal_core app/Services/Subscription/EmissionGate.php;
 *   - auth_service app/Services/Subscription/UserSeatGate.php e UserSeatsBusyException.
 * Se o backend acrescentar um código, acrescente-o aqui E no mapa.
 */
const BACKEND_CODES = [
  "NO_SUBSCRIPTION",
  "PENDING_ACTIVATION",
  "TRIAL_TRAINING_ONLY",
  "LIMIT_REACHED",
  "SUSPENDED_OVERDUE",
  "SUSPENDED_MANUAL",
  "PREPAID_EXPIRED",
  "CANCELLED",
  "ARCHIVED",
  "PRICING_UNAVAILABLE",
  "FEATURE_NOT_IN_PLAN",
  "SUBSCRIPTION_UNAVAILABLE",
  "EMISSION_BLOCKED",
  "USER_LIMIT_REACHED",
  "SUBSCRIPTION_INACTIVE",
  "USER_SEATS_BUSY",
];

describe("mapa central dos erros de subscrição", () => {
  it("tem título e mensagem em português para cada código que o backend devolve", () => {
    expect([...SUBSCRIPTION_ERROR_CODES].sort()).toEqual([...BACKEND_CODES].sort());

    for (const code of BACKEND_CODES) {
      const info = getSubscriptionError(code);

      expect(info, code).not.toBeNull();
      expect(info!.title.length, code).toBeGreaterThan(5);
      expect(info!.message.length, code).toBeGreaterThan(30);
      // Nunca texto técnico: nem o código, nem o estado HTTP, nem inglês do Laravel.
      expect(info!.message, code).not.toContain(code);
      expect(info!.message, code).not.toMatch(/402|503|error|exception/i);
    }
  });

  it("sugere a acção adequada", () => {
    expect(getSubscriptionError("LIMIT_REACHED")!.action).toEqual({ label: "Ver planos e pacotes", href: PLANS_HREF });
    expect(getSubscriptionError("LIMIT_REACHED")!.message).toMatch(/compre um pacote.*mude de plano/);
    expect(getSubscriptionError("FEATURE_NOT_IN_PLAN")!.message).toMatch(/não está incluída no seu plano/);
    expect(getSubscriptionError("USER_LIMIT_REACHED")!.message).toMatch(/número máximo de utilizadores/);
    expect(getSubscriptionError("SUSPENDED_OVERDUE")!.message).toMatch(/falta de pagamento/);
    expect(getSubscriptionError("SUSPENDED_OVERDUE")!.action!.href).toBe(SUPPORT_HREF);
    // Temporários: tentar de novo, sem botão.
    expect(getSubscriptionError("USER_SEATS_BUSY")!.action).toBeUndefined();
    expect(getSubscriptionError("SUBSCRIPTION_UNAVAILABLE")!.action).toBeUndefined();
  });

  it("devolve null para códigos desconhecidos", () => {
    expect(getSubscriptionError("NOPE")).toBeNull();
    expect(getSubscriptionError(undefined)).toBeNull();
    expect(getSubscriptionError(402)).toBeNull();
  });
});

describe("subscriptionErrorFromResponse", () => {
  it("reconhece um 402 com código conhecido", () => {
    expect(subscriptionErrorFromResponse(402, { success: false, message: "x", code: "LIMIT_REACHED" })?.code).toBe("LIMIT_REACHED");
  });

  it("dá uma mensagem genérica de plano (não técnica) a um 402 sem código conhecido", () => {
    const info = subscriptionErrorFromResponse(402, { message: "Payment Required" });

    expect(info?.code).toBe("UNKNOWN");
    expect(info?.message).toMatch(/subscrição da empresa não permite/);
    expect(info?.action?.href).toBe(PLANS_HREF);
  });

  it("reconhece o 503 USER_SEATS_BUSY mas não outros 503", () => {
    expect(subscriptionErrorFromResponse(503, { code: "USER_SEATS_BUSY" })?.code).toBe("USER_SEATS_BUSY");
    expect(subscriptionErrorFromResponse(503, { message: "Service Unavailable" })).toBeNull();
  });

  it("ignora outros estados mesmo com um campo code", () => {
    expect(subscriptionErrorFromResponse(422, { code: "LIMIT_REACHED" })).toBeNull();
    expect(subscriptionErrorFromResponse(500, { code: "LIMIT_REACHED" })).toBeNull();
    expect(subscriptionErrorFromResponse(undefined, null)).toBeNull();
  });
});
