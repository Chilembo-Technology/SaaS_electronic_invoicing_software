import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ChevronDown, Download, FileText, Loader2, Plus, RotateCw } from 'lucide-react';

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../app/components/ui/dropdown-menu';
import {
  DOCUMENT_TYPES,
  INVOICE_TYPE_OPTIONS,
  invoiceTypeLabel,
} from '../constants';
import { useInvoices } from '../hooks/useInvoices';
import type { Invoice } from '../types';

function formatMoney(value?: number): string {
  const amount = typeof value === 'number' ? value : 0;
  return `${amount.toLocaleString('pt-AO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} Kz`;
}

function formatDate(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('pt-AO');
}

export function InvoiceListPage() {
  useDocumentTitle('Faturas');
  const navigate = useNavigate();

  const {
    invoices,
    meta,
    isLoading,
    error,
    page,
    setPage,
    setFilters,
    refresh,
  } = useInvoices();

  const [draftType, setDraftType] = useState('all');
  const [draftCustomer, setDraftCustomer] = useState('');
  const [draftStart, setDraftStart] = useState('');
  const [draftEnd, setDraftEnd] = useState('');

  const applyFilters = () => {
    setPage(1);
    setFilters({
      invoice_type: draftType && draftType !== 'all' ? draftType : undefined,
      customer_name: draftCustomer.trim() || undefined,
      start_date: draftStart || undefined,
      end_date: draftEnd || undefined,
    });
  };

  const clearFilters = () => {
    setDraftType('all');
    setDraftCustomer('');
    setDraftStart('');
    setDraftEnd('');
    setPage(1);
    setFilters({});
  };

  const openPdf = (invoice: Invoice) => {
    if (invoice.pdf_url) {
      window.open(invoice.pdf_url, '_blank', 'noopener,noreferrer');
    }
  };

  const hasFilters =
    draftType !== 'all' || Boolean(draftCustomer || draftStart || draftEnd);

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Faturas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Lista de documentos fiscais da sua empresa.
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Plus className="mr-2 size-4" aria-hidden="true" />
              Novo Documento
              <ChevronDown className="ml-2 size-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {DOCUMENT_TYPES.map((doc) => (
              <DropdownMenuItem
                key={doc.code}
                onClick={() => {
                  console.log('Clicou no documento:', doc.code);
                  navigate(`/invoices/create/${doc.code}`);
                }}
              >
                {doc.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="filter-type">Tipo de documento</Label>
            <Select value={draftType} onValueChange={setDraftType}>
              <SelectTrigger id="filter-type">
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {INVOICE_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="filter-customer">Cliente</Label>
            <Input
              id="filter-customer"
              value={draftCustomer}
              onChange={(e) => setDraftCustomer(e.target.value)}
              placeholder="Nome do cliente"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="filter-start">Data inicial</Label>
            <Input
              id="filter-start"
              type="date"
              value={draftStart}
              onChange={(e) => setDraftStart(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="filter-end">Data final</Label>
            <Input
              id="filter-end"
              type="date"
              value={draftEnd}
              onChange={(e) => setDraftEnd(e.target.value)}
            />
          </div>
        </CardContent>
        <div className="px-6 pb-6 flex flex-wrap items-center gap-2">
          <Button onClick={applyFilters}>Filtrar</Button>
          {hasFilters ? (
            <Button variant="outline" onClick={clearFilters}>
              Limpar
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => void refresh()}
            aria-label="Atualizar lista"
          >
            <RotateCw className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </Card>

      {error ? <FormAlert variant="error" message={error} /> : null}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
              A carregar faturas…
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <FileText className="size-10 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                Nenhuma fatura encontrada.
              </p>
              <Button asChild variant="outline">
                <Link to="/invoices/create/FT">Emitir o primeiro documento</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Número</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {invoiceTypeLabel(invoice.invoice_type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {invoice.invoice_no ?? '—'}
                      </TableCell>
                      <TableCell>{formatDate(invoice.invoice_date)}</TableCell>
                      <TableCell>{invoice.customer_code ?? '—'}</TableCell>
                      <TableCell className="text-right">
                        {formatMoney(invoice.gross_total)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openPdf(invoice)}
                          disabled={!invoice.pdf_url}
                          aria-label="Descarregar PDF"
                          title={
                            invoice.pdf_url
                              ? 'Descarregar PDF'
                              : 'PDF indisponível'
                          }
                        >
                          <Download className="size-4" aria-hidden="true" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {!isLoading && invoices.length > 0 ? (
            <div className="flex items-center justify-between gap-2 border-t pt-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Página {meta.current_page} de {Math.max(meta.last_page, 1)} ·{' '}
                {meta.total} registo(s)
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
