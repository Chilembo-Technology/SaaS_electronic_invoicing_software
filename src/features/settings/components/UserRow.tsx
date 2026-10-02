import { Pencil, UserCheck, UserX } from 'lucide-react';

import { TableCell, TableRow } from '../../../app/components/ui/table';
import type { UserListItem } from '../types/user.types';
import { getInitials, roleLabel } from '../utils/session';

interface UserRowProps {
  user: UserListItem;
  /** `true` quando é o próprio utilizador autenticado. */
  isSelf: boolean;
  onEdit: (user: UserListItem) => void;
  onToggleStatus: (user: UserListItem) => void;
}

/** Linha da tabela de utilizadores (avatar, contacto, papel, estado e ações). */
export function UserRow({ user, isSelf, onEdit, onToggleStatus }: UserRowProps) {
  const fullName = `${user.first_name} ${user.last_name}`.trim() || 'Sem nome';
  const active = user.status === 'active';

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-semibold text-muted-foreground">
            {user.path_photo ? (
              <img src={user.path_photo} alt="" className="h-full w-full object-cover" />
            ) : (
              getInitials(fullName)
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {fullName}
              {isSelf ? <span className="ml-2 text-xs text-muted-foreground">(você)</span> : null}
            </p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
          {roleLabel(user.roles[0])}
        </span>
      </TableCell>

      <TableCell>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            active
              ? 'border border-brand-green/30 bg-brand-green/10 text-brand-green'
              : 'border border-destructive/30 bg-destructive/10 text-destructive'
          }`}
        >
          {active ? 'Ativo' : 'Inativo'}
        </span>
      </TableCell>

      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => onEdit(user)}
            title="Editar utilizador"
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Pencil size={15} aria-hidden="true" />
            Editar
          </button>
          <button
            type="button"
            onClick={() => onToggleStatus(user)}
            disabled={isSelf}
            title={isSelf ? 'Não pode alterar o seu próprio estado' : active ? 'Desativar' : 'Ativar'}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              active
                ? 'text-destructive hover:bg-destructive/10'
                : 'text-brand-green hover:bg-brand-green/10'
            }`}
          >
            {active ? <UserX size={15} aria-hidden="true" /> : <UserCheck size={15} aria-hidden="true" />}
            {active ? 'Desativar' : 'Ativar'}
          </button>
        </div>
      </TableCell>
    </TableRow>
  );
}
