import { useState, type FormEvent } from 'react';
import { AlertTriangle, Download, FileCode2, Loader2, RotateCw } from 'lucide-react';

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
import { FieldError } from '../../../components/forms/FieldError';
import { FormAlert } from '../../../components/forms/FormAlert';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { todayInAngola } from '@/lib/angolaTime';
import { isSaftExportRunning, useSaftExports } from '../hooks/useSaftExports';
import type { SaftExport } from '../types';
import {
  SAFT_STATUS_LABELS,
  buildSaftRequest,
  formatFileSize,
  xsdLabel,
  type SaftPeriodMode,
} from '../utils/period';

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function formatDate(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('pt-AO');
}

function formatPeriod(item: SaftExport): string {
  const toPt = (iso: string) => iso.split('-').reverse().join('/');
  return `${toPt(item.start_date)} a ${toPt(item.end_date)}`;
}

function statusVariant(status: SaftExport['status']): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'available') return 'default';
  if (status === 'failed') return 'destructive';
  return 'secondary';
}

/**
 * Exportar SAF-T (AO): pedido por ano, mês ou intervalo; histórico com estado,
 * validação XSD, avisos/erros e download por URL temporário. Só administradores.
 */
export function SaftExportPage() {
  useDocumentTitle('Exportar SAF-T');

  const today = todayInAngola();
  const currentYear = Number(today.slice(0, 4));
  const years = Array.from({ length: 6 }, (_, index) => String(currentYear - index));

  const { items, isLoading, isRequesting, error, fieldErrors, requestExport, download, reload } = useSaftExports();
  const [mode, setMode] = useState<SaftPeriodMode>('year');
  const [year, setYear] = useState(String(currentYear));
  const [month, setMonth] = useState(today.slice(5, 7).replace(/^0/, ''));
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState(today);
  const [localError, setLocalError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const request = buildSaftRequest({ mode, year, month, startDate, endDate });
    if (typeof request === 'string') {
      setLocalError(request);
      return;
    }
    setLocalError(null);
    await requestExport(request);
  };

  const shownError = localError ?? error;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-start gap-3">
        <FileCode2 className="mt-1 h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold">Exportar SAF-T</h1>
          <p className="text-sm text-muted-foreground">
            Ficheiro SAF-T (AO) da empresa para a AGT: facturas, guias, documentos de conferência e recibos do período.
          </p>
        </div>
      </div>

      {shownError ? <FormAlert variant="error" message={shownError} onDismiss={() => setLocalError(null)} /> : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Novo ficheiro</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="saft-mode">Período</Label>
              <Select value={mode} onValueChange={(value) => setMode(value as SaftPeriodMode)}>
                <SelectTrigger id="saft-mode"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="year">Ano fiscal completo</SelectItem>
                  <SelectItem value="month">Mês</SelectItem>
                  <SelectItem value="range">Intervalo de datas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {mode !== 'range' ? (
              <div className="space-y-2">
                <Label htmlFor="saft-year">Ano fiscal</Label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger id="saft-year"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {years.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                  </SelectContent>
                </Select>
                {fieldErrors.fiscal_year ? <FieldError message={fieldErrors.fiscal_year} /> : null}
              </div>
            ) : null}

            {mode === 'month' ? (
              <div className="space-y-2">
                <Label htmlFor="saft-month">Mês</Label>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger id="saft-month"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((name, index) => (
                      <SelectItem key={name} value={String(index + 1)}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.month ? <FieldError message={fieldErrors.month} /> : null}
              </div>
            ) : null}

            {mode === 'range' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="saft-start">De</Label>
                  <Input id="saft-start" type="date" value={startDate} max={today} onChange={(e) => setStartDate(e.target.value)} />
                  {fieldErrors.start_date ? <FieldError message={fieldErrors.start_date} /> : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="saft-end">Até</Label>
                  <Input id="saft-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  {fieldErrors.end_date ? <FieldError message={fieldErrors.end_date} /> : null}
                </div>
              </>
            ) : null}

            <Button type="submit" disabled={isRequesting}>
              {isRequesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileCode2 className="mr-2 h-4 w-4" />}
              Gerar ficheiro SAF-T
            </Button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">
            A geração corre em segundo plano; esta página actualiza-se sozinha. Os documentos de formação não são incluídos.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-base">Histórico</CardTitle>
          <Button variant="outline" size="sm" onClick={() => void reload()}>
            <RotateCw className="mr-2 h-4 w-4" /> Actualizar
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> A carregar…
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ainda não foi gerado nenhum ficheiro SAF-T.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Período</TableHead>
                    <TableHead>Pedido em</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Validação</TableHead>
                    <TableHead>Avisos</TableHead>
                    <TableHead className="text-right">Ficheiro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
                    const xsd = xsdLabel(item);
                    const hasDetails = item.warnings.length > 0 || item.errors.length > 0;
                    const isOpen = expanded === item.id;

                    return [
                      <TableRow key={item.id}>
                        <TableCell className="whitespace-nowrap">{formatPeriod(item)}</TableCell>
                        <TableCell className="whitespace-nowrap">{formatDate(item.created_at)}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(item.status)}>
                            {isSaftExportRunning(item) ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                            {SAFT_STATUS_LABELS[item.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {xsd ? (
                            <span className={item.xsd_status === 'validated' ? 'text-sm' : 'inline-flex items-center gap-1 text-sm text-amber-700'}>
                              {item.xsd_status !== 'validated' ? <AlertTriangle className="h-4 w-4" /> : null}
                              {xsd}
                            </span>
                          ) : '—'}
                        </TableCell>
                        <TableCell>
                          {hasDetails ? (
                            <Button variant="link" size="sm" className="px-0" onClick={() => setExpanded(isOpen ? null : item.id)}>
                              {item.errors.length > 0 ? `${item.errors.length} erro(s)` : `${item.warnings.length} aviso(s)`}
                            </Button>
                          ) : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.download_available ? (
                            <Button size="sm" variant="outline" onClick={() => void download(item.id)} title={item.file_sha256 ?? undefined}>
                              <Download className="mr-2 h-4 w-4" /> {formatFileSize(item.file_size)}
                            </Button>
                          ) : '—'}
                        </TableCell>
                      </TableRow>,
                      isOpen ? (
                        <TableRow key={`${item.id}-details`}>
                          <TableCell colSpan={6} className="bg-muted/40">
                            {item.errors.length > 0 ? (
                              <ul className="mb-2 list-disc space-y-1 pl-5 text-sm text-destructive">
                                {item.errors.map((message, index) => <li key={index}>{message}</li>)}
                              </ul>
                            ) : null}
                            <ul className="list-disc space-y-1 pl-5 text-sm">
                              {item.warnings.map((warning) => (
                                <li key={warning.code}>
                                  {warning.message}
                                  {warning.count > 1 ? ` (${warning.count})` : ''}
                                  {warning.examples.length > 0 ? (
                                    <span className="text-muted-foreground"> — ex.: {warning.examples.join(', ')}</span>
                                  ) : null}
                                </li>
                              ))}
                            </ul>
                            {item.file_sha256 ? (
                              <p className="mt-2 break-all text-xs text-muted-foreground">SHA-256: {item.file_sha256}</p>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      ) : null,
                    ];
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
