import { AlertTriangle, ChevronDown, Loader2, RefreshCw } from 'lucide-react';

import { Label } from '../../../app/components/ui/label';
import { cn } from '../../../app/components/ui/utils';
import { FieldError } from '../../../components/forms/FieldError';
import { useBanks } from '../hooks/useBanks';
import type { Bank } from '../types/company.types';

interface BankSelectProps {
  /** `id`/`name` do `<select>` (ligado à etiqueta e às mensagens de erro). */
  id?: string;
  label?: string;
  /** `bank_id` actual (UUID). `null`/`''` = sem banco selecionado. */
  value: string | null;
  /** Recebe o `id` do banco escolhido — NUNCA o objeto `Bank`. */
  onChange: (bankId: string | null) => void;
  disabled?: boolean;
  /** Erro do validador local ou do 422 do backend. */
  error?: string;
  className?: string;
}

/** Nome visível de um banco (`banks` só garante `bank_name`/`short_name`). */
export function bankLabel(bank: Bank): string {
  return bank.bank_name || bank.short_name || bank.id;
}

/**
 * Select do banco da conta bancária da empresa.
 *
 * Comportamento:
 *   - carrega o catálogo completo no `useBanks` (Angola-Core-Data);
 *   - mostra o NOME do banco (`bank_name`) mas guarda/envia o `id` (UUID);
 *   - fica pré-selecionado quando `value` coincide com um `id` da lista;
 *   - se o `bank_id` da API não vier na lista, mantém-no como opção extra
 *     ("Banco selecionado (id: …)") para não perder o valor;
 *   - desabilita com "A carregar bancos…" enquanto carrega;
 *   - se a API falhar mostra um aviso com nova tentativa, sem bloquear o resto
 *     do formulário.
 *
 * Usa um `<select>` nativo (opção permitida pelas regras do projecto): é o que
 * garante a semântica pedida de `<option value="">Selecione um banco</option>`
 * no topo e de poder limpar a seleção. O visual segue o `Input`/`FormField`.
 */
export function BankSelect({
  id = 'bank_id',
  label = 'Banco',
  value,
  onChange,
  disabled = false,
  error,
  className,
}: BankSelectProps) {
  const { banks, isLoading, error: loadError, reload } = useBanks();

  const current = value ?? '';
  const hasUnknownSelected = current !== '' && !banks.some((bank) => bank.id === current);
  const hasError = Boolean(error);
  const errorId = `${id}-error`;
  const loadErrorId = `${id}-load-error`;
  const hintId = `${id}-hint`;

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <Label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </Label>
        {isLoading ? (
          <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-normal text-muted-foreground">
            <Loader2 size={11} className="animate-spin" aria-hidden="true" />
            A carregar bancos…
          </span>
        ) : null}
      </div>

      <div className="relative mt-1.5">
        <select
          id={id}
          name={id}
          value={current}
          disabled={disabled || isLoading}
          aria-invalid={hasError}
          aria-busy={isLoading}
          aria-describedby={hasError ? errorId : loadError ? loadErrorId : hintId}
          onChange={(event) => onChange(event.target.value === '' ? null : event.target.value)}
          className={cn(
            'h-12 w-full min-w-0 appearance-none rounded-xl border border-input bg-background px-3 pr-10 text-sm text-foreground outline-none transition-[color,box-shadow]',
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            hasError && 'border-destructive focus-visible:ring-destructive/30',
          )}
        >
          <option value="">{isLoading ? 'A carregar bancos…' : 'Selecione um banco'}</option>

          {banks.map((bank) => (
            <option key={bank.id} value={bank.id}>
              {bankLabel(bank)}
            </option>
          ))}

          {hasUnknownSelected ? (
            <option value={current}>{`Banco selecionado (id: ${current})`}</option>
          ) : null}
        </select>

        {isLoading ? (
          <Loader2
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground"
            aria-hidden="true"
          />
        ) : (
          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
        )}
      </div>

      {hasError ? (
        <FieldError id={errorId} message={error as string} />
      ) : loadError ? (
        <p
          id={loadErrorId}
          role="status"
          className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400"
        >
          <AlertTriangle size={13} className="mt-px shrink-0" aria-hidden="true" />
          <span className="flex-1">{loadError}</span>
          <button
            type="button"
            onClick={() => void reload()}
            disabled={isLoading}
            className="inline-flex items-center gap-1 font-semibold underline-offset-2 hover:underline disabled:opacity-50"
          >
            <RefreshCw size={12} aria-hidden="true" />
            Tentar novamente
          </button>
        </p>
      ) : (
        <p id={hintId} className="mt-1.5 text-xs text-muted-foreground">
          Banco onde a empresa tem a conta usada nos documentos emitidos.
        </p>
      )}
    </div>
  );
}
