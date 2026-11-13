import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, FileCheck2, Loader2, Plus, Trash2 } from 'lucide-react';

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
import { FieldError } from '../../../components/forms/FieldError';
import { FormAlert } from '../../../components/forms/FormAlert';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { CREATE_PAGE_TITLES, GF_CURRENCY_OPTIONS } from '../constants';
import { useCreateGenericInvoice } from '../hooks/useCreateGenericInvoice';
import { useCustomerOptions } from '../hooks/useCustomerOptions';
import { useProductOptions } from '../hooks/useProductOptions';
import {
  accountTotals,
  buildGenericInvoicePayload,
  documentTotals,
  makeAccount,
  makeMovement,
  movementTotals,
  validateGenericInvoiceForm,
  type AccountDraft,
  type MovementDraft,
} from '../utils/genericInvoice';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function firstDayOfMonth(): string {
  return `${today().slice(0, 8)}01`;
}

function formatMoney(value: number, currency: string): string {
  return `${value.toLocaleString('pt-AO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

/**
 * Emissão de Factura Genérica (GF) — exclusiva de instituições financeiras.
 * Os movimentos são agrupados por conta bancária do cliente; o documento tem
 * uma única moeda. A rota está protegida por `RequireFinancialInstitution` e o
 * fiscal_core recusa (403) qualquer outra empresa.
 */
export function GenericInvoiceCreatePage() {
  const title = CREATE_PAGE_TITLES.GF ?? 'Nova Factura genérica';
  useDocumentTitle(title);

  const { createGenericInvoice, isLoading, error, fieldErrors, createdInvoice, reset } =
    useCreateGenericInvoice();
  const { customers, isLoading: customersLoading, error: customersError } = useCustomerOptions();
  const { products } = useProductOptions();

  const [customerCode, setCustomerCode] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerTaxId, setCustomerTaxId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(today());
  const [currencyCode, setCurrencyCode] = useState('AOA');
  const [billingPeriodStart, setBillingPeriodStart] = useState(firstDayOfMonth());
  const [billingPeriodEnd, setBillingPeriodEnd] = useState(today());
  const [accounts, setAccounts] = useState<AccountDraft[]>([makeAccount(today())]);
  const [localError, setLocalError] = useState<string | null>(null);

  const updateAccount = (accountId: string, patch: Partial<AccountDraft>) =>
    setAccounts((current) =>
      current.map((account) => (account.id === accountId ? { ...account, ...patch } : account)),
    );

  const updateMovement = (accountId: string, movementId: string, patch: Partial<MovementDraft>) =>
    setAccounts((current) =>
      current.map((account) =>
        account.id === accountId
          ? {
              ...account,
              movements: account.movements.map((movement) =>
                movement.id === movementId ? { ...movement, ...patch } : movement,
              ),
            }
          : account,
      ),
    );

  const addMovement = (accountId: string) =>
    setAccounts((current) =>
      current.map((account) =>
        account.id === accountId
          ? { ...account, movements: [...account.movements, makeMovement(billingPeriodEnd)] }
          : account,
      ),
    );

  const removeMovement = (accountId: string, movementId: string) =>
    setAccounts((current) =>
      current.map((account) =>
        account.id === accountId
          ? { ...account, movements: account.movements.filter((m) => m.id !== movementId) }
          : account,
      ),
    );

  const onSelectCustomer = (code: string) => {
    setCustomerCode(code);
    const customer = customers.find((item) => item.customer_code === code);
    setCustomerName(customer?.company_name ?? '');
    setCustomerTaxId(customer?.customer_tax_id ?? '');
  };

  /** Ao escolher um código de serviço registado, preenche a descrição e o preço. */
  const onProductCodeChange = (accountId: string, movementId: string, code: string) => {
    const product = products.find((item) => item.product_code === code);
    updateMovement(accountId, movementId, {
      product_code: code,
      ...(product
        ? {
            product_description: product.product_description,
            unit_price: product.unit_price != null ? String(product.unit_price) : '0',
          }
        : {}),
    });
  };

  const form = {
    customerCode,
    customerName,
    customerTaxId,
    invoiceDate,
    currencyCode,
    billingPeriodStart,
    billingPeriodEnd,
    accounts,
  };

  const totals = documentTotals(accounts);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateGenericInvoiceForm(form);
    setLocalError(validationError);
    if (validationError) return;

    await createGenericInvoice(buildGenericInvoicePayload(form));
  };

  const resetForm = () => {
    reset();
    setCustomerCode('');
    setCustomerName('');
    setCustomerTaxId('');
    setInvoiceDate(today());
    setCurrencyCode('AOA');
    setBillingPeriodStart(firstDayOfMonth());
    setBillingPeriodEnd(today());
    setAccounts([makeAccount(today())]);
    setLocalError(null);
  };

  if (createdInvoice) {
    return (
      <div className="p-6 lg:p-10">
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck2 className="size-5 text-primary" aria-hidden="true" />
              Factura Genérica emitida com sucesso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Documento {createdInvoice.invoice_no ?? ''} —{' '}
              {formatMoney(createdInvoice.gross_total ?? 0, createdInvoice.currency_code ?? currencyCode)}.
            </p>
            <div className="flex flex-wrap gap-2">
              {createdInvoice.pdf_url ? (
                <Button asChild>
                  <a href={createdInvoice.pdf_url} target="_blank" rel="noopener noreferrer">
                    Descarregar PDF
                  </a>
                </Button>
              ) : null}
              <Button variant="outline" onClick={resetForm}>
                Emitir outra Factura Genérica
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/invoices">Ver documentos</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const alertMessage = localError ?? error ?? customersError;

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
          <Link to="/invoices">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Voltar aos documentos
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Documento exclusivo de instituições financeiras. Os movimentos são agrupados por conta do
          cliente e o documento tem uma única moeda.
        </p>
      </div>

      {alertMessage ? <FormAlert variant="error" message={alertMessage} /> : null}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados do documento</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5 lg:col-span-2">
              <Label htmlFor="customer_code">Cliente *</Label>
              <Select value={customerCode} onValueChange={onSelectCustomer}>
                <SelectTrigger
                  className="bg-muted border-none"
                  id="customer_code"
                  aria-invalid={Boolean(fieldErrors.customerCode)}
                >
                  <SelectValue
                    placeholder={customersLoading ? 'A carregar clientes…' : 'Selecione o cliente'}
                  />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.customer_code}>
                      {customer.company_name} ({customer.customer_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.customerCode ? <FieldError message={fieldErrors.customerCode} /> : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="currency_code">Moeda do documento *</Label>
              <Select value={currencyCode} onValueChange={setCurrencyCode}>
                <SelectTrigger className="bg-muted border-none" id="currency_code">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GF_CURRENCY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.currencyCode ? <FieldError message={fieldErrors.currencyCode} /> : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invoice_date">Data do documento *</Label>
              <Input
                className="bg-muted border-none"
                id="invoice_date"
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
              {fieldErrors.invoiceDate ? <FieldError message={fieldErrors.invoiceDate} /> : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="billing_period_start">Período de facturação — início *</Label>
              <Input
                className="bg-muted border-none"
                id="billing_period_start"
                type="date"
                value={billingPeriodStart}
                onChange={(e) => setBillingPeriodStart(e.target.value)}
              />
              {fieldErrors.billingPeriodStart ? (
                <FieldError message={fieldErrors.billingPeriodStart} />
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="billing_period_end">Período de facturação — fim *</Label>
              <Input
                className="bg-muted border-none"
                id="billing_period_end"
                type="date"
                value={billingPeriodEnd}
                onChange={(e) => setBillingPeriodEnd(e.target.value)}
              />
              {fieldErrors.billingPeriodEnd ? (
                <FieldError message={fieldErrors.billingPeriodEnd} />
              ) : null}
            </div>
          </CardContent>
        </Card>

        <datalist id="gf-service-codes">
          {products.map((product) => (
            <option key={product.id} value={product.product_code}>
              {product.product_description}
            </option>
          ))}
        </datalist>

        {accounts.map((account, accountIndex) => {
          const subtotal = accountTotals(account);
          const errorKey = `accounts.${accountIndex}`;

          return (
            <Card key={account.id}>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle className="text-base">Conta {accountIndex + 1}</CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setAccounts((current) => current.filter((a) => a.id !== account.id))}
                  disabled={accounts.length === 1}
                  aria-label={`Remover conta ${accountIndex + 1}`}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Remover conta
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-4">
                  <div className="space-y-1.5">
                    <Label htmlFor={`account-${account.id}-number`}>N.º da conta *</Label>
                    <Input
                      className="bg-muted border-none"
                      id={`account-${account.id}-number`}
                      value={account.account_number}
                      maxLength={30}
                      onChange={(e) => updateAccount(account.id, { account_number: e.target.value })}
                    />
                    {fieldErrors[`${errorKey}.account_number`] ? (
                      <FieldError message={fieldErrors[`${errorKey}.account_number`]} />
                    ) : null}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`account-${account.id}-location-code`}>Código da agência</Label>
                    <Input
                      className="bg-muted border-none"
                      id={`account-${account.id}-location-code`}
                      value={account.service_location_code}
                      maxLength={10}
                      placeholder="0537"
                      onChange={(e) =>
                        updateAccount(account.id, { service_location_code: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor={`account-${account.id}-location-name`}>
                      Local da prestação de serviços *
                    </Label>
                    <Input
                      className="bg-muted border-none"
                      id={`account-${account.id}-location-name`}
                      value={account.service_location_name}
                      maxLength={100}
                      placeholder="537 - DEPENDENCIA AVENCA"
                      onChange={(e) =>
                        updateAccount(account.id, { service_location_name: e.target.value })
                      }
                    />
                    {fieldErrors[`${errorKey}.service_location_name`] ? (
                      <FieldError message={fieldErrors[`${errorKey}.service_location_name`]} />
                    ) : null}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Moeda da conta: {currencyCode}</p>
                {fieldErrors[`${errorKey}.currency_code`] ? (
                  <FieldError message={fieldErrors[`${errorKey}.currency_code`]} />
                ) : null}

                {account.movements.map((movement, movementIndex) => {
                  const line = movementTotals(movement);
                  const isExempt = Number(movement.tax_percentage) === 0;
                  const lineKey = `${errorKey}.lines.${movementIndex}`;

                  return (
                    <div key={movement.id} className="grid gap-3 rounded-md border p-4 sm:grid-cols-12">
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label htmlFor={`mov-${movement.id}-date`}>Data mov. *</Label>
                        <Input
                          className="bg-muted border-none"
                          id={`mov-${movement.id}-date`}
                          type="date"
                          value={movement.movement_date}
                          onChange={(e) =>
                            updateMovement(account.id, movement.id, { movement_date: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label htmlFor={`mov-${movement.id}-time`}>Hora *</Label>
                        <Input
                          className="bg-muted border-none"
                          id={`mov-${movement.id}-time`}
                          type="time"
                          step="1"
                          value={movement.movement_time}
                          onChange={(e) =>
                            updateMovement(account.id, movement.id, { movement_time: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label htmlFor={`mov-${movement.id}-code`}>Código *</Label>
                        <Input
                          className="bg-muted border-none"
                          id={`mov-${movement.id}-code`}
                          list="gf-service-codes"
                          maxLength={30}
                          value={movement.product_code}
                          onChange={(e) => onProductCodeChange(account.id, movement.id, e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5 sm:col-span-3">
                        <Label htmlFor={`mov-${movement.id}-desc`}>Descrição *</Label>
                        <Input
                          className="bg-muted border-none"
                          id={`mov-${movement.id}-desc`}
                          maxLength={200}
                          placeholder="Comissão_gest_MN_Emp Ago"
                          value={movement.product_description}
                          onChange={(e) =>
                            updateMovement(account.id, movement.id, {
                              product_description: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-1.5 sm:col-span-3">
                        <Label htmlFor={`mov-${movement.id}-ref`}>Referência do movimento</Label>
                        <Input
                          className="bg-muted border-none"
                          id={`mov-${movement.id}-ref`}
                          maxLength={60}
                          value={movement.movement_reference}
                          onChange={(e) =>
                            updateMovement(account.id, movement.id, {
                              movement_reference: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label htmlFor={`mov-${movement.id}-price`}>Preço unit. *</Label>
                        <Input
                          className="bg-muted border-none"
                          id={`mov-${movement.id}-price`}
                          type="number"
                          min="0"
                          step="any"
                          value={movement.unit_price}
                          onChange={(e) =>
                            updateMovement(account.id, movement.id, { unit_price: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-1.5 sm:col-span-1">
                        <Label htmlFor={`mov-${movement.id}-qty`}>Qtd. *</Label>
                        <Input
                          className="bg-muted border-none"
                          id={`mov-${movement.id}-qty`}
                          type="number"
                          min="0"
                          step="any"
                          value={movement.quantity}
                          onChange={(e) =>
                            updateMovement(account.id, movement.id, { quantity: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-1.5 sm:col-span-1">
                        <Label htmlFor={`mov-${movement.id}-tax`}>IVA %</Label>
                        <Input
                          className="bg-muted border-none"
                          id={`mov-${movement.id}-tax`}
                          type="number"
                          min="0"
                          max="100"
                          step="any"
                          value={movement.tax_percentage}
                          onChange={(e) =>
                            updateMovement(account.id, movement.id, { tax_percentage: e.target.value })
                          }
                        />
                      </div>
                      {isExempt ? (
                        <div className="space-y-1.5 sm:col-span-4">
                          <Label htmlFor={`mov-${movement.id}-exemption`}>
                            Motivo da não aplicação de imposto *
                          </Label>
                          <Input
                            className="bg-muted border-none"
                            id={`mov-${movement.id}-exemption`}
                            maxLength={255}
                            value={movement.tax_exemption_reason}
                            onChange={(e) =>
                              updateMovement(account.id, movement.id, {
                                tax_exemption_reason: e.target.value,
                              })
                            }
                          />
                        </div>
                      ) : (
                        <div className="sm:col-span-4" />
                      )}
                      <div className="flex items-end justify-between gap-2 sm:col-span-4">
                        <span className="text-sm text-muted-foreground">
                          Total: {formatMoney(line.gross, currencyCode)}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMovement(account.id, movement.id)}
                          disabled={account.movements.length === 1}
                          aria-label={`Remover movimento ${movementIndex + 1} da conta ${accountIndex + 1}`}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </Button>
                      </div>
                      {fieldErrors[`${lineKey}.movement_at`] ? (
                        <div className="sm:col-span-12">
                          <FieldError message={fieldErrors[`${lineKey}.movement_at`]} />
                        </div>
                      ) : null}
                    </div>
                  );
                })}

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => addMovement(account.id)}>
                    <Plus className="size-4" aria-hidden="true" />
                    Adicionar movimento
                  </Button>
                  <p className="text-sm font-medium" data-testid={`account-${accountIndex}-total`}>
                    Total por conta: {formatMoney(subtotal.net, currencyCode)} +{' '}
                    {formatMoney(subtotal.tax, currencyCode)} IVA = {formatMoney(subtotal.gross, currencyCode)}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}

        <Button
          type="button"
          variant="outline"
          onClick={() => setAccounts((current) => [...current, makeAccount(billingPeriodEnd)])}
        >
          <Plus className="size-4" aria-hidden="true" />
          Adicionar conta
        </Button>

        <Card>
          <CardContent className="flex flex-col gap-1 pt-6 text-sm sm:items-end">
            <span>Total líquido: {formatMoney(totals.net, currencyCode)}</span>
            <span>IVA: {formatMoney(totals.tax, currencyCode)}</span>
            <span className="text-base font-semibold" data-testid="document-total">
              Total do documento: {formatMoney(totals.gross, currencyCode)}
            </span>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            Emitir Factura Genérica
          </Button>
        </div>
      </form>
    </div>
  );
}
