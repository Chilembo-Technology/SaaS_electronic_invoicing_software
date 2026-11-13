import { useState, type FormEvent } from 'react';
import { Landmark, Loader2, RotateCw, Search } from 'lucide-react';
import { toast } from 'sonner';

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
import { Switch } from '../../../app/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../app/components/ui/table';
import { FormAlert } from '../../../components/forms/FormAlert';
import { useAuth } from '../../../contexts/AuthContext';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { normalizeApiError } from '../../auth/utils/apiError';
import { isSuperAdmin } from '../../settings/utils/session';
import { FinancialInstitutionDialog } from '../components/FinancialInstitutionDialog';
import { useAdminCompanies } from '../hooks/useAdminCompanies';
import { platformCompaniesService } from '../services/platformCompaniesService';
import type { AdminCompany, FinancialInstitutionFilter } from '../types';

const STATUS_LABELS: Record<string, string> = {
  active: 'Activa',
  inactive: 'Inactiva',
  suspended: 'Suspensa',
  cancelled: 'Cancelada',
  pending: 'Pendente',
};

/**
 * Gestão das empresas da plataforma (rota /empresas, só super-admin).
 * Permite marcar/desmarcar instituições financeiras (Factura Genérica).
 */
export function CompaniesAdminPage() {
  useDocumentTitle('Empresas');

  const { user } = useAuth();
  // A rota já é protegida por RequireSuperAdmin; o interruptor volta a
  // confirmar o papel (o backend responde 403 a qualquer outro).
  const canManageFinancialInstitution = isSuperAdmin(user);

  const { companies, filters, applyFilters, page, setPage, total, isLastPage, isLoading, error, refresh, replaceCompany } =
    useAdminCompanies();

  const [search, setSearch] = useState('');
  const [pending, setPending] = useState<{ company: AdminCompany; nextValue: boolean } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    applyFilters({ ...filters, search });
  };

  const confirmFinancialInstitution = async () => {
    if (!pending) return;

    setIsSaving(true);
    try {
      const updated = await platformCompaniesService.setFinancialInstitution(pending.company.id, pending.nextValue);
      replaceCompany({ ...pending.company, ...updated, is_financial_institution: pending.nextValue });
      toast.success(
        pending.nextValue
          ? `${pending.company.company_name} marcada como instituição financeira.`
          : `${pending.company.company_name} deixou de ser instituição financeira.`,
        { description: 'A alteração pode demorar até 60 segundos a ter efeito na emissão de documentos.' },
      );
      setPending(null);
    } catch (err) {
      toast.error('Não foi possível alterar a indicação de instituição financeira.', {
        description: normalizeApiError(err).message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Empresas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Todas as empresas da plataforma. Só as instituições financeiras (bancos) podem emitir Factura Genérica.
          </p>
        </div>
        <Button variant="outline" onClick={() => void refresh()} disabled={isLoading}>
          <RotateCw className="size-4" aria-hidden="true" />
          Actualizar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitSearch} className="grid gap-4 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end">
            <div className="space-y-1.5">
              <Label htmlFor="company-search">Nome ou NIF</Label>
              <Input
                id="company-search"
                className="bg-muted border-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ex.: Banco, 5410003691"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company-status">Estado</Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => applyFilters({ ...filters, status: value === 'all' ? undefined : value })}
              >
                <SelectTrigger id="company-status" className="bg-muted border-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company-bank-filter">Instituição financeira</Label>
              <Select
                value={filters.financialInstitution ?? 'all'}
                onValueChange={(value) =>
                  applyFilters({ ...filters, financialInstitution: value as FinancialInstitutionFilter })
                }
              >
                <SelectTrigger id="company-bank-filter" className="bg-muted border-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="banks">Só bancos</SelectItem>
                  <SelectItem value="non-banks">Sem bancos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">
              <Search className="size-4" aria-hidden="true" />
              Pesquisar
            </Button>
          </form>
        </CardContent>
      </Card>

      {error ? <FormAlert variant="error" message={error} /> : null}

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              A carregar empresas…
            </div>
          ) : companies.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Nenhuma empresa encontrada.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>NIF</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Estado</TableHead>
                  {canManageFinancialInstitution ? <TableHead>Instituição financeira (banco)</TableHead> : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{company.company_name || '—'}</span>
                        {company.is_financial_institution ? (
                          <Badge variant="secondary" className="gap-1">
                            <Landmark className="size-3" aria-hidden="true" />
                            Banco
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>{company.tax_number || '—'}</TableCell>
                    <TableCell>{company.admin_email || '—'}</TableCell>
                    <TableCell>{STATUS_LABELS[company.status] ?? company.status ?? '—'}</TableCell>
                    {canManageFinancialInstitution ? (
                      <TableCell>
                        <Switch
                          checked={company.is_financial_institution}
                          onCheckedChange={(checked) => setPending({ company, nextValue: checked })}
                          aria-label={`Instituição financeira (banco): ${company.company_name}`}
                        />
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>{total} empresa(s)</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1 || isLoading} onClick={() => setPage(page - 1)}>
                Anterior
              </Button>
              <Button variant="outline" size="sm" disabled={isLastPage || isLoading} onClick={() => setPage(page + 1)}>
                Seguinte
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {canManageFinancialInstitution ? (
        <FinancialInstitutionDialog
          company={pending?.company ?? null}
          nextValue={pending?.nextValue ?? false}
          isSaving={isSaving}
          onConfirm={() => void confirmFinancialInstitution()}
          onCancel={() => setPending(null)}
        />
      ) : null}
    </div>
  );
}
