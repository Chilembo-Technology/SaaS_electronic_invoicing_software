import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, FileCheck2, Loader2, Plus, Trash2 } from 'lucide-react';

import { Button } from '../../../app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../app/components/ui/card';
import { Input } from '../../../app/components/ui/input';
import { Label } from '../../../app/components/ui/label';
import { FieldError } from '../../../components/forms/FieldError';
import { FormAlert } from '../../../components/forms/FormAlert';
import { FormField } from '../../../components/forms/FormField';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useCreateInvoice } from '../hooks/useCreateInvoice';
import type { CreateInvoicePayload } from '../types';

interface LineDraft {
  id: string;
  product_code: string;
  product_description: string;
  quantity: string;
  unit_price: string;
  tax_percentage: string;
}

function makeLine(): LineDraft {
  return {
    id: crypto.randomUUID(),
    product_code: '',
    product_description: '',
    quantity: '1',
    unit_price: '0',
    tax_percentage: '',
  };
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function toNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value: number): string {
  return `${value.toLocaleString('pt-AO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} Kz`;
}
export function InvoiceCreatePage() {
  useDocumentTitle('Emitir fatura');

  const {
    createInvoice,
    isLoading,
    error,
    fieldErrors,
    createdInvoice,
    reset,
  } = useCreateInvoice();

  const [customerCode, setCustomerCode] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerTaxId, setCustomerTaxId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(today());
  const [eacCode, setEacCode] = useState('');
  const [lines, setLines] = useState<LineDraft[]>([makeLine()]);
  const [localError, setLocalError] = useState<string | null>(null);

  const addLine = () => setLines((current) => [...current, makeLine()]);
  const removeLine = (id: string) =>
    setLines((current) => current.filter((line) => line.id !== id));
  const updateLine = (id: string, patch: Partial<LineDraft>) =>
    setLines((current) =>
      current.map((line) => (line.id === id ? { ...line, ...patch } : line)),
    );

  const resetForm = () => {
    reset();
    setCustomerCode('');
    setCustomerName('');
    setCustomerTaxId('');
    setInvoiceDate(today());
    setEacCode('');
    setLines([makeLine()]);
    setLocalError(null);
  };

  const subtotal = lines.reduce(
    (sum, line) => sum + toNumber(line.quantity) * toNumber(line.unit_price),
    0,
  );
  const tax = lines.reduce((sum, line) => {
    const base = toNumber(line.quantity) * toNumber(line.unit_price);
    const pct = line.tax_percentage === '' ? 0 : toNumber(line.tax_percentage);
    return sum + (base * pct) / 100;
  }, 0);
  const total = subtotal + tax;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!customerCode.trim()) {
      setLocalError('O código do cliente é obrigatório.');
      return;
    }
    const invalidLine = lines.find(
      (line) =>
        !line.product_code.trim() ||
        !line.product_description.trim() ||
        toNumber(line.quantity) <= 0,
    );
    if (invalidLine) {
      setLocalError(
        'Todas as linhas precisam de código, descrição e quantidade superior a zero.',
      );
      return;
    }

    setLocalError(null);

    const payload: CreateInvoicePayload = {
      customer_code: customerCode.trim(),
      customer_name: customerName.trim() || undefined,
      customer_tax_id: customerTaxId.trim() || undefined,
      invoice_date: invoiceDate,
      eac_code: eacCode.trim() || undefined,
      lines: lines.map((line) => ({
        product_code: line.product_code.trim(),
        product_description: line.product_description.trim(),
        quantity: toNumber(line.quantity),
        unit_price: toNumber(line.unit_price),
        tax_percentage:
          line.tax_percentage === '' ? undefined : toNumber(line.tax_percentage),
      })),
    };

    await createInvoice(payload);
  };
  if (createdInvoice) {
    return (
      <div className="p-6 lg:p-10">
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck2 className="size-5 text-primary" aria-hidden="true" />
              Fatura emitida com sucesso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              O documento foi criado no fiscal_core
              {createdInvoice.invoice_no
                ? ` com o número ${createdInvoice.invoice_no}`
                : ''}
              .
            </p>
            <div className="flex flex-wrap gap-2">
              {createdInvoice.pdf_url ? (
                <Button asChild>
                  <a
                    href={createdInvoice.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Descarregar PDF
                  </a>
                </Button>
              ) : null}
              <Button variant="outline" onClick={resetForm}>
                Emitir outra fatura
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/invoices">Ver faturas</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
          <Link to="/invoices">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Voltar às faturas
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold text-foreground">Emitir fatura</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Preencha os dados do documento e as linhas de produto.
        </p>
      </div>

      {error || localError ? (
        <FormAlert variant="error" message={localError ?? error ?? ''} />
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados do documento</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="customer_code"
              label="Código do cliente"
              required
              value={customerCode}
              onChange={setCustomerCode}
              placeholder="CLI-0001"
              error={fieldErrors.customerCode}
            />
            <FormField
              id="customer_name"
              label="Nome do cliente (opcional)"
              value={customerName}
              onChange={setCustomerName}
              placeholder="Nome da entidade"
              error={fieldErrors.customerName}
            />
            <FormField
              id="customer_tax_id"
              label="NIF do cliente (opcional)"
              value={customerTaxId}
              onChange={setCustomerTaxId}
              placeholder="5412345678"
              error={fieldErrors.customerTaxId}
            />
            <div className="space-y-1.5">
              <Label htmlFor="invoice_date">Data da fatura</Label>
              <Input
                id="invoice_date"
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
              {fieldErrors.invoiceDate ? (
                <FieldError message={fieldErrors.invoiceDate} />
              ) : null}
            </div>
            <FormField
              id="eac_code"
              label="Código EAC (opcional)"
              value={eacCode}
              onChange={setEacCode}
              placeholder="Identificador de assinatura"
              error={fieldErrors.eacCode}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-base">Linhas de produto</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addLine}>
              <Plus className="size-4" aria-hidden="true" />
              Adicionar linha
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {lines.map((line, index) => (
              <div
                key={line.id}
                className="grid gap-3 rounded-md border p-4 sm:grid-cols-12"
              >
                <div className="space-y-1.5 sm:col-span-4">
                  <Label htmlFor={`line-${line.id}-code`}>Código do produto</Label>
                  <Input
                    id={`line-${line.id}-code`}
                    value={line.product_code}
                    onChange={(e) =>
                      updateLine(line.id, { product_code: e.target.value })
                    }
                    placeholder="PROD-0001"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-4">
                  <Label htmlFor={`line-${line.id}-desc`}>Descrição</Label>
                  <Input
                    id={`line-${line.id}-desc`}
                    value={line.product_description}
                    onChange={(e) =>
                      updateLine(line.id, { product_description: e.target.value })
                    }
                    placeholder="Descrição do produto"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-1">
                  <Label htmlFor={`line-${line.id}-qty`}>Qtd.</Label>
                  <Input
                    id={`line-${line.id}-qty`}
                    type="number"
                    min="0"
                    step="any"
                    value={line.quantity}
                    onChange={(e) =>
                      updateLine(line.id, { quantity: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-1">
                  <Label htmlFor={`line-${line.id}-price`}>Preço</Label>
                  <Input
                    id={`line-${line.id}-price`}
                    type="number"
                    min="0"
                    step="any"
                    value={line.unit_price}
                    onChange={(e) =>
                      updateLine(line.id, { unit_price: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-1">
                  <Label htmlFor={`line-${line.id}-tax`}>IVA %</Label>
                  <Input
                    id={`line-${line.id}-tax`}
                    type="number"
                    min="0"
                    step="any"
                    value={line.tax_percentage}
                    onChange={(e) =>
                      updateLine(line.id, { tax_percentage: e.target.value })
                    }
                    placeholder="14"
                  />
                </div>
                <div className="flex items-end justify-end sm:col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLine(line.id)}
                    disabled={lines.length === 1}
                    aria-label={`Remover linha ${index + 1}`}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-col gap-1 text-sm sm:items-end">
              <div className="flex justify-between gap-4 text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between gap-4 text-muted-foreground">
                <span>Imposto (IVA)</span>
                <span>{formatMoney(tax)}</span>
              </div>
              <div className="flex justify-between gap-4 font-semibold text-foreground">
                <span>Total</span>
                <span>{formatMoney(total)}</span>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : null}
                {isLoading ? 'A emitir…' : 'Emitir fatura'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
