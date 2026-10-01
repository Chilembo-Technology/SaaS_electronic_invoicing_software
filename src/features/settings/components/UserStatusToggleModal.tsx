import { AlertTriangle, Loader2 } from 'lucide-react';

import { Button } from '../../../app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../app/components/ui/dialog';
import { FormAlert } from '../../../components/forms/FormAlert';
import type { UserListItem } from '../types/user.types';

interface UserStatusToggleModalProps {
  user: UserListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isProcessing: boolean;
  error: string | null;
  onConfirm: () => void;
}

/** Modal de confirmação para ativar/desativar um utilizador. */
export function UserStatusToggleModal({
  user,
  open,
  onOpenChange,
  isProcessing,
  error,
  onConfirm,
}: UserStatusToggleModalProps) {
  if (!user) return null;

  const willActivate = user.status !== 'active';
  const fullName = `${user.first_name} ${user.last_name}`.trim() || user.email;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle
              size={18}
              className={willActivate ? 'text-brand-green' : 'text-destructive'}
              aria-hidden="true"
            />
            {willActivate ? 'Ativar utilizador' : 'Desativar utilizador'}
          </DialogTitle>
          <DialogDescription>
            {willActivate
              ? `Tem a certeza que quer ativar ${fullName}? O utilizador voltará a poder iniciar sessão.`
              : `Tem a certeza que quer desativar ${fullName}? O utilizador deixará de conseguir iniciar sessão.`}
          </DialogDescription>
        </DialogHeader>

        {error ? <FormAlert variant="error" message={error} /> : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant={willActivate ? 'default' : 'destructive'}
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : null}
            {isProcessing ? 'A processar…' : willActivate ? 'Ativar' : 'Desativar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
