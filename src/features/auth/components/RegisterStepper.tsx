import { Check } from "lucide-react";

import { cn } from "../../../app/components/ui/utils";
import type { RegisterStep } from "../types/register";

interface RegisterStepperProps {
  /** Passo actualmente visível. */
  currentStep: RegisterStep;
  /** A empresa já foi criada no servidor. */
  companyStepComplete: boolean;
}

const STEPS: { number: RegisterStep; label: string; description: string }[] = [
  { number: 1, label: "Empresa", description: "Dados fiscais e contacto" },
  { number: 2, label: "Utilizador administrador", description: "Acesso ao painel" },
];

/** Indicador de progresso do registo em dois passos. */
export function RegisterStepper({ currentStep, companyStepComplete }: RegisterStepperProps) {
  return (
    <ol
      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6"
      aria-label="Progresso do registo"
    >
      {STEPS.map((step) => {
        const isDone = step.number === 1 && companyStepComplete;
        const isActive = step.number === currentStep;

        return (
          <li key={step.number} className="flex flex-1 items-center gap-3">
            <span
              aria-current={isActive ? "step" : undefined}
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold transition-colors duration-200",
                isDone && "border-brand-green bg-brand-green text-white",
                !isDone && isActive && "border-brand-navy bg-brand-navy text-white",
                !isDone && !isActive && "border-border bg-background text-muted-foreground",
              )}
            >
              {isDone ? <Check size={16} strokeWidth={3} /> : step.number}
            </span>
            <span className="min-w-0">
              <span
                className={cn(
                  "block text-sm font-semibold",
                  isActive || isDone ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
              <span className="block text-xs text-muted-foreground">{step.description}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
