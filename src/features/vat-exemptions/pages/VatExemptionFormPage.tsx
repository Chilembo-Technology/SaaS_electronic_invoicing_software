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
import { EXEMPTION_TYPE_OPTIONS } from '../constants';
import { useVatExemptionForm } from '../hooks/useVatExemptionForm';
import type { VatExemptionType } from '../types';

/** Valor sentinela do Select para representar "sem tipo" (null no backend). */
const NO_TYPE = 'none';

export function VatExemptionFormPage() {
  const { code } = useParams<{ code: string }>();
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
  } = useVatExemptionForm(code);

  useDocumentTitle(isEdit ? 'Editar Motivo de Isenção' : 'Novo Motivo de Isenção');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const record = await submit();
    if (record) {
      navigate('/vat-exemptions');
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
              <Link to="/vat-exemptions">
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
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" aria-label="Voltar">
          <Link to="/vat-exemptions">
            <ArrowLeft className="size-4" aria-hidden="true" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {isEdit ? 'Editar Motivo de Isenção' : 'Novo Motivo de Isenção'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isEdit
              ? 'Actualize os dados do motivo de isenção de IVA.'
              : 'Registe um novo motivo de isenção de IVA (código M##).'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados do motivo</CardTitle>
            <CardDescription>Os campos assinalados com * são obrigatórios.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {error ? <FormAlert variant="error" message={error} /> : null}

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="code">
                  Código{' '}
                  <span className="text-destructive" aria-hidden="true">
                    *
                  </span>
                </Label>
                <Input
                  id="code"
                  value={values.code}
                  maxLength={3}
                  disabled={isEdit}
                  placeholder="M04"
                  aria-invalid={Boolean(fieldErrors.code)}
                  aria-describedby={fieldErrors.code ? 'code-error' : undefined}
                  onChange={(e) => setField('code', e.target.value.toUpperCase())}
                  className={isEdit ? 'cursor-not-allowed bg-muted/40' : undefined}
                />
                {fieldErrors.code ? (
                  <FieldError id="code-error" message={fieldErrors.code} />
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {isEdit
                      ? 'O código não pode ser alterado.'
                      : 'Até 3 caracteres (ex.: M04).'}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="legal_basis">Base Legal</Label>
                <Input
                  id="legal_basis"
                  value={values.legal_basis}
                  maxLength={255}
                  placeholder="Art. 12.º, n.º1, a) CIVA"
                  aria-invalid={Boolean(fieldErrors.legal_basis)}
                  aria-describedby={fieldErrors.legal_basis ? 'legal_basis-error' : undefined}
                  onChange={(e) => setField('legal_basis', e.target.value)}
                />
                {fieldErrors.legal_basis ? (
                  <FieldError id="legal_basis-error" message={fieldErrors.legal_basis} />
                ) : null}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">
                Descrição{' '}
                <span className="text-destructive" aria-hidden="true">
                  *
                </span>
              </Label>
              <Textarea
                id="description"
                value={values.description}
                maxLength={500}
                rows={3}
                placeholder="Texto a imprimir na factura (SAF-T TaxExemptionReason)"
                aria-invalid={Boolean(fieldErrors.description)}
                aria-describedby={fieldErrors.description ? 'description-error' : undefined}
                onChange={(e) => setField('description', e.target.value)}
              />
              {fieldErrors.description ? (
                <FieldError id="description-error" message={fieldErrors.description} />
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="exemption_type">Tipo de Isenção</Label>
              <Select
                value={values.exemption_type || NO_TYPE}
                onValueChange={(value) =>
                  setField(
                    'exemption_type',
                    value === NO_TYPE ? '' : (value as VatExemptionType),
                  )
                }
              >
                <SelectTrigger
                  id="exemption_type"
                  aria-invalid={Boolean(fieldErrors.exemption_type)}
                >
                  <SelectValue placeholder="Selecionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_TYPE}>Sem tipo</SelectItem>
                  {EXEMPTION_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.exemption_type ? (
                <FieldError
                  id="exemption_type-error"
                  message={fieldErrors.exemption_type}
                />
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="is_active">Estado</Label>
              <Select
                value={values.is_active ? 'true' : 'false'}
                onValueChange={(value) => setField('is_active', value === 'true')}
              >
                <SelectTrigger id="is_active">
                  <SelectValue placeholder="Selecionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Ativo</SelectItem>
                  <SelectItem value="false">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description_detail">Detalhes</Label>
              <Textarea
                id="description_detail"
                value={values.description_detail}
                rows={3}
                placeholder="Descrição detalhada (coluna «Descrição» do catálogo AGT)"
                aria-invalid={Boolean(fieldErrors.description_detail)}
                aria-describedby={
                  fieldErrors.description_detail ? 'description_detail-error' : undefined
                }
                onChange={(e) => setField('description_detail', e.target.value)}
              />
              {fieldErrors.description_detail ? (
                <FieldError
                  id="description_detail-error"
                  message={fieldErrors.description_detail}
                />
              ) : null}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap justify-end gap-2 pt-4">
          <Button asChild variant="outline">
            <Link to="/vat-exemptions">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="size-4" aria-hidden="true" />
            )}
            {isLoading ? 'A guardar…' : 'Guardar'}
          </Button>
        </div>
      </form>
    </div>
  );
}

