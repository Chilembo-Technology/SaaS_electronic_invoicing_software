import { Label } from '../../../app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../app/components/ui/select';
import { FieldError } from '../../../components/forms/FieldError';
import type { VatExemption } from '../../vat-exemptions/types';
import { exemptionLabel, type TaxOption } from '../catalog';

interface TaxSelectProps {
  idPrefix: string;
  options: TaxOption[];
  exemptionReasons: VatExemption[];
  taxId: string;
  exemptionCode: string;
  /** Muda o imposto e/ou o motivo (o motivo é limpo quando a taxa deixa de ser 0 %). */
  onChange: (taxId: string, exemptionCode: string) => void;
  taxError?: string;
  exemptionError?: string;
  disabled?: boolean;
  /** Rótulos curtos (linhas da factura). */
  compact?: boolean;
}

/**
 * Seletor de imposto do catálogo ("IVA — Taxa normal — 14%") e, quando a taxa
 * é 0 %, o motivo de isenção obrigatório (vat_exemption_reasons).
 */
export function TaxSelect({
  idPrefix,
  options,
  exemptionReasons,
  taxId,
  exemptionCode,
  onChange,
  taxError,
  exemptionError,
  disabled = false,
  compact = false,
}: TaxSelectProps) {
  const selected = options.find((option) => option.id === taxId);
  const needsReason = Boolean(selected?.requires_exemption_reason);

  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-tax`}>{compact ? 'Imposto' : 'Imposto *'}</Label>
        <Select
          value={taxId || undefined}
          disabled={disabled || options.length === 0}
          onValueChange={(value) => {
            const next = options.find((option) => option.id === value);
            onChange(value, next?.requires_exemption_reason ? exemptionCode : '');
          }}
        >
          <SelectTrigger
            className="bg-muted border-none"
            id={`${idPrefix}-tax`}
            aria-invalid={Boolean(taxError)}
          >
            <SelectValue placeholder={options.length === 0 ? 'A carregar…' : 'Escolher imposto'} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {taxError ? <FieldError id={`${idPrefix}-tax-error`} message={taxError} /> : null}
      </div>

      {needsReason ? (
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-exemption`}>Motivo de isenção *</Label>
          <Select
            value={exemptionCode || undefined}
            disabled={disabled}
            onValueChange={(value) => onChange(taxId, value)}
          >
            <SelectTrigger
              className="bg-muted border-none"
              id={`${idPrefix}-exemption`}
              aria-invalid={Boolean(exemptionError)}
            >
              <SelectValue placeholder="Escolher motivo (M..)" />
            </SelectTrigger>
            <SelectContent>
              {exemptionReasons.map((reason) => (
                <SelectItem key={reason.code} value={reason.code}>
                  {exemptionLabel(reason)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {exemptionError ? (
            <FieldError id={`${idPrefix}-exemption-error`} message={exemptionError} />
          ) : null}
        </div>
      ) : null}
    </>
  );
}
