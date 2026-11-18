import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../app/components/ui/alert-dialog';
import type { InvoiceDateCheck } from '../types';

interface BackdatedDateDialogProps {
  /** Resultado da verificação com aviso (`null` fecha o diálogo). */
  check: InvoiceDateCheck | null;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Confirmação antes de emitir um documento com data muito anterior a hoje. */
export function BackdatedDateDialog({ check, onConfirm, onCancel }: BackdatedDateDialogProps) {
  return (
    <AlertDialog open={check !== null} onOpenChange={(open) => (!open ? onCancel() : undefined)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Data do documento muito anterior a hoje</AlertDialogTitle>
          <AlertDialogDescription>
            {check?.message ??
              `A data do documento é ${check?.business_days_before_today ?? ''} dias úteis anterior a hoje.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Rever a data</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Emitir mesmo assim</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
