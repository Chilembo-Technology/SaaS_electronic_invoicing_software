import { AlertCircle } from "lucide-react";

interface FieldErrorProps {
  /** id do elemento de erro (ligado ao input via `aria-describedby`). */
  id?: string;
  /** Mensagem em português — vem do validador local ou directamente do backend (422). */
  message: string;
}

/**
 * Mensagem de erro individual de um campo.
 *
 * Regra do projeto: erro de campo é SEMPRE texto inline (nunca toast).
 */
export function FieldError({ id, message }: FieldErrorProps) {
  return (
    <p
      id={id}
      role="alert"
      className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-destructive"
    >
      <AlertCircle size={13} className="mt-px shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}
