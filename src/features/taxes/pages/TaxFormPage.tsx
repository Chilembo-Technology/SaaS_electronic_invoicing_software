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
import {
  TAX_CODE_OPTIONS,
  TAX_COUNTRY_REGION_OPTIONS,
  TAX_TYPE_OPTIONS,
} from '../constants';
import { useTaxForm } from '../hooks/useTaxForm';
import type { TaxCountryRegion, TaxType } from '../types';

/** Valor sentinela do Select para representar "sem valor" (null no backend). */
const NO_TYPE = 'none';
const NO_REGION = 'none';

export function TaxFormPage() {
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
  } = useTaxForm(id);

  useDocumentTitle(isEdit ? 'Editar Imposto' : 'Novo Imposto');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const record = await submit();
    if (record) {
      navigate('/taxes');
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
              <Link to="/taxes">
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
            <Link to="/taxes">
              <ArrowLeft className="size-4" aria-hidden="true" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {isEdit ? 'Editar Imposto' : 'Novo Imposto'}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isEdit
                ? 'Actualize a descrição e a data de expiração do imposto.'
                : 'Registe uma nova entrada na tabela de impostos (SAF-T).'}
            </p>
          </div>
        </div>

        {error ? <FormAlert variant="error" message={error} /> : null}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados do imposto</CardTitle>
            <CardDescription>
              {isEdit
                ? 'O tipo, o código, a região, a percentagem e o montante são imutáveis.'
                : 'Os campos com * são obrigatórios.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="tax_type">
                  Tipo de imposto{' '}
                  {!isEdit ? <span className="text-destructive">*</span> : null}
                </Label>
                <Select
                  value={values.tax_type || NO_TYPE}
                  onValueChange={(value) =>
                    setField('tax_type', value === NO_TYPE ? '' : (value as TaxType))
                  }
                  disabled={isEdit}
                >
                  <SelectTrigger className="bg-muted border-none"  id="tax_type" aria-invalid={Boolean(fieldErrors.tax_type)}>
                    <SelectValue placeholder="Selecionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_TYPE}>Selecionar tipo</SelectItem>
                    {TAX_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.tax_type ? (
                  <FieldError id="tax_type-error" message={fieldErrors.tax_type} />
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tax_code">
                  Código{' '}
                  {!isEdit ? <span className="text-destructive">*</span> : null}
                </Label>
                {values.tax_type === 'IS' ? (
                  <Input
                    className="bg-muted border-none"
                    id="tax_code"
                    value={values.tax_code}
                    placeholder="Verba do Imposto do Selo"
                    maxLength={10}
                    disabled={isEdit}
                    aria-invalid={Boolean(fieldErrors.tax_code)}
                    onChange={(event) => setField('tax_code', event.target.value)}
                  />
                ) : values.tax_type === 'IVA' || values.tax_type === 'NS' ? (
                  <Select
                    value={values.tax_code}
                    onValueChange={(value) => setField('tax_code', value)}
                    disabled={isEdit}
                  >
                    <SelectTrigger className="bg-muted border-none" id="tax_code" aria-invalid={Boolean(fieldErrors.tax_code)}>
                      <SelectValue placeholder="Selecionar código" />
                    </SelectTrigger>
                    <SelectContent>
                      {TAX_CODE_OPTIONS[values.tax_type].map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input className="bg-muted border-none" id="tax_code" disabled placeholder="Selecionar primeiro o tipo" />
                )}
                {fieldErrors.tax_code ? (
                  <FieldError id="tax_code-error" message={fieldErrors.tax_code} />
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tax_country_region">Região</Label>
                <Select
                  value={values.tax_country_region || NO_REGION}
                  onValueChange={(value) =>
                    setField(
                      'tax_country_region',
                      value === NO_REGION ? '' : (value as TaxCountryRegion),
                    )
                  }
                  disabled={isEdit}
                >
                  <SelectTrigger
                    className="bg-muted border-none"
                    id="tax_country_region"
                    aria-invalid={Boolean(fieldErrors.tax_country_region)}
                  >
                    <SelectValue placeholder="Sem região" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_REGION}>Sem região</SelectItem>
                    {TAX_COUNTRY_REGION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.tax_country_region ? (
                  <FieldError
                    id="tax_country_region-error"
                    message={fieldErrors.tax_country_region}
                  />
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tax_expiration_date">Data de expiração</Label>
                <Input
                  className="bg-muted border-none"
                  id="tax_expiration_date"
                  type="date"
                  value={values.tax_expiration_date}
                  aria-invalid={Boolean(fieldErrors.tax_expiration_date)}
                  onChange={(event) => setField('tax_expiration_date', event.target.value)}
                />
                {fieldErrors.tax_expiration_date ? (
                  <FieldError
                    id="tax_expiration_date-error"
                    message={fieldErrors.tax_expiration_date}
                  />
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tax_percentage">Percentagem (%)</Label>
                <Input
                  className="bg-muted border-none"
                  id="tax_percentage"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={values.tax_percentage}
                  placeholder="Ex.: 14"
                  disabled={isEdit}
                  aria-invalid={Boolean(fieldErrors.tax_percentage)}
                  onChange={(event) => setField('tax_percentage', event.target.value)}
                />
                {fieldErrors.tax_percentage ? (
                  <FieldError
                    id="tax_percentage-error"
                    message={fieldErrors.tax_percentage}
                  />
                ) : !isEdit ? (
                  <p className="text-xs text-muted-foreground">
                    Preencha a percentagem OU o montante fixo (não ambos).
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tax_amount">Montante fixo (Kz)</Label>
                <Input
                  className="bg-muted border-none"
                  id="tax_amount"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={values.tax_amount}
                  placeholder="Ex.: 500"
                  disabled={isEdit}
                  aria-invalid={Boolean(fieldErrors.tax_amount)}
                  onChange={(event) => setField('tax_amount', event.target.value)}
                />
                {fieldErrors.tax_amount ? (
                  <FieldError id="tax_amount-error" message={fieldErrors.tax_amount} />
                ) : !isEdit ? (
                  <p className="text-xs text-muted-foreground">
                    Alternativa à percentagem (são exclusivos).
                  </p>
                ) : null}
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

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  className="bg-muted border-none"
                  id="description"
                  value={values.description}
                  rows={3}
                  maxLength={255}
                  placeholder="Descrição do imposto"
                  aria-invalid={Boolean(fieldErrors.description)}
                  aria-describedby={
                    fieldErrors.description ? 'description-error' : undefined
                  }
                  onChange={(event) => setField('description', event.target.value)}
                />
                {fieldErrors.description ? (
                  <FieldError id="description-error" message={fieldErrors.description} />
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap justify-end gap-2 pt-4">
          <Button asChild variant="outline">
            <Link to="/taxes">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="size-4" aria-hidden="true" />
            )}
            {isLoading ? 'A guardar…' : isEdit ? 'Guardar' : 'Criar imposto'}
          </Button>
        </div>
      </form>
    </div>
  );
}
