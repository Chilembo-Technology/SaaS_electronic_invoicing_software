import { Loader2 } from 'lucide-react';

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
import type { AdminCompany } from '../types';

interface FinancialInstitutionDialogProps {
  /** Empresa a alterar (`null` fecha o diálogo). */
  company: AdminCompany | null;
  /** Valor pedido: `true` marca como banco, `false` desmarca. */
  nextValue: boolean;
  isSaving: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmação de super-admin antes de marcar/desmarcar uma empresa como
 * instituição financeira (única que pode emitir Factura Genérica).
 */
export function FinancialInstitutionDialog({
  company,
  nextValue,
  isSaving,
  onConfirm,
  onCancel,
}: FinancialInstitutionDialogProps) {
  return (
    <AlertDialog open={company !== null} onOpenChange={(open) => (!open && !isSaving ? onCancel() : undefined)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {nextValue ? 'Marcar como instituição financeira (banco)?' : 'Desmarcar instituição financeira (banco)?'}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Empresa: <strong className="text-foreground">{company?.company_name || '—'}</strong>
                <br />
                NIF: <strong className="text-foreground">{company?.tax_number || '—'}</strong>
              </p>
              <p>Só as instituições financeiras (bancos) podem emitir Factura Genérica (GF).</p>
              {nextValue ? (
                <p>Depois de confirmar, esta empresa passa a poder emitir Factura Genérica.</p>
              ) : (
                <p className="font-medium text-destructive">
                  Esta empresa deixa de poder emitir Factura Genérica. As facturas genéricas já emitidas
                  mantêm-se válidas.
                </p>
              )}
              <p>A alteração pode demorar até 60 segundos a ter efeito na emissão de documentos.</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSaving}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={isSaving}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
          >
            {isSaving ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            {nextValue ? 'Marcar como banco' : 'Desmarcar banco'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
