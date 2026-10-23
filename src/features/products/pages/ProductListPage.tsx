import { useMemo, useState } from 'react';
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
import { PRODUCT_TYPE_OPTIONS, productTypeLabel, unitOfMeasureLabel } from '../constants';
import { useProductCategories } from '../hooks/useProductCategories';
import { useProducts } from '../hooks/useProducts';
import type { ProductStatusFilter, ProductType } from '../types';

const ALL = 'all';

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

function formatPrice(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return '—';
  return `${value.toLocaleString('pt-AO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} Kz`;
}
export function ProductListPage() {
  useDocumentTitle('Produtos');

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
    toggleActive,
  } = useProducts();

  const { categories } = useProductCategories();

  const [draftSearch, setDraftSearch] = useState('');
  const [draftType, setDraftType] = useState<'all' | ProductType>(ALL);
  const [draftStatus, setDraftStatus] = useState<'all' | ProductStatusFilter>(ALL);
  const [draftCategory, setDraftCategory] = useState<string>(ALL);

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((category) => map.set(category.id, category.name));
    return map;
  }, [categories]);

  const applyFilters = () => {
    setPage(1);
    setFilters({
      search: draftSearch.trim() || undefined,
      product_type: draftType === ALL ? undefined : draftType,
      status: draftStatus === ALL ? undefined : draftStatus,
      category_id: draftCategory === ALL ? undefined : draftCategory,
    });
  };

  const clearFilters = () => {
    setDraftSearch('');
    setDraftType(ALL);
    setDraftStatus(ALL);
    setDraftCategory(ALL);
    setPage(1);
    setFilters({});
  };

  const hasFilters =
    draftSearch.trim() !== '' ||
    draftType !== ALL ||
    draftStatus !== ALL ||
    draftCategory !== ALL;

  const totalPages = meta.last_page || 1;

  return (
    <div className="space-y-6 p-6 lg:p-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Produtos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Catálogo de produtos e serviços (SAF-T) da empresa da sessão.
          </p>
        </div>
        <Button asChild>
          <Link to="/products/create">
            <Plus className="h-4 w-4" />
            Novo Produto
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="search">Pesquisar</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Código, descrição ou grupo…"
                  className="pl-8"
                  value={draftSearch}
                  onChange={(event) => setDraftSearch(event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={draftType}
                onValueChange={(value) => setDraftType(value as 'all' | ProductType)}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos</SelectItem>
                  {PRODUCT_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={draftCategory} onValueChange={setDraftCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todas</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
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
                  setDraftStatus(value as 'all' | ProductStatusFilter)
                }
              >
                <SelectTrigger id="status">
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
              {hasFilters ? (
                <Button variant="outline" onClick={clearFilters}>
                  Limpar
                </Button>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Catálogo de produtos</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <FormAlert variant="error" title="Erro ao carregar os produtos" message={error} />
              <Button variant="outline" onClick={() => void refresh()}>
                <RotateCw className="size-4" />
                Tentar novamente
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Grupo</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Preço</TableHead>
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
                          Nenhum produto encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="font-medium text-foreground">
                              {item.product_description}
                            </div>
                            <div className="font-mono text-xs text-muted-foreground">
                              {item.product_code}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{productTypeLabel(item.product_type)}</Badge>
                          </TableCell>
                          <TableCell>{item.product_group || '—'}</TableCell>
                          <TableCell>
                            {item.category_id
                              ? categoryNameById.get(item.category_id) ?? '—'
                              : '—'}
                          </TableCell>
                          <TableCell>
                            {formatPrice(item.unit_price)}
                            <span className="block text-xs text-muted-foreground">
                              {unitOfMeasureLabel(item.unit_of_measure)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <StatusBadge active={item.is_active} />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button asChild variant="ghost" size="sm">
                                <Link to={`/products/${item.id}/edit`}>Editar</Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={togglingId === item.id}
                                onClick={() => void toggleActive(item.id, !item.is_active)}
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
          {!error && meta.total > 0 ? (
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
          ) : null}

          {!error && !isLoading && meta.total === 0 ? (
            <div className="flex justify-center pt-4">
              <Button variant="outline" size="sm" onClick={() => void refresh()}>
                <RotateCw className="h-4 w-4" />
                Actualizar
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}



