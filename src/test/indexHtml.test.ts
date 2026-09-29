import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Verifica o que é definido fora do React: favicon do separador do navegador
 * (Chrome, Firefox, Safari e Edge) e metas essenciais do `index.html`.
 */
const root = process.cwd();
const html = readFileSync(resolve(root, "index.html"), "utf8");

describe("index.html — favicon e metadados", () => {
  it("declara o ícone do separador com o logótipo da aplicação", () => {
    expect(html).toMatch(/<link[^>]+rel="icon"[^>]+href="\/logo\.png"/);
  });

  it("declara a variante legada (shortcut icon) e o ícone de atalho do Safari/iOS", () => {
    expect(html).toMatch(/rel="shortcut icon"/);
    expect(html).toMatch(/<link[^>]+rel="apple-touch-icon"[^>]+href="\/logo\.png"/);
  });

  it("define a cor do tema coerente com a paleta da marca", () => {
    expect(html).toMatch(/<meta[^>]+name="theme-color"[^>]+content="#104b7d"/);
  });

  it("tem título e descrição para indexação", () => {
    expect(html).toMatch(/<title>[^<]+<\/title>/);
    expect(html).toMatch(/<meta[^>]+name="description"[^>]+content="[^"]{40,}"/);
  });

  it("o ficheiro do logótipo existe em /public", () => {
    expect(existsSync(resolve(root, "public/logo.png"))).toBe(true);
    expect(existsSync(resolve(root, "public/logo_with_name.png"))).toBe(true);
  });
});
