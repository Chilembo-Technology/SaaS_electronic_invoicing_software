import type { ReactNode } from "react";

import { cn } from "../app/components/ui/utils";

interface SectionHeadingProps {
  /** Pequeno rótulo acima do título (ex.: "Planos e Preços"). */
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Alinhamento do bloco. Por omissão, centrado. */
  align?: "left" | "center";
  /** Elemento extra à direita (ex.: um botão), apenas em `align="left"`. */
  action?: ReactNode;
  className?: string;
}

/**
 * Cabeçalho de secção reutilizável: rótulo + título + subtítulo.
 * Mantém consistência tipográfica entre todas as secções da Landing.
 */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  action,
  className,
}: SectionHeadingProps) {
  const isCentered = align === "center";

  return (
    <div
      className={cn(
        "max-w-3xl",
        isCentered && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <span className="inline-flex items-center rounded-full border border-brand-teal/30 bg-brand-teal/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-teal">
          {eyebrow}
        </span>
      ) : null}

      <h2
        className="mt-4 text-3xl font-bold leading-tight text-foreground sm:text-4xl"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h2>

      {subtitle ? (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {subtitle}
        </p>
      ) : null}

      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
