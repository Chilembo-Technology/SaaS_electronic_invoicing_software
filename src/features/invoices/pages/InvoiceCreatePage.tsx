import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, FileCheck2, Loader2, PackagePlus, Plus, Trash2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '../../../app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../app/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../app/components/ui/dialog';
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
import { FormField } from '../../../components/forms/FormField';
import { useAuth } from '../../../contexts/AuthContext';
import { normalizeApiError } from '../../../features/auth/utils/apiError';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { customerService } from '../../customers/services/customerService';
import { PRODUCT_TYPE_OPTIONS } from '../../products/constants';
import { useProductCategories } from '../../products/hooks/useProductCategories';
import { productService } from '../../products/services/productService';
import { getCompanyId } from '../../settings/utils/session';
import { useCustomerOptions } from '../hooks/useCustomerOptions';
import { useCreateInvoice } from '../hooks/useCreateInvoice';
import { useProductOptions } from '../hooks/useProductOptions';
import {
  CREATE_INVOICE_TYPE_OPTIONS,
  CREATE_PAGE_TITLES,
  NC_OPERATION_TYPES,
  PAYMENT_MECHANISM_OPTIONS,
  invoiceTypeLabel,
} from '../constants';
import type {
  CreateInvoicePayload,
  CreditNoteOperationType,
  InvoiceType,
  PaymentDraft,
  TaxType,
} from '../types';
import type { Product, ProductType } from '../../products/types';

interface LineDraft {
  id: string;
  product_code: string;
  product_description: string;
  quantity: string;
  unit_price: string;
  tax_percentage: string;
  tax_type: string;
  tax_code: string;
  credit_amount: string;
}

function makeLine(): LineDraft {
  return {
    id: crypto.randomUUID(),
    product_code: '',
    product_description: '',
    quantity: '1',
    unit_price: '0',
    tax_percentage: '',
    tax_type: '',
    tax_code: '',
    credit_amount: '0',
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

/** Campos de linha preenchidos a partir de um produto (imposto por omissão: IVA 14%). */
function productLinePatch(product: Product): Partial<LineDraft> {
  return {
    product_code: product.product_code,
    product_description: product.product_description,
    unit_price: product.unit_price != null ? String(product.unit_price) : '',
    tax_type: 'IVA',
    tax_code: 'NOR',
    tax_percentage: '14',
  };
}

/** Campo numérico com rótulo, asterisco de obrigatório e erro inline. */
interface NumberFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

function NumberField({
  id,
  label,
  value,
  onChange,
  error,
  required = false,
}: NumberFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {required ? (
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        ) : null}
      </Label>
      <Input
        className="bg-muted border-none"
        id={id}
        type="number"
        min="0"
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
      />
      {error ? <FieldError message={error} /> : null}
    </div>
  );
}

/** Resolve o tipo pedido na rota; tipos inválidos caem para a factura (FT). */
function resolveType(raw: string | undefined): InvoiceType {
  const normalized = (raw ?? 'FT').toUpperCase();
  const known = CREATE_INVOICE_TYPE_OPTIONS.some(
    (option) => option.value === normalized,
  );
  return (known ? normalized : 'FT') as InvoiceType;
}
export function InvoiceCreatePage() {
  const params = useParams<{ type?: string }>();
  const type = resolveType(params.type);
  const title = CREATE_PAGE_TITLES[type] ?? 'Novo documento';

  useDocumentTitle(title);

  const {
    createInvoice,
    isLoading,
    error,
    fieldErrors,
    createdInvoice,
    reset,
  } = useCreateInvoice();

  const {
    customers,
    isLoading: customersLoading,
    error: customersError,
    reload: reloadCustomers,
  } = useCustomerOptions();

  const {
    products,
    isLoading: productsLoading,
    error: productsError,
    reload: reloadProducts,
  } = useProductOptions();

  const { categories } = useProductCategories();

  const { user } = useAuth();
  const companyId = getCompanyId(user);

  const isReceipt = type === 'RG';
  const isInvoiceReceipt = type === 'FR';
  const isCreditNote = type === 'NC';
  const isTransportGuide = type === 'GT';
  const isDeliveryNote = type === 'GR';
  const usesLineAmount = isTransportGuide || isDeliveryNote;
  const hasLines = !isReceipt;

  const [customerCode, setCustomerCode] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerTaxId, setCustomerTaxId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(today());
  const [lines, setLines] = useState<LineDraft[]>([makeLine()]);
  const [localError, setLocalError] = useState<string | null>(null);

  // Nota de crédito (NC)
  const [operationType, setOperationType] = useState<CreditNoteOperationType | ''>('');
  const [rectificationReason, setRectificationReason] = useState('');
  const [sourceDocument, setSourceDocument] = useState('');

  // Recibo (RG)
  const [invoiceReference, setInvoiceReference] = useState('');
  const [taxTotal, setTaxTotal] = useState('');
  const [invoiceTotal, setInvoiceTotal] = useState('');
  const [retentionAmount, setRetentionAmount] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [amountDue, setAmountDue] = useState('');
  const [paymentMechanism, setPaymentMechanism] = useState('');

  // Factura-recibo (FR) — pagamento obrigatório
  const [payments, setPayments] = useState<PaymentDraft[]>([
    { payment_mechanism: '', payment_amount: 0, payment_date: today() },
  ]);

  // Guia de transporte (GT)
  const [originCity, setOriginCity] = useState('');
  const [originAddress, setOriginAddress] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');

  // Criação rápida de cliente
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    company_name: '',
    customer_tax_id: '',
    billing_city: '',
    billing_address_detail: '',
  });
  const [customerSaving, setCustomerSaving] = useState(false);
  const [customerFormError, setCustomerFormError] = useState<string | null>(null);

  // Criação rápida de produto
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [productForm, setProductForm] = useState({
    product_type: '',
    product_description: '',
    unit_price: '',
    category_id: '',
  });
  const [productSaving, setProductSaving] = useState(false);
  const [productFormError, setProductFormError] = useState<string | null>(null);

  const addLine = () => setLines((current) => [...current, makeLine()]);
  const removeLine = (id: string) =>
    setLines((current) => current.filter((line) => line.id !== id));
  const updateLine = (id: string, patch: Partial<LineDraft>) =>
    setLines((current) =>
      current.map((line) => (line.id === id ? { ...line, ...patch } : line)),
    );
  const updatePayment = (index: number, patch: Partial<PaymentDraft>) =>
    setPayments((current) =>
      current.map((payment, i) => (i === index ? { ...payment, ...patch } : payment)),
    );

  const onSelectCustomer = (code: string) => {
    setCustomerCode(code);
    const customer = customers.find((item) => item.customer_code === code);
    setCustomerName(customer?.company_name ?? '');
    setCustomerTaxId(customer?.customer_tax_id ?? '');
  };

  const onSelectProduct = (lineId: string, code: string) => {
    const product = products.find((item) => item.product_code === code);
    if (!product) return;
    updateLine(lineId, productLinePatch(product));
  };

  const applyNewProductToLine = (product: Product) => {
    const patch = productLinePatch(product);
    setLines((current) => {
      const emptyIndex = current.findIndex((line) => !line.product_code.trim());
      if (emptyIndex >= 0) {
        return current.map((line, index) =>
          index === emptyIndex ? { ...line, ...patch } : line,
        );
      }
      return [...current, { ...makeLine(), ...patch }];
    });
  };

  const openCustomerDialog = () => {
    setCustomerForm({
      company_name: '',
      customer_tax_id: '',
      billing_city: '',
      billing_address_detail: '',
    });
    setCustomerFormError(null);
    setCustomerDialogOpen(true);
  };

  const handleCreateCustomer = async () => {
    if (!companyId) {
      setCustomerFormError('Não foi possível identificar a empresa da sessão.');
      return;
    }
    if (
      !customerForm.company_name.trim() ||
      !customerForm.customer_tax_id.trim() ||
      !customerForm.billing_city.trim() ||
      !customerForm.billing_address_detail.trim()
    ) {
      setCustomerFormError('Preencha o nome, NIF, cidade e endereço.');
      return;
    }

    setCustomerSaving(true);
    setCustomerFormError(null);

    try {
      const created = await customerService.createCustomer(companyId, {
        company_name: customerForm.company_name.trim(),
        customer_tax_id: customerForm.customer_tax_id.trim(),
        type: 'empresa',
        billing_city: customerForm.billing_city.trim(),
        billing_address_detail: customerForm.billing_address_detail.trim(),
      });
      setCustomerCode(created.customer_code);
      setCustomerName(created.company_name);
      setCustomerTaxId(created.customer_tax_id);
      await reloadCustomers();
      setCustomerDialogOpen(false);
      toast.success('Cliente criado com sucesso.');
    } catch (err) {
      setCustomerFormError(normalizeApiError(err).message);
    } finally {
      setCustomerSaving(false);
    }
  };

  const openProductDialog = () => {
    setProductForm({
      product_type: '',
      product_description: '',
      unit_price: '',
      category_id: '',
    });
    setProductFormError(null);
    setProductDialogOpen(true);
  };

  const handleCreateProduct = async () => {
    if (!companyId) {
      setProductFormError('Não foi possível identificar a empresa da sessão.');
      return;
    }
    if (!productForm.product_type || !productForm.product_description.trim()) {
      setProductFormError('Preencha o tipo e a descrição do produto.');
      return;
    }

    const price = productForm.unit_price.trim();
    if (price !== '' && !Number.isFinite(Number(price))) {
      setProductFormError('O preço deve ser um número válido.');
      return;
    }

    setProductSaving(true);
    setProductFormError(null);

    try {
      const created = await productService.createProduct(companyId, {
        product_type: productForm.product_type as ProductType,
        product_group: null,
        product_description: productForm.product_description.trim(),
        product_number_code: null,
        un_number: null,
        category_id: productForm.category_id || null,
        is_stockable: true,
        is_inventory_only: false,
        is_on_promotion: false,
        unit_of_measure: 'UN',
        unit_price: price === '' ? null : Number(price),
        expiration_date: null,
        is_active: true,
      });
      await reloadProducts();
      applyNewProductToLine(created);
      setProductDialogOpen(false);
      toast.success('Produto criado com sucesso.');
    } catch (err) {
      setProductFormError(normalizeApiError(err).message);
    } finally {
      setProductSaving(false);
    }
  };

  const resetForm = () => {
    reset();
    setCustomerCode('');
    setCustomerName('');
    setCustomerTaxId('');
    setInvoiceDate(today());
    setLines([makeLine()]);
    setLocalError(null);
    setOperationType('');
    setRectificationReason('');
    setSourceDocument('');
    setInvoiceReference('');
    setTaxTotal('');
    setInvoiceTotal('');
    setRetentionAmount('');
    setAmountPaid('');
    setAmountDue('');
    setPaymentMechanism('');
    setPayments([{ payment_mechanism: '', payment_amount: 0, payment_date: today() }]);
    setOriginCity('');
    setOriginAddress('');
    setDestinationCity('');
    setDestinationAddress('');
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
  const linesTotal = lines.reduce(
    (sum, line) => sum + toNumber(line.credit_amount),
    0,
  );

  // Pré-preenche o valor do pagamento (FR) com o total calculado do documento.
  useEffect(() => {
    if (type === 'FR') {
      setPayments((current) =>
        current.map((payment, index) =>
          index === 0 && payment.payment_amount === 0
            ? { ...payment, payment_amount: total }
            : payment,
        ),
      );
    }
  }, [type, total]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    if (!customerCode.trim()) {
      setLocalError('Selecione o cliente.');
      return;
    }

    const payload: CreateInvoicePayload = {
      customer_code: customerCode.trim(),
      customer_name: customerName.trim() || undefined,
      customer_tax_id: customerTaxId.trim() || undefined,
      invoice_date: invoiceDate,
    };

    if (isReceipt) {
      if (!invoiceReference.trim()) {
        setLocalError('A referência da factura é obrigatória.');
        return;
      }
      if (taxTotal.trim() === '' || toNumber(taxTotal) < 0) {
        setLocalError('O total de imposto é obrigatório.');
        return;
      }
      if (invoiceTotal.trim() === '' || toNumber(invoiceTotal) < 0) {
        setLocalError('O total da factura é obrigatório.');
        return;
      }
      if (amountPaid.trim() === '' || toNumber(amountPaid) < 0) {
        setLocalError('O valor pago é obrigatório.');
        return;
      }
      if (amountDue.trim() === '' || toNumber(amountDue) < 0) {
        setLocalError('O valor em dívida é obrigatório.');
        return;
      }

      payload.invoice_reference = invoiceReference.trim();
      payload.tax_total = toNumber(taxTotal);
      payload.invoice_total = toNumber(invoiceTotal);
      payload.retention_amount =
        retentionAmount.trim() === '' ? undefined : toNumber(retentionAmount);
      payload.amount_paid = toNumber(amountPaid);
      payload.amount_due = toNumber(amountDue);
      payload.payment_mechanism = paymentMechanism.trim() || undefined;
    } else {
      const invalidLine = lines.find(
        (line) =>
          !line.product_code.trim() ||
          !line.product_description.trim() ||
          toNumber(line.quantity) <= 0 ||
          (usesLineAmount
            ? toNumber(line.credit_amount) < 0
            : toNumber(line.unit_price) < 0),
      );
      if (invalidLine) {
        setLocalError(
          'Todas as linhas precisam de código, descrição e quantidade superior a zero.',
        );
        return;
      }

      payload.lines = lines.map((line) =>
        usesLineAmount
          ? {
            product_code: line.product_code.trim(),
            product_description: line.product_description.trim(),
            quantity: toNumber(line.quantity),
            credit_amount: toNumber(line.credit_amount),
          }
          : {
            product_code: line.product_code.trim(),
            product_description: line.product_description.trim(),
            quantity: toNumber(line.quantity),
            unit_price: toNumber(line.unit_price),
            tax_type:
              line.tax_type === '' ? undefined : (line.tax_type as TaxType),
            tax_code: line.tax_code === '' ? undefined : line.tax_code,
            tax_percentage:
              line.tax_percentage === ''
                ? undefined
                : toNumber(line.tax_percentage),
          },
      );

      if (isCreditNote) {
        if (!operationType) {
          setLocalError('O tipo de operação é obrigatório.');
          return;
        }
        if (!rectificationReason.trim()) {
          setLocalError('O motivo da rectificação é obrigatório.');
          return;
        }
        if (!sourceDocument.trim()) {
          setLocalError('O documento de origem é obrigatório.');
          return;
        }
        payload.operation_type = operationType;
        payload.rectification_reason = rectificationReason.trim();
        payload.source_document = sourceDocument.trim();
      }

      if (isTransportGuide) {
        if (
          !originCity.trim() ||
          !originAddress.trim() ||
          !destinationCity.trim() ||
          !destinationAddress.trim()
        ) {
          setLocalError('Preencha os dados de origem e de destino.');
          return;
        }
        payload.origin_city = originCity.trim();
        payload.origin_address = originAddress.trim();
        payload.destination_city = destinationCity.trim();
        payload.destination_address = destinationAddress.trim();
      }
    }

    if (isInvoiceReceipt) {
      const payment = payments[0];
      if (!payment || !payment.payment_mechanism.trim()) {
        setLocalError('Selecione o mecanismo de pagamento.');
        return;
      }
      if (!payment.payment_date) {
        setLocalError('Indique a data do pagamento.');
        return;
      }
      if (!(payment.payment_amount > 0)) {
        setLocalError('O valor do pagamento tem de ser superior a zero.');
        return;
      }
      payload.payments = [
        {
          payment_mechanism: payment.payment_mechanism,
          payment_amount: payment.payment_amount,
          payment_date: payment.payment_date,
        },
      ];
    }

    await createInvoice(payload, type);
  };
  if (createdInvoice) {
    return (
      <div className="p-6 lg:p-10">
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck2 className="size-5 text-primary" aria-hidden="true" />
              Documento emitido com sucesso
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
                Emitir outro documento
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
          Preencha os dados do documento{hasLines ? ' e as linhas de produto' : ''}.
        </p>
      </div>

      {error || localError || customersError || productsError ? (
        <FormAlert
          variant="error"
          message={localError ?? error ?? customersError ?? productsError ?? ''}
        />
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados do documento</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="customer_code">
                Cliente
                <span className="text-destructive" aria-hidden="true">
                  *
                </span>
              </Label>
              <div className="flex gap-2">
                <div className="flex-1 min-w-0">
                  <Select value={customerCode} onValueChange={onSelectCustomer}>
                    <SelectTrigger
                      className="bg-muted border-none"
                      id="customer_code"
                      aria-invalid={Boolean(fieldErrors.customerCode)}
                    >
                      <SelectValue
                        placeholder={
                          customersLoading
                            ? 'A carregar clientes…'
                            : 'Selecione o cliente'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem
                          key={customer.id}
                          value={customer.customer_code}
                        >
                          {customer.company_name} ({customer.customer_code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={openCustomerDialog}
                  aria-label="Criar novo cliente"
                  title="Criar novo cliente"
                >
                  <UserPlus className="size-4" aria-hidden="true" />
                </Button>
              </div>
              {fieldErrors.customerCode ? (
                <FieldError message={fieldErrors.customerCode} />
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invoice_date">
                Data do documento
                <span className="text-destructive" aria-hidden="true">
                  *
                </span>
              </Label>
              <Input
                className="bg-muted border-none"
                id="invoice_date"
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
              {fieldErrors.invoiceDate ? (
                <FieldError message={fieldErrors.invoiceDate} />
              ) : null}
            </div>
          </CardContent>
        </Card>

        {isInvoiceReceipt ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pagamentos</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="payment_mechanism">Mecanismo</Label>
                <Select
                  value={payments[0]?.payment_mechanism ?? ''}
                  onValueChange={(value) =>
                    updatePayment(0, { payment_mechanism: value })
                  }
                >
                  <SelectTrigger id="payment_mechanism" className="bg-muted border-none">
                    <SelectValue placeholder="Selecione o mecanismo" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_MECHANISM_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="payment_date">Data do pagamento</Label>
                <Input
                  id="payment_date"
                  type="date"
                  className="bg-muted border-none"
                  value={payments[0]?.payment_date ?? today()}
                  onChange={(e) =>
                    updatePayment(0, { payment_date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="payment_amount">Valor pago</Label>
                <Input
                  className="bg-muted border-none"
                  id="payment_amount"
                  type="number"
                  min="0"
                  step="any"
                  value={payments[0]?.payment_amount ?? 0}
                  onChange={(e) =>
                    updatePayment(0, { payment_amount: toNumber(e.target.value) })
                  }
                />
              </div>
            </CardContent>
          </Card>
        ) : null}

        {isReceipt ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dados do recibo</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField
                id="invoice_reference"
                label="Referência da factura"
                required
                value={invoiceReference}
                onChange={setInvoiceReference}
                placeholder="FT 2026/123"
                error={fieldErrors.invoiceReference}
              />
              <FormField
                id="payment_mechanism"
                label="Mecanismo de pagamento (opcional)"
                value={paymentMechanism}
                onChange={setPaymentMechanism}
                placeholder="Numerário"
                maxLength={10}
                error={fieldErrors.paymentMechanism}
              />
              <NumberField
                id="tax_total"
                label="Total de imposto"
                required
                value={taxTotal}
                onChange={setTaxTotal}
                error={fieldErrors.taxTotal}
              />
              <NumberField
                id="invoice_total"
                label="Total da factura"
                required
                value={invoiceTotal}
                onChange={setInvoiceTotal}
                error={fieldErrors.invoiceTotal}
              />
              <NumberField
                id="retention_amount"
                label="Retenção na fonte (opcional)"
                value={retentionAmount}
                onChange={setRetentionAmount}
                error={fieldErrors.retentionAmount}
              />
              <NumberField
                id="amount_paid"
                label="Valor pago"
                required
                value={amountPaid}
                onChange={setAmountPaid}
                error={fieldErrors.amountPaid}
              />
              <NumberField
                id="amount_due"
                label="Valor em dívida"
                required
                value={amountDue}
                onChange={setAmountDue}
                error={fieldErrors.amountDue}
              />
            </CardContent>
          </Card>
        ) : null}

        {isCreditNote ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dados da nota de crédito</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="operation_type">
                  Tipo de operação
                  <span className="text-destructive" aria-hidden="true">
                    *
                  </span>
                </Label>
                <Select
                  value={operationType}
                  onValueChange={(value) =>
                    setOperationType(value as CreditNoteOperationType)
                  }
                >
                  <SelectTrigger
                    className="bg-muted border-none"
                    id="operation_type"
                    aria-invalid={Boolean(fieldErrors.operationType)}
                  >
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {NC_OPERATION_TYPES.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.operationType ? (
                  <FieldError message={fieldErrors.operationType} />
                ) : null}
              </div>
              <FormField
                id="source_document"
                label="Documento de origem"
                required
                value={sourceDocument}
                onChange={setSourceDocument}
                placeholder="FT 2026/100"
                error={fieldErrors.sourceDocument}
              />
              <FormField
                id="rectification_reason"
                label="Motivo da rectificação"
                required
                value={rectificationReason}
                onChange={setRectificationReason}
                placeholder="Correcção do valor facturado"
                error={fieldErrors.rectificationReason}
              />
            </CardContent>
          </Card>
        ) : null}

        {isTransportGuide ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Origem e destino</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField
                id="origin_address"
                label="Morada de origem"
                required
                value={originAddress}
                onChange={setOriginAddress}
                placeholder="Rua, nº"
                error={fieldErrors.originAddress}
              />
              <FormField
                id="origin_city"
                label="Cidade de origem"
                required
                value={originCity}
                onChange={setOriginCity}
                placeholder="Luanda"
                error={fieldErrors.originCity}
              />
              <FormField
                id="destination_address"
                label="Morada de destino"
                required
                value={destinationAddress}
                onChange={setDestinationAddress}
                placeholder="Rua, nº"
                error={fieldErrors.destinationAddress}
              />
              <FormField
                id="destination_city"
                label="Cidade de destino"
                required
                value={destinationCity}
                onChange={setDestinationCity}
                placeholder="Benguela"
                error={fieldErrors.destinationCity}
              />
            </CardContent>
          </Card>
        ) : null}

        {hasLines ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-base">Linhas de produto</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={openProductDialog}
                >
                  <PackagePlus className="size-4" aria-hidden="true" />
                  Criar Novo Produto
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={addLine}>
                  <Plus className="size-4" aria-hidden="true" />
                  Adicionar linha
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {lines.map((line, index) => (
                <div
                  key={line.id}
                  className="grid gap-3 rounded-md border p-4 sm:grid-cols-12"
                >
                  <div className="space-y-1.5 sm:col-span-6">
                    <Label htmlFor={`line-${line.id}-product`}>Produto</Label>
                    <Select
                      value={line.product_code}
                      onValueChange={(code) => onSelectProduct(line.id, code)}
                    >
                      <SelectTrigger className="bg-muted border-none" id={`line-${line.id}-product`}>
                        <SelectValue
                          placeholder={
                            productsLoading
                              ? 'A carregar produtos…'
                              : 'Selecione o produto'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem
                            key={product.id}
                            value={product.product_code}
                          >
                            {product.product_description} ({product.product_code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 sm:col-span-1">
                    <Label htmlFor={`line-${line.id}-qty`}>Qtd.</Label>
                    <Input
                      className="bg-muted border-none"
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
                  {usesLineAmount ? (
                    <div className="space-y-1.5 sm:col-span-3">
                      <Label htmlFor={`line-${line.id}-amount`}>
                        Total da linha
                      </Label>
                      <Input
                        className="bg-muted border-none"
                        id={`line-${line.id}-amount`}
                        type="number"
                        min="0"
                        step="any"
                        value={line.credit_amount}
                        onChange={(e) =>
                          updateLine(line.id, { credit_amount: e.target.value })
                        }
                      />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-1.5 sm:col-span-1">
                        <Label htmlFor={`line-${line.id}-price`}>Preço</Label>
                        <Input
                          className="bg-muted border-none"
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
                          className="bg-muted border-none"
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
                    </>
                  )}
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
        ) : null}

        {hasLines ? (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex flex-col gap-1 text-sm sm:items-end">
                {usesLineAmount ? (
                  <div className="flex justify-between gap-4 font-semibold text-foreground">
                    <span>Total</span>
                    <span>{formatMoney(linesTotal)}</span>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <Button type="submit" disabled={isLoading || customersLoading}>
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : null}
                  {isLoading ? 'A emitir…' : `Emitir ${invoiceTypeLabel(type)}`}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6 flex flex-wrap justify-end gap-2">
              <Button type="submit" disabled={isLoading || customersLoading}>
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : null}
                {isLoading ? 'A emitir…' : `Emitir ${invoiceTypeLabel(type)}`}
              </Button>
            </CardContent>
          </Card>
        )}
      </form>

      <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo cliente</DialogTitle>
            <DialogDescription>
              Preencha os dados essenciais. O código é gerado automaticamente.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="quick-customer-name">Nome</Label>
              <Input
                id="quick-customer-name"
                className="bg-muted border-none"
                value={customerForm.company_name}
                onChange={(e) =>
                  setCustomerForm((current) => ({
                    ...current,
                    company_name: e.target.value,
                  }))
                }
                placeholder="Nome do cliente"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="quick-customer-tax">NIF</Label>
              <Input
                id="quick-customer-tax"
                className="bg-muted border-none"
                value={customerForm.customer_tax_id}
                onChange={(e) =>
                  setCustomerForm((current) => ({
                    ...current,
                    customer_tax_id: e.target.value,
                  }))
                }
                placeholder="Número de identificação fiscal"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="quick-customer-city">Cidade</Label>
                <Input
                  id="quick-customer-city"
                  className="bg-muted border-none"
                  value={customerForm.billing_city}
                  onChange={(e) =>
                    setCustomerForm((current) => ({
                      ...current,
                      billing_city: e.target.value,
                    }))
                  }
                  placeholder="Luanda"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="quick-customer-address">Endereço</Label>
                <Input
                  id="quick-customer-address"
                  className="bg-muted border-none"
                  value={customerForm.billing_address_detail}
                  onChange={(e) =>
                    setCustomerForm((current) => ({
                      ...current,
                      billing_address_detail: e.target.value,
                    }))
                  }
                  placeholder="Rua, nº"
                />
              </div>
            </div>
            {customerFormError ? (
              <FormAlert variant="error" message={customerFormError} />
            ) : null}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCustomerDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => void handleCreateCustomer()}
              disabled={customerSaving}
            >
              {customerSaving ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : null}
              {customerSaving ? 'A criar…' : 'Criar cliente'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo produto</DialogTitle>
            <DialogDescription>
              Preencha os dados essenciais. O código é gerado automaticamente.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="quick-product-type">Tipo</Label>
              <Select
                value={productForm.product_type}
                onValueChange={(value) =>
                  setProductForm((current) => ({
                    ...current,
                    product_type: value,
                  }))
                }
              >
                <SelectTrigger
                  id="quick-product-type"
                  className="bg-muted border-none"
                >
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="quick-product-desc">Descrição</Label>
              <Input
                id="quick-product-desc"
                className="bg-muted border-none"
                value={productForm.product_description}
                onChange={(e) =>
                  setProductForm((current) => ({
                    ...current,
                    product_description: e.target.value,
                  }))
                }
                placeholder="Descrição do produto"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="quick-product-price">Preço</Label>
                <Input
                  id="quick-product-price"
                  type="number"
                  min="0"
                  step="any"
                  className="bg-muted border-none"
                  value={productForm.unit_price}
                  onChange={(e) =>
                    setProductForm((current) => ({
                      ...current,
                      unit_price: e.target.value,
                    }))
                  }
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="quick-product-category">Categoria</Label>
                <Select
                  value={productForm.category_id}
                  onValueChange={(value) =>
                    setProductForm((current) => ({
                      ...current,
                      category_id: value,
                    }))
                  }
                >
                  <SelectTrigger
                    id="quick-product-category"
                    className="bg-muted border-none"
                  >
                    <SelectValue placeholder="Sem categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {productFormError ? (
              <FormAlert variant="error" message={productFormError} />
            ) : null}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setProductDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => void handleCreateProduct()}
              disabled={productSaving}
            >
              {productSaving ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : null}
              {productSaving ? 'A criar…' : 'Criar produto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
