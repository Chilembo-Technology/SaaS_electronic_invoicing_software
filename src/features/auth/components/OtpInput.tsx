import { CheckCircle2 } from "lucide-react";

import { InputOTP, InputOTPGroup, InputOTPSlot } from "../../../app/components/ui/input-otp";
import { Label } from "../../../app/components/ui/label";
import { cn } from "../../../app/components/ui/utils";
import { FieldError } from "../../../components/forms/FieldError";
import { OTP_LENGTH } from "../utils/loginValidation";

interface OtpInputProps {
  /** Id do input (igual ao nome do campo, para o foco automático em erro). */
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  /** Mensagem de erro (validador local OU mensagem vinda do backend). */
  error?: string;
  /** Texto de apoio mostrado quando o campo está válido. */
  hint?: string;
  /** Borda/ícone verde depois do blur, sem erro e com o código completo. */
  showValid?: boolean;
  disabled?: boolean;
  /** Foco automático ao abrir a página. */
  autoFocus?: boolean;
}

/** Casas do código — o índice é estável (lista de comprimento fixo). */
const OTP_SLOTS = Array.from({ length: OTP_LENGTH }, (_, index) => index);

/**
 * Campo do código OTP (9 dígitos, `digits:9` em `AuthVerifyOTPRequest`).
 *
 * Reutiliza a primitiva `InputOTP` já existente na aplicação (`input-otp`), que
 * trata do foco automático, da navegação entre casas e da colagem em bloco.
 * Os estados visuais seguem o `FormField`: borda vermelha + mensagem inline em
 * erro, borda verde + ícone quando válido.
 */
export function OtpInput({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  hint,
  showValid = false,
  disabled = false,
  autoFocus = false,
}: OtpInputProps) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const hasError = Boolean(error);
  const isValid = showValid && !hasError && value.length === OTP_LENGTH;

  return (
    <div>
      <div className="flex items-center gap-2">
        <Label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        </Label>

        {isValid ? (
          <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-normal text-brand-green">
            <CheckCircle2 size={12} aria-hidden="true" />
            Código completo
          </span>
        ) : null}
      </div>

      <div className="mt-2">
        <InputOTP
          id={id}
          value={value}
          onChange={onChange}
          maxLength={OTP_LENGTH}
          pattern={"^\\d+$"}
          inputMode="numeric"
          autoComplete="one-time-code"
          disabled={disabled}
          autoFocus={autoFocus}
          onBlur={onBlur}
          aria-invalid={hasError}
          aria-required
          aria-describedby={hasError ? errorId : hint ? hintId : undefined}
          containerClassName="justify-between gap-1.5"
        >
          <InputOTPGroup className="w-full justify-between gap-1.5">
            {OTP_SLOTS.map((index) => (
              <InputOTPSlot
                key={index}
                index={index}
                className={cn(
                  // Mesmo fundo/borda dos campos do formulário (`FormField`):
                  // o cinza do `bg-background` aparece dentro do card branco.
                  // `first:/last:rounded-l|r-xl` substituem o arredondamento em
                  // "grupo" da primitiva, mantendo as casas iguais entre si.
                  "h-12 w-full rounded-xl border bg-background text-base font-semibold text-foreground transition-colors",
                  "first:rounded-l-xl last:rounded-r-xl",
                  hasError && "border-destructive",
                  !hasError && isValid && "border-brand-green",
                )}
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
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
