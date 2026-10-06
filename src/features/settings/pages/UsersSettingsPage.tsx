import { useMemo, useState } from 'react';
import { Loader2, Search, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '../../../app/components/ui/button';
import { Input } from '../../../app/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../app/components/ui/select';
import { FormAlert } from '../../../components/forms/FormAlert';
import { useAuth } from '../../../contexts/AuthContext';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { CreateUserModal } from '../components/CreateUserModal';
import { EditUserModal } from '../components/EditUserModal';
import { UsersTable } from '../components/UsersTable';
import { UserStatusToggleModal } from '../components/UserStatusToggleModal';
import { useToggleUserStatus } from '../hooks/useToggleUserStatus';
import { useUsers } from '../hooks/useUsers';
import { EMPTY_USERS_FILTERS, type UserListItem, type UsersFilters } from '../types/user.types';
import { getCompanyId, getUserId, ROLE_OPTIONS } from '../utils/session';

/** Sub-página "Utilizadores": criação, listagem, filtros + editar/ativar/desativar. */
export function UsersSettingsPage() {
  useDocumentTitle('Configurações · Utilizadores');

  const { user } = useAuth();
  const currentUserId = getUserId(user);
  const companyId = getCompanyId(user);

  const { users, isLoading, error, refresh } = useUsers();
  const { setStatus, isToggling, error: toggleError } = useToggleUserStatus();

  const [filters, setFilters] = useState<UsersFilters>(EMPTY_USERS_FILTERS);
  const [editing, setEditing] = useState<UserListItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [toggling, setToggling] = useState<UserListItem | null>(null);

  const filtered = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    return users.filter((item) => {
      if (filters.status && item.status !== filters.status) return false;
      if (filters.role && !item.roles.includes(filters.role)) return false;
      if (term) {
        const haystack = `${item.first_name} ${item.last_name} ${item.email}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [users, filters]);

  const handleConfirmToggle = async () => {
    if (!toggling) return;
    const activate = toggling.status !== 'active';

    try {
      await setStatus(toggling.id, activate);
      toast.success(activate ? 'Utilizador ativado com sucesso.' : 'Utilizador desativado com sucesso.');
      setToggling(null);
      await refresh();
    } catch {
      // O erro fica visível no próprio modal (`toggleError`).
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Utilizadores</h2>
          <p className="text-sm text-muted-foreground">
            Adicione, ative, desative e edite os utilizadores da sua empresa.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="h-11 shrink-0 rounded-xl"
        >
          <UserPlus size={16} aria-hidden="true" />
          Adicionar Utilizador
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={filters.search}
            onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
            placeholder="Pesquisar por nome ou email"
            className="h-11 rounded-xl pl-9"
            aria-label="Pesquisar utilizadores"
          />
        </div>

        <Select
          value={filters.role || 'all'}
          onValueChange={(value) => setFilters((prev) => ({ ...prev, role: value === 'all' ? '' : value }))}
        >
          <SelectTrigger className="h-11 w-full rounded-xl sm:w-52">
            <SelectValue placeholder="Todos os papéis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os papéis</SelectItem>
            {ROLE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status || 'all'}
          onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value === 'all' ? '' : value }))}
        >
          <SelectTrigger className="h-11 w-full rounded-xl sm:w-44">
            <SelectValue placeholder="Todos os estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os estados</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error ? (
        <FormAlert variant="error" title="Não foi possível carregar os utilizadores" message={error} />
      ) : isLoading ? (
        <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
          <Loader2 size={18} className="animate-spin" aria-hidden="true" />
          A carregar utilizadores…
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <UsersTable
            users={filtered}
            currentUserId={currentUserId}
            onEdit={setEditing}
            onToggleStatus={setToggling}
          />
          {filtered.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">
              Nenhum utilizador corresponde aos filtros.
            </p>
          ) : null}
        </div>
      )}

      <EditUserModal
        user={editing}
        companyId={companyId}
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        onSaved={() => void refresh()}
      />

      <CreateUserModal
        companyId={companyId}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreated={() => void refresh()}
      />

      <UserStatusToggleModal
        user={toggling}
        open={toggling !== null}
        onOpenChange={(open) => {
          if (!open) setToggling(null);
        }}
        isProcessing={isToggling}
        error={toggleError}
        onConfirm={handleConfirmToggle}
      />
    </div>
  );
}
