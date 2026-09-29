import { useEffect } from "react";

/**
 * Título do documento por página — sem bibliotecas externas (`document.title`).
 *
 * Uso em qualquer página:
 *   useDocumentTitle("Entrar");        // -> "Entrar · Chilembo Faturação"
 *   useDocumentTitle("Faturas");       // -> "Faturas · Chilembo Faturação"
 */
export const BRAND_TITLE = "Chilembo Faturação";

/** Monta o título final apresentado no separador do navegador. */
export function buildDocumentTitle(pageTitle: string): string {
  const clean = pageTitle.trim();
  return clean ? `${clean} · ${BRAND_TITLE}` : BRAND_TITLE;
}

/**
 * @param pageTitle nome da página (o sufixo da marca é acrescentado
 *                  automaticamente). Actualiza também o atributo
 *                  `data-page-title` para depuração/analytics simples.
 */
export function useDocumentTitle(pageTitle: string): void {
  useEffect(() => {
    const title = buildDocumentTitle(pageTitle);
    document.title = title;
    document.documentElement.dataset.pageTitle = title;
  }, [pageTitle]);
}
