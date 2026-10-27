import { useState } from 'react';
import { Link } from 'react-router';
import { Loader2, Plus, Power, RotateCw, Search } from 'lucide-react';

import { Badge } from '../../../app/components/ui/badge';
import { Button } from '../../../app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../app/components/ui/card';
import { Input } from '../../../app/components/ui/input';
import { Label } from '../../../app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../app/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../app/components/ui/table';
import { FormAlert } from '../../../components/forms/FormAlert';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { CUSTOMER_TYPE_OPTIONS, customerTypeLabel } from '../constants';
import { useCustomers } from '../hooks/useCustomers';
import type { Customer, CustomerStatusFilter, CustomerType } from '../types';

const ALL = 'all';

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${active
        ? 'border-brand-green/30 bg-brand-green/10 text-brand-green'
        : 'border-muted-foreground/30 bg-muted/40 text-muted-foreground'
        }`}
    >
      <span
        className={`size-1.5 rounded-full ${active ? 'bg-brand-green' : 'bg-muted-foreground'}`}
        aria-hidden="true"
      />
      {active ? 'Ativo' : 'Inativo'}
    </span>
  );
}

function formatContact(item: Customer): string {
  if (item.telephone) return item.telephone;
  if (item.email) return item.email;
  return '—';
}

export function CustomerListPage() {
  useDocumentTitle('Clientes');

  const {
    items,
    meta,
    isLoading,
    error,
    page,
    togglingId,
    setPage,
    setFilters,
    refresh,
    toggleStatus,
  } = useCustomers();

  const [draftSearch, setDraftSearch] = useState('');
  const [draftType, setDraftType] = useState<'all' | CustomerType>(ALL);
  const [draftStatus, setDraftStatus] = useState<'all' | CustomerStatusFilter>(ALL);

  const applyFilters = () => {
    setPage(1);
    setFilters({
      search: draftSearch.trim() || undefined,
      type: draftType === ALL ? undefined : draftType,
      is_active: draftStatus === ALL ? undefined : draftStatus === 'active',
    });
  };

  const clearFilters = () => {
    setDraftSearch('');
    setDraftType(ALL);
    setDraftStatus(ALL);
    setPage(1);
    setFilters({});
  };

  const hasFilters = draftSearch.trim() !== '' || draftType !== ALL || draftStatus !== ALL;
  const totalPages = meta.last_page || 1;

  return (
    <div className="space-y-6 p-6 lg:p-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Clientes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tabela de clientes (SAF-T) associada à empresa da sessão.
          </p>
        </div>
        <Button asChild>
          <Link to="/customers/create">
            <Plus className="h-4 w-4" />
            Novo Cliente
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="search">Pesquisar</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nome, NIF ou código…"
                  className="pl-8 bg-muted border-nonesss"
                  value={draftSearch}
                  onChange={(event) => setDraftSearch(event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={draftType}
                onValueChange={(value) => setDraftType(value as 'all' | CustomerType)}
              >
                <SelectTrigger className="bg-muted border-none" id="type">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos</SelectItem>
                  {CUSTOMER_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={draftStatus}
                onValueChange={(value) =>
                  setDraftStatus(value as 'all' | CustomerStatusFilter)
                }
              >
                <SelectTrigger className="bg-muted border-none" id="status">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={applyFilters}>Filtrar</Button>
              {hasFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Limpar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <FormAlert
                variant="error"
                title="Erro ao carregar os clientes"
                message={error}
              />
              <Button variant="outline" onClick={() => void refresh()}>
                <RotateCw className="size-4" />
                Tentar novamente
              </Button>
            </div>
          )}

          {!error && (
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>NIF</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ) : items.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="h-24 text-center text-muted-foreground"
                        >
                          Nenhum cliente encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono text-sm">
                            {item.customer_code}
                          </TableCell>
                          <TableCell>{item.company_name}</TableCell>
                          <TableCell className="font-mono text-sm">
                            {item.customer_tax_id}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{customerTypeLabel(item.type)}</Badge>
                          </TableCell>
                          <TableCell>{formatContact(item)}</TableCell>
                          <TableCell>
                            <StatusBadge active={item.is_active} />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button asChild variant="ghost" size="sm">
                                <Link to={`/customers/${item.id}/edit`}>Editar</Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={togglingId === item.id}
                                onClick={() => void toggleStatus(item.id, !item.is_active)}
                              >
                                {togglingId === item.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Power className="h-4 w-4" />
                                )}
                                {item.is_active ? 'Desativar' : 'Ativar'}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {!error && meta.total > 0 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Página {page} de {totalPages} · {meta.total} registo(s)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || isLoading}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages || isLoading}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Seguinte
                </Button>
              </div>
            </div>
          )}

          {!error && !isLoading && meta.total === 0 && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" size="sm" onClick={() => void refresh()}>
                <RotateCw className="h-4 w-4" />
                Actualizar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

