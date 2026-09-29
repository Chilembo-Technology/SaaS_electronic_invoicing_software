import { AlertCircle, AlertTriangle, Info, X } from "lucide-react";

type FormAlertVariant = "error" | "warning" | "info";

interface FormAlertProps {
  variant?: FormAlertVariant;
  title?: string;
  message: string;
  onDismiss?: () => void;
}

const VARIANT_STYLES: Record<FormAlertVariant, { wrapper: string; icon: typeof AlertCircle }> = {
  error: {
    wrapper: "border-destructive/30 bg-destructive/5 text-destructive",
    icon: AlertCircle,
  },
  warning: {
    wrapper: "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400",
    icon: AlertTriangle,
  },
  info: {
    wrapper: "border-brand-navy/20 bg-brand-navy/5 text-brand-navy",
    icon: Info,
  },
};

/**
 * Banner de destaque no topo do formulário (erros globais: 500, rede, timeout
 * ou avisos de estado). Erros por campo usam `<FieldError />`.
 */
export function FormAlert({ variant = "error", title, message, onDismiss }: FormAlertProps) {
  const { wrapper, icon: Icon } = VARIANT_STYLES[variant];

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-xl border p-3.5 text-sm ${wrapper}`}
    >
      <Icon size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div className="flex-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        <p className={title ? "mt-0.5 text-xs leading-relaxed" : "text-xs leading-relaxed"}>
          {message}
        </p>
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Fechar aviso"
          className="rounded-md p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          <X size={14} />
        </button>
      ) : null}
    </div>
  );
}
