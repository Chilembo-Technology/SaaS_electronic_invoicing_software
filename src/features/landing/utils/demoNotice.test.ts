import { describe, expect, it } from "vitest";

import {
  demoNoticeText,
  resolveShowDemoNotice,
  shouldShowDemoNotice,
  testimonialsNoticeText,
} from "./demoNotice";

describe("aviso de ambiente de demonstração", () => {
  it("mostra o aviso em desenvolvimento", () => {
    expect(resolveShowDemoNotice(true)).toBe(true);
    expect(resolveShowDemoNotice(true, undefined)).toBe(true);
    expect(resolveShowDemoNotice(true, "false")).toBe(true);
  });

  it("esconde o aviso em produção (build normal)", () => {
    expect(resolveShowDemoNotice(false)).toBe(false);
    expect(resolveShowDemoNotice(false, undefined)).toBe(false);
    expect(resolveShowDemoNotice(false, "")).toBe(false);
    expect(resolveShowDemoNotice(false, "false")).toBe(false);
    expect(resolveShowDemoNotice(false, "1")).toBe(false);
  });

  it("mostra o aviso em produção quando o build o pede (VITE_SHOW_DEMO_NOTICE=true)", () => {
    expect(resolveShowDemoNotice(false, "true")).toBe(true);
  });

  it("o aviso continua visível nesta suite de desenvolvimento", () => {
    expect(shouldShowDemoNotice).toBe(true);
  });

  it("mantém textos curtos, sem linguagem de rascunho", () => {
    expect(demoNoticeText.trim().length).toBeGreaterThan(20);
    expect(demoNoticeText).toBe("Conteúdo de demonstração. Sem valor fiscal nem comercial.");
    expect(testimonialsNoticeText).toContain("demonstração");
    // O texto antigo da home não deve voltar.
    expect(demoNoticeText).not.toMatch(/fictícios/i);
  });
});
