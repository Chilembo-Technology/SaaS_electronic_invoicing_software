import { type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Loader2, Save } from 'lucide-react';

import { Button } from '../../../app/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
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
import { Textarea } from '../../../app/components/ui/textarea';
import { FieldError } from '../../../components/forms/FieldError';
import { FormAlert } from '../../../components/forms/FormAlert';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { CUSTOMER_TYPE_OPTIONS } from '../constants';
import { useCustomerForm } from '../hooks/useCustomerForm';
import type { CustomerType } from '../types';

/** Valor sentinela do Select para representar "sem valor" (tipo ainda não escolhido). */
const NO_TYPE = 'none';

export function CustomerFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    isEdit,
    values,
    setField,
    submit,
    isLoading,
    isLoadingRecord,
    error,
    fieldErrors,
    loadError,
  } = useCustomerForm(id);

  useDocumentTitle(isEdit ? 'Editar Cliente' : 'Novo Cliente');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const record = await submit();
    if (record) {
      navigate('/customers');
    }
  };

  if (isLoadingRecord) {
    return (
      <div className="p-6 lg:p-10">
        <Card>
          <CardContent className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            A carregar…
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-6 lg:p-10">
        <Card>
          <CardContent className="space-y-4 py-16 text-center">
            <FormAlert variant="error" message={loadError} />
            <Button asChild variant="outline">
              <Link to="/customers">
                <ArrowLeft className="size-4" aria-hidden="true" />
                Voltar à lista
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 lg:p-10">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" aria-label="Voltar">
            <Link to="/customers">
              <ArrowLeft className="size-4" aria-hidden="true" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {isEdit ? 'Editar Cliente' : 'Novo Cliente'}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isEdit
                ? 'Actualize os dados do cliente (SAF-T).'
                : 'Registe um novo cliente na tabela de clientes (SAF-T).'}
            </p>
          </div>
        </div>

        {error ? <FormAlert variant="error" message={error} /> : null}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados do cliente</CardTitle>
            <CardDescription>Os campos com * são obrigatórios.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5 sm:grid-cols-2 rounded-xl border border-border bg-card p-6 shadow-sm">



              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="company_name">
                  Nome do cliente <span className="text-destructive">*</span>
                </Label>
                <Input
                  className="bg-muted border-none"
                  id="company_name"
                  value={values.company_name}
                  placeholder="Razão social ou nome do cliente"
                  maxLength={100}
                  aria-invalid={Boolean(fieldErrors.company_name)}
                  aria-describedby={
                    fieldErrors.company_name ? 'company_name-error' : undefined
                  }
                  onChange={(event) => setField('company_name', event.target.value)}
                />
                {fieldErrors.company_name ? (
                  <FieldError id="company_name-error" message={fieldErrors.company_name} />
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="customer_tax_id">
                  NIF <span className="text-destructive">*</span>
                </Label>
                <Input
                  className="bg-muted border-none"
                  id="customer_tax_id"
                  value={values.customer_tax_id}
                  placeholder="Ex.: 5001234567"
                  maxLength={30}
                  aria-invalid={Boolean(fieldErrors.customer_tax_id)}
                  aria-describedby={
                    fieldErrors.customer_tax_id ? 'customer_tax_id-error' : undefined
                  }
                  onChange={(event) => setField('customer_tax_id', event.target.value)}
                />
                {fieldErrors.customer_tax_id ? (
                  <FieldError id="customer_tax_id-error" message={fieldErrors.customer_tax_id} />
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="type">
                  Tipo <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={values.type || NO_TYPE}
                  onValueChange={(value) =>
                    setField('type', value === NO_TYPE ? '' : (value as CustomerType))
                  }
                >
                  <SelectTrigger className="bg-muted border-none" id="type" aria-invalid={Boolean(fieldErrors.type)}>
                    <SelectValue placeholder="Selecionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_TYPE}>Selecionar tipo</SelectItem>
                    {CUSTOMER_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.type ? (
                  <FieldError id="type-error" message={fieldErrors.type} />
                ) : null}
              </div>

            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contacto</CardTitle>
            <CardDescription>Dados de contacto (todos opcionais).</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="contact">Pessoa de contacto</Label>
                <Input
                  placeholder="Nome da pessoa de contacto"
                  className="bg-muted border-none"
                  id="contact"
                  value={values.contact}
                  maxLength={50}
                  aria-invalid={Boolean(fieldErrors.contact)}
                  aria-describedby={fieldErrors.contact ? 'contact-error' : undefined}
                  onChange={(event) => setField('contact', event.target.value)}
                />
                {fieldErrors.contact ? (
                  <FieldError id="contact-error" message={fieldErrors.contact} />
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input

                  className="bg-muted border-none"
                  id="email"
                  type="email"
                  value={values.email}
                  maxLength={254}
                  placeholder="cliente@exemplo.ao"
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                  onChange={(event) => setField('email', event.target.value)}
                />
                {fieldErrors.email ? (
                  <FieldError id="email-error" message={fieldErrors.email} />
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="telephone">Telefone</Label>
                <Input
                  placeholder="923XXXXXX"
                  className="bg-muted border-none"
                  id="telephone"
                  value={values.telephone}
                  maxLength={20}
                  aria-invalid={Boolean(fieldErrors.telephone)}
                  aria-describedby={fieldErrors.telephone ? 'telephone-error' : undefined}
                  onChange={(event) => setField('telephone', event.target.value)}
                />
                {fieldErrors.telephone ? (
                  <FieldError id="telephone-error" message={fieldErrors.telephone} />
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fax">Fax</Label>
                <Input
                  className="bg-muted border-none"
                  id="fax"
                  value={values.fax}
                  maxLength={20}
                  placeholder="923XXXXXX"
                  aria-invalid={Boolean(fieldErrors.fax)}
                  aria-describedby={fieldErrors.fax ? 'fax-error' : undefined}
                  onChange={(event) => setField('fax', event.target.value)}
                />
                {fieldErrors.fax ? (
                  <FieldError id="fax-error" message={fieldErrors.fax} />
                ) : null}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  className="bg-muted border-none"
                  id="website"
                  value={values.website}
                  maxLength={60}
                  placeholder="https://exemplo.ao"
                  aria-invalid={Boolean(fieldErrors.website)}
                  aria-describedby={fieldErrors.website ? 'website-error' : undefined}
                  onChange={(event) => setField('website', event.target.value)}
                />
                {fieldErrors.website ? (
                  <FieldError id="website-error" message={fieldErrors.website} />
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Endereço de facturação</CardTitle>
            <CardDescription>Morada de facturação do cliente.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="billing_building_number">Número da porta</Label>
                <Input
                  className="bg-muted border-none"
                  id="billing_building_number"
                  value={values.billing_building_number}
                  maxLength={15}
                  aria-invalid={Boolean(fieldErrors.billing_building_number)}
                  aria-describedby={
                    fieldErrors.billing_building_number
                      ? 'billing_building_number-error'
                      : undefined
                  }
                  onChange={(event) =>
                    setField('billing_building_number', event.target.value)
                  }
                />
                {fieldErrors.billing_building_number ? (
                  <FieldError
                    id="billing_building_number-error"
                    message={fieldErrors.billing_building_number}
                  />
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="billing_street_name">Nome da rua</Label>
                <Input
                  className="bg-muted border-none"
                  id="billing_street_name"
                  value={values.billing_street_name}
                  maxLength={200}
                  aria-invalid={Boolean(fieldErrors.billing_street_name)}
                  aria-describedby={
                    fieldErrors.billing_street_name ? 'billing_street_name-error' : undefined
                  }
                  onChange={(event) => setField('billing_street_name', event.target.value)}
                />
                {fieldErrors.billing_street_name ? (
                  <FieldError
                    id="billing_street_name-error"
                    message={fieldErrors.billing_street_name}
                  />
                ) : null}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="billing_address_detail">
                  Detalhe do endereço <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="billing_address_detail"
                  value={values.billing_address_detail}
                  rows={2}
                  maxLength={250}
                  placeholder="Detalhe da morada"
                  aria-invalid={Boolean(fieldErrors.billing_address_detail)}
                  aria-describedby={
                    fieldErrors.billing_address_detail
                      ? 'billing_address_detail-error'
                      : undefined
                  }
                  onChange={(event) => setField('billing_address_detail', event.target.value)}
                />
                {fieldErrors.billing_address_detail ? (
                  <FieldError
                    id="billing_address_detail-error"
                    message={fieldErrors.billing_address_detail}
                  />
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="billing_city">
                  Cidade <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="Luanda"
                  className="bg-muted border-none"
                  id="billing_city"
                  value={values.billing_city}
                  maxLength={50}
                  aria-invalid={Boolean(fieldErrors.billing_city)}
                  aria-describedby={fieldErrors.billing_city ? 'billing_city-error' : undefined}
                  onChange={(event) => setField('billing_city', event.target.value)}
                />
                {fieldErrors.billing_city ? (
                  <FieldError id="billing_city-error" message={fieldErrors.billing_city} />
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="billing_postal_code">Código postal</Label>
                <Input
                  className="bg-muted border-none"
                  id="billing_postal_code"
                  value={values.billing_postal_code}
                  maxLength={20}
                  aria-invalid={Boolean(fieldErrors.billing_postal_code)}
                  aria-describedby={
                    fieldErrors.billing_postal_code ? 'billing_postal_code-error' : undefined
                  }
                  onChange={(event) => setField('billing_postal_code', event.target.value)}
                />
                {fieldErrors.billing_postal_code ? (
                  <FieldError
                    id="billing_postal_code-error"
                    message={fieldErrors.billing_postal_code}
                  />
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="billing_province">Província</Label>
                <Input
                  placeholder="Luanda"
                  className="bg-muted border-none"
                  id="billing_province"
                  value={values.billing_province}
                  maxLength={50}
                  aria-invalid={Boolean(fieldErrors.billing_province)}
                  aria-describedby={
                    fieldErrors.billing_province ? 'billing_province-error' : undefined
                  }
                  onChange={(event) => setField('billing_province', event.target.value)}
                />
                {fieldErrors.billing_province ? (
                  <FieldError id="billing_province-error" message={fieldErrors.billing_province} />
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="billing_country">País</Label>
                <Input
                  placeholder="AO"
                  className="bg-muted border-none"
                  id="billing_country"
                  value={values.billing_country}
                  maxLength={12}
                  aria-invalid={Boolean(fieldErrors.billing_country)}
                  aria-describedby={
                    fieldErrors.billing_country ? 'billing_country-error' : undefined
                  }
                  onChange={(event) => setField('billing_country', event.target.value)}
                />
                {fieldErrors.billing_country ? (
                  <FieldError id="billing_country-error" message={fieldErrors.billing_country} />
                ) : null}
              </div>

            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="self_billing_indicator">Auto-facturação</Label>
                <Select
                  value={values.self_billing_indicator ? 'true' : 'false'}
                  onValueChange={(value) =>
                    setField('self_billing_indicator', value === 'true')
                  }
                >
                  <SelectTrigger className="bg-muted border-none" id="self_billing_indicator">
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Não</SelectItem>
                    <SelectItem value="true">Sim</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!isEdit ? (
                <div className="space-y-1.5">
                  <Label htmlFor="is_active">Estado inicial</Label>
                  <Select

                    value={values.is_active ? 'true' : 'false'}
                    onValueChange={(value) => setField('is_active', value === 'true')}
                  >
                    <SelectTrigger className="bg-muted border-none" id="is_active">
                      <SelectValue placeholder="Selecionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Ativo</SelectItem>
                      <SelectItem value="false">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap justify-end gap-2 pt-4">
          <Button asChild variant="outline">
            <Link to="/customers">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="size-4" aria-hidden="true" />
            )}
            {isLoading ? 'A guardar…' : isEdit ? 'Guardar' : 'Criar cliente'}
          </Button>
        </div>



      </form>
    </div>
  );
}
