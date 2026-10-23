import { type FormEvent, useEffect, useMemo } from 'react';
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
import { Switch } from '../../../app/components/ui/switch';
import { Textarea } from '../../../app/components/ui/textarea';
import { FieldError } from '../../../components/forms/FieldError';
import { FormAlert } from '../../../components/forms/FormAlert';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { PRODUCT_TYPE_OPTIONS, UNIT_OF_MEASURE_OPTIONS } from '../constants';
import { useProductCategories } from '../hooks/useProductCategories';
import { useProductForm } from '../hooks/useProductForm';
import type { ProductType } from '../types';

const NO_TYPE = 'none';
const NO_CATEGORY = 'none';

export function ProductFormPage() {
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
  } = useProductForm(id);

  const { categories } = useProductCategories();

  useDocumentTitle(isEdit ? 'Editar Produto' : 'Novo Produto');

  const imagePreview = useMemo(
    () => (values.image ? URL.createObjectURL(values.image) : null),
    [values.image],
  );

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const record = await submit();
    if (record) {
      navigate('/products');
    }
  };

  if (isLoadingRecord) {
    return (
      <div className="flex h-full items-center justify-center p-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-4 p-6 lg:p-10">
        <FormAlert variant="error" title="Erro ao carregar o produto" message={loadError} />
        <Button asChild variant="outline">
          <Link to="/products">
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 lg:p-10">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" aria-label="Voltar">
            <Link to="/products">
              <ArrowLeft className="size-4" aria-hidden="true" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {isEdit ? 'Editar Produto' : 'Novo Produto'}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isEdit
                ? 'Actualize os dados do produto ou serviço.'
                : 'Registe um novo produto ou serviço no catálogo (SAF-T).'}
            </p>
          </div>
        </div>

        {error ? <FormAlert variant="error" message={error} /> : null}

        <Card>
          <CardHeader>
            <CardTitle>Dados do produto</CardTitle>
            <CardDescription>Campos obrigatórios: tipo, código e descrição.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="product_type">Tipo</Label>
                <Select
                  value={values.product_type || NO_TYPE}
                  onValueChange={(value) =>
                    setField('product_type', value === NO_TYPE ? '' : (value as ProductType))
                  }
                >
                  <SelectTrigger id="product_type" aria-invalid={Boolean(fieldErrors.product_type)}>
                    <SelectValue placeholder="Selecionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_TYPE}>Selecionar tipo</SelectItem>
                    {PRODUCT_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.product_type ? (
                  <FieldError id="product_type-error" message={fieldErrors.product_type} />
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="product_code">Código</Label>
                <Input
                  id="product_code"
                  value={values.product_code}
                  maxLength={60}
                  placeholder="Ex.: PROD-001"
                  aria-invalid={Boolean(fieldErrors.product_code)}
                  aria-describedby={fieldErrors.product_code ? 'product_code-error' : undefined}
                  onChange={(event) => setField('product_code', event.target.value)}
                />
                {fieldErrors.product_code ? (
                  <FieldError id="product_code-error" message={fieldErrors.product_code} />
                ) : null}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="product_description">Descrição</Label>
                <Textarea
                  id="product_description"
                  value={values.product_description}
                  rows={3}
                  maxLength={200}
                  placeholder="Descrição do produto ou serviço"
                  aria-invalid={Boolean(fieldErrors.product_description)}
                  aria-describedby={
                    fieldErrors.product_description ? 'product_description-error' : undefined
                  }
                  onChange={(event) => setField('product_description', event.target.value)}
                />
                {fieldErrors.product_description ? (
                  <FieldError
                    id="product_description-error"
                    message={fieldErrors.product_description}
                  />
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="product_group">Grupo</Label>
                <Input
                  id="product_group"
                  value={values.product_group}
                  maxLength={50}
                  placeholder="Ex.: Bebidas"
                  aria-invalid={Boolean(fieldErrors.product_group)}
                  onChange={(event) => setField('product_group', event.target.value)}
                />
                {fieldErrors.product_group ? (
                  <FieldError id="product_group-error" message={fieldErrors.product_group} />
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category_id">Categoria</Label>
                <Select
                  value={values.category_id || NO_CATEGORY}
                  onValueChange={(value) =>
                    setField('category_id', value === NO_CATEGORY ? '' : value)
                  }
                >
                  <SelectTrigger id="category_id">
                    <SelectValue placeholder="Sem categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_CATEGORY}>Sem categoria</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.category_id ? (
                  <FieldError id="category_id-error" message={fieldErrors.category_id} />
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="product_number_code">Código numérico (EAN)</Label>
                <Input
                  id="product_number_code"
                  value={values.product_number_code}
                  maxLength={60}
                  placeholder="Código de barras (opcional)"
                  aria-invalid={Boolean(fieldErrors.product_number_code)}
                  onChange={(event) => setField('product_number_code', event.target.value)}
                />
                {fieldErrors.product_number_code ? (
                  <FieldError
                    id="product_number_code-error"
                    message={fieldErrors.product_number_code}
                  />
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Se vazio, é repetido o código do produto (SAF-T 2.4.5).
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="un_number">Número ONU</Label>
                <Input
                  id="un_number"
                  value={values.un_number}
                  maxLength={6}
                  placeholder="Ex.: 1234"
                  aria-invalid={Boolean(fieldErrors.un_number)}
                  onChange={(event) => setField('un_number', event.target.value)}
                />
                {fieldErrors.un_number ? (
                  <FieldError id="un_number-error" message={fieldErrors.un_number} />
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="unit_of_measure">Unidade de medida</Label>
                <Select
                  value={values.unit_of_measure}
                  onValueChange={(value) => setField('unit_of_measure', value)}
                >
                  <SelectTrigger
                    id="unit_of_measure"
                    aria-invalid={Boolean(fieldErrors.unit_of_measure)}
                  >
                    <SelectValue placeholder="Selecionar unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIT_OF_MEASURE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.unit_of_measure ? (
                  <FieldError id="unit_of_measure-error" message={fieldErrors.unit_of_measure} />
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="unit_price">Preço unitário (Kz)</Label>
                <Input
                  id="unit_price"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={values.unit_price}
                  placeholder="Ex.: 1500.00"
                  aria-invalid={Boolean(fieldErrors.unit_price)}
                  onChange={(event) => setField('unit_price', event.target.value)}
                />
                {fieldErrors.unit_price ? (
                  <FieldError id="unit_price-error" message={fieldErrors.unit_price} />
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="expiration_date">Data de validade</Label>
                <Input
                  id="expiration_date"
                  type="date"
                  value={values.expiration_date}
                  aria-invalid={Boolean(fieldErrors.expiration_date)}
                  onChange={(event) => setField('expiration_date', event.target.value)}
                />
                {fieldErrors.expiration_date ? (
                  <FieldError id="expiration_date-error" message={fieldErrors.expiration_date} />
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="image">Imagem (opcional)</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  onChange={(event) => setField('image', event.target.files?.[0] ?? null)}
                />
                {isEdit ? (
                  <p className="text-xs text-muted-foreground">
                    Deixe vazio para manter a imagem actual.
                  </p>
                ) : null}
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Pré-visualização da imagem"
                    className="mt-2 h-24 w-24 rounded-md border object-cover"
                  />
                ) : null}
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 border-t pt-6 sm:grid-cols-2">
              {!isEdit ? (
                <div className="space-y-1.5">
                  <Label htmlFor="is_active">Estado inicial</Label>
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
              ) : null}

              <div className="flex items-center justify-between space-x-2">
                <div>
                  <Label htmlFor="is_stockable">Controla stock</Label>
                  <p className="text-xs text-muted-foreground">Produto com gestão de stock.</p>
                </div>
                <Switch
                  id="is_stockable"
                  checked={values.is_stockable}
                  onCheckedChange={(checked) => setField('is_stockable', checked)}
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div>
                  <Label htmlFor="is_inventory_only">Só inventário</Label>
                  <p className="text-xs text-muted-foreground">Não aparece na facturação.</p>
                </div>
                <Switch
                  id="is_inventory_only"
                  checked={values.is_inventory_only}
                  onCheckedChange={(checked) => setField('is_inventory_only', checked)}
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div>
                  <Label htmlFor="is_on_promotion">Em promoção</Label>
                </div>
                <Switch
                  id="is_on_promotion"
                  checked={values.is_on_promotion}
                  onCheckedChange={(checked) => setField('is_on_promotion', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap justify-end gap-2 pt-4">
          <Button asChild variant="outline">
            <Link to="/products">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="size-4" aria-hidden="true" />
            )}
            {isLoading ? 'A guardar…' : isEdit ? 'Guardar' : 'Criar produto'}
          </Button>
        </div>



      </form>
    </div>
  );
}
