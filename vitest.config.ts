import { defineConfig } from "vitest/config";
import path from "path";
import react from "@vitejs/plugin-react";

/**
 * Configuração exclusiva dos testes (`vitest`).
 *
 * É separada de `vite.config.ts` de propósito: os testes não precisam do
 * Tailwind nem do resolvedor de assets do Figma, o que os torna mais rápidos.
 * O alias `@` é mantido igual ao do build para os imports continuarem válidos.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    // Componentes React precisam de um DOM (jsdom) e dos matchers do jest-dom.
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    css: false,
    restoreMocks: true,
    clearMocks: true,
  },
});
