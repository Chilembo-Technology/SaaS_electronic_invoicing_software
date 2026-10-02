import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../app/components/ui/table';
import type { UserListItem } from '../types/user.types';
import { UserRow } from './UserRow';

interface UsersTableProps {
  users: UserListItem[];
  /** id do utilizador autenticado (não pode desativar-se a si próprio). */
  currentUserId: string;
  onEdit: (user: UserListItem) => void;
  onToggleStatus: (user: UserListItem) => void;
}

export function UsersTable({ users, currentUserId, onEdit, onToggleStatus }: UsersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="px-3">Utilizador</TableHead>
          <TableHead className="px-3">Papel</TableHead>
          <TableHead className="px-3">Estado</TableHead>
          <TableHead className="px-3 text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <UserRow
            key={user.id}
            user={user}
            isSelf={user.id === currentUserId}
            onEdit={onEdit}
            onToggleStatus={onToggleStatus}
          />
        ))}
      </TableBody>
    </Table>
  );
}
