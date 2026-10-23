import { useState } from 'react';
import { Link } from 'react-router';
import { Loader2, Plus, RotateCw, Search } from 'lucide-react';

import { Badge } from '../../../app/components/ui/badge';
import { Button } from '../../../app/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../app/components/ui/card';
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
import { useVatExemptions } from '../hooks/useVatExemptions';
import type { VatExemption, VatExemptionStatusFilter } from '../types';

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        active
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

export function VatExemptionListPage() {
  useDocumentTitle('Motivos de Isenção');

  const { items, meta, isLoading, error, page, setPage, setFilters, refresh } =
    useVatExemptions();

  const [draftSearch, setDraftSearch] = useState('');
  const [draftStatus, setDraftStatus] = useState<'all' | VatExemptionStatusFilter>('all');

  const applyFilters = () => {
    setPage(1);
    setFilters({
      search: draftSearch.trim() || undefined,
      status: draftStatus === 'all' ? undefined : draftStatus,
    });
  };

  const clearFilters = () => {
    setDraftSearch('');
    setDraftStatus('all');
    setPage(1);
    setFilters({});
  };

  const hasFilters = draftSearch.trim() !== '' || draftStatus !== 'all';

  return (
    <div className="space-y-6 p-6 lg:p-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Motivos de Isenção</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Motivos de isenção de IVA (códigos M##) usados na emissão de documentos.
          </p>
        </div>
        <Button asChild>
          <Link to="/vat-exemptions/create">
            <Plus className="size-4" aria-hidden="true" />
            Nova Isenção
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="search">Pesquisa</Label>
              <Input
                id="search"
                placeholder="Código ou descrição"
                value={draftSearch}
                onChange={(e) => setDraftSearch(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={draftStatus}
                onValueChange={(value) =>
                  setDraftStatus(value as 'all' | VatExemptionStatusFilter)
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2 sm:col-span-2">
              <Button type="button" onClick={applyFilters}>
                <Search className="size-4" aria-hidden="true" />
                Filtrar
              </Button>
              {hasFilters ? (
                <Button type="button" variant="outline" onClick={clearFilters}>
                  Limpar
                </Button>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {error ? (
            <div className="space-y-4">
              <FormAlert variant="error" message={error} />
              <Button variant="outline" size="sm" onClick={() => void refresh()}>
                <RotateCw className="size-4" aria-hidden="true" />
                Tentar novamente
              </Button>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              A carregar…
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhum motivo de isenção encontrado.
              </p>
              <Button asChild variant="outline">
                <Link to="/vat-exemptions/create">Criar o primeiro motivo</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Base Legal</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item: VatExemption) => (
                    <TableRow key={item.code}>
                      <TableCell>
                        <Badge variant="outline">{item.code}</Badge>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <span className="line-clamp-2">{item.description}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.legal_basis ?? '—'}
                      </TableCell>
                      <TableCell>
                        <StatusBadge active={item.is_active} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link to={`/vat-exemptions/${item.code}/edit`}>Editar</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {!isLoading && !error && items.length > 0 ? (
            <div className="mt-4 flex items-center justify-between gap-2 border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Página {meta.current_page} de {Math.max(meta.last_page, 1)} · {meta.total}{' '}
                registo(s)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.last_page}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Próxima
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

