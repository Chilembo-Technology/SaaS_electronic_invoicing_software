/**
 * Aviso discreto de ambiente de demonstração (contactos, morada e conteúdo de
 * exemplo da Landing Page).
 *
 * Só é apresentado em desenvolvimento ou quando o build é feito com
 * `VITE_SHOW_DEMO_NOTICE=true` — em produção fica oculto por omissão.
 */

/**
 * Regra pura (facilmente testável): o aviso aparece em desenvolvimento
 * (`DEV`) ou quando o build opta explicitamente por o mostrar.
 */
export function resolveShowDemoNotice(isDev: boolean, flag?: string | null): boolean {
  return isDev || flag === "true";
}

export const shouldShowDemoNotice = resolveShowDemoNotice(
  import.meta.env.DEV,
  import.meta.env.VITE_SHOW_DEMO_NOTICE,
);

/** Texto do aviso — curto, sóbrio e alinhado com o tom do produto. */
export const demoNoticeText = "Conteúdo de demonstração. Sem valor fiscal nem comercial.";

/** Nota sobre os testemunhos apresentados (fictícios). */
export const testimonialsNoticeText =
  "Testemunhos ilustrativos, apresentados apenas para demonstração do produto.";
