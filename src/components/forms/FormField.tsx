import { useState } from "react";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";

import { Input } from "../../app/components/ui/input";
import { Label } from "../../app/components/ui/label";
import { cn } from "../../app/components/ui/utils";
import { FieldError } from "./FieldError";

export type FormFieldType = "text" | "email" | "password" | "tel";

interface FormFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  /** Mensagem de erro (validador local OU mensagem vinda do backend no 422). */
  error?: string;
  /** Texto de apoio mostrado quando o campo está válido. */
  hint?: string;
  type?: FormFieldType;
  inputMode?: "text" | "tel" | "numeric" | "email";
  autoComplete?: string;
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
  disabled?: boolean;
  /** Estado "a validar" — enquanto o passo está a ser submetido à API. */
  validating?: boolean;
  /** Borda/ícone verde: só depois do blur, sem erro e com valor preenchido. */
  showValid?: boolean;
  className?: string;
}

/**
 * Campo de formulário genérico com estados visuais:
 *   - inválido -> borda vermelha + ícone de alerta + mensagem inline;
 *   - válido   -> borda verde + ícone de confirmação;
 *   - a validar -> spinner + "A validar…" (durante a submissão).
 */
export function FormField({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  hint,
  type = "text",
  inputMode = "text",
  autoComplete,
  placeholder,
  maxLength,
  required = false,
  disabled = false,
  validating = false,
  showValid = false,
  className,
}: FormFieldProps) {
  const [revealed, setRevealed] = useState(false);

  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const hasError = Boolean(error);
  const isPassword = type === "password";
  const isValid = showValid && !hasError && value.length > 0;

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <Label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
          {required ? (
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          ) : null}
        </Label>
        {validating ? (
          <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-normal text-muted-foreground">
            <Loader2 size={11} className="animate-spin" aria-hidden="true" />
            A validar…
          </span>
        ) : null}
      </div>

      <div className="relative mt-1.5">
        <Input
          id={id}
          name={id}
          type={isPassword && revealed ? "text" : type}
          value={value}
          placeholder={placeholder}
          inputMode={inputMode}
          maxLength={maxLength}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={hasError}
          aria-busy={validating}
          aria-required={required}
          aria-describedby={hasError ? errorId : hint ? hintId : undefined}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            "h-12 rounded-xl bg-background transition-colors duration-200",
            (hasError || validating || isValid || isPassword) && "pr-11",
            hasError && "border-destructive focus-visible:ring-destructive/30",
            !hasError && isValid && "border-brand-green focus-visible:ring-brand-green/30",
            !hasError && !isValid && "focus-visible:border-brand-navy",
          )}
        />

        <span className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {validating ? (
            <Loader2 size={16} className="animate-spin text-muted-foreground" aria-hidden="true" />
          ) : null}
          {!validating && hasError ? (
            <AlertCircle size={16} className="text-destructive" aria-hidden="true" />
          ) : null}
          {!validating && !hasError && isValid ? (
            <CheckCircle2 size={16} className="text-brand-green" aria-hidden="true" />
          ) : null}
          {isPassword ? (
            <button
              type="button"
              onClick={() => setRevealed((current) => !current)}
              aria-label={revealed ? "Ocultar senha" : "Mostrar senha"}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          ) : null}
        </span>
      </div>

      {hasError ? (
        <FieldError id={errorId} message={error as string} />
      ) : hint ? (
        <p id={hintId} className="mt-1.5 text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
