import { Tabs, TabsList, TabsTrigger } from "../app/components/ui/tabs";
import { cn } from "../app/components/ui/utils";
import type {
  BillingPeriod,
  BillingPeriodOption,
} from "../features/landing/types/landing";

interface PlanTabProps {
  /** Periodicidades a apresentar (Mensal, Trimestral, Semestral, Anual). */
  periods: BillingPeriodOption[];
  value: BillingPeriod;
  onChange: (period: BillingPeriod) => void;
  /** Rótulo acessível do grupo de abas. */
  label?: string;
  className?: string;
}

/**
 * Alterna a periodicidade de cobrança dos planos pré-pagos.
 * Construído sobre o primitivo `Tabs` (Radix) já existente no projeto,
 * pelo que herda navegação por teclado e semântica ARIA.
 */
export function PlanTab({
  periods,
  value,
  onChange,
  label = "Periodicidade de cobrança",
  className,
}: PlanTabProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(next) => onChange(next as BillingPeriod)}
      className={cn("items-center gap-0", className)}
    >
      <TabsList
        aria-label={label}
        className="h-auto w-full flex-wrap gap-1 rounded-2xl bg-card p-1.5 shadow-sm ring-1 ring-border sm:w-auto sm:flex-nowrap"
      >
        {periods.map((period) => (
          <TabsTrigger
            key={period.id}
            value={period.id}
            className="h-auto rounded-xl px-4 py-2.5 text-sm font-semibold text-muted-foreground data-[state=active]:bg-brand-navy data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            {period.label}
            {period.discountLabel ? (
              <span className="rounded-full bg-secondary/20 px-1.5 py-0.5 text-[10px] font-bold text-brand-navy">
                {period.discountLabel}
              </span>
            ) : null}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
