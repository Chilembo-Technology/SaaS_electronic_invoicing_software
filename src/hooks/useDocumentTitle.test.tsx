import { describe, expect, it } from "vitest";

import { buildDocumentTitle, useDocumentTitle, BRAND_TITLE } from "./useDocumentTitle";
import { renderHook } from "@testing-library/react";

describe("useDocumentTitle", () => {
  it("junta o nome da página ao sufixo da marca", () => {
    expect(buildDocumentTitle("Entrar")).toBe("Entrar · Chilembo Faturação");
    expect(buildDocumentTitle("Faturas")).toBe("Faturas · Chilembo Faturação");
    expect(buildDocumentTitle("Empresas")).toBe("Empresas · Chilembo Faturação");
    expect(buildDocumentTitle("Criar conta")).toBe("Criar conta · Chilembo Faturação");
  });

  it("usa apenas a marca quando não há nome de página", () => {
    expect(buildDocumentTitle("   ")).toBe(BRAND_TITLE);
  });

  it("actualiza document.title ao montar", () => {
    renderHook(() => useDocumentTitle("Login de teste"));
    expect(document.title).toBe("Login de teste · Chilembo Faturação");
  });

  it("actualiza document.title quando o título muda", () => {
    const { rerender } = renderHook(({ title }) => useDocumentTitle(title), {
      initialProps: { title: "Entrar" },
    });

    expect(document.title).toBe("Entrar · Chilembo Faturação");

    rerender({ title: "Recuperar senha" });
    expect(document.title).toBe("Recuperar senha · Chilembo Faturação");
  });

  it("expõe o título no atributo data-page-title", () => {
    renderHook(() => useDocumentTitle("Planos"));
    expect(document.documentElement.dataset.pageTitle).toBe("Planos · Chilembo Faturação");
  });
});
