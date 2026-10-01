import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '../../../app/components/ui/button';
import { Input } from '../../../app/components/ui/input';
import { Label } from '../../../app/components/ui/label';
import { FieldError } from '../../../components/forms/FieldError';
import { FormAlert } from '../../../components/forms/FormAlert';
import { FormField } from '../../../components/forms/FormField';
import {
  LOGO_ACCEPT_ATTRIBUTE,
  sanitizeAngolanPhone,
  sanitizeTaxNumber,
} from '../../auth/utils/registerValidation';
import { useUpdateCompany } from '../hooks/useUpdateCompany';
import type { CompanyFormValues, CompanySettings } from '../types/company.types';
import { hasAnyError, validateCompanyFields, validatePrivateKeyFile } from '../utils/validation';
import { CompanyLogoUpload } from './CompanyLogoUpload';

interface CompanyFormProps {
  company: CompanySettings;
  /** Só `super-admin` pode guardar (a rota exige esse papel no backend). */
  canEdit: boolean;
  onSaved: (company: CompanySettings) => void;
}

/** Extrai os valores editáveis de uma empresa. */
function toValues(company: CompanySettings): CompanyFormValues {
  return {
    company_name: company.company_name,
    tax_number: company.tax_number,
    admin_email: company.admin_email,
    phone: company.phone,
    phone_number_alternative: company.phone_number_alternative,
    address: company.address,
    city: company.city,
    province: company.province,
    agt_certificate_number: company.agt_certificate_number,
  };
}

export function CompanyForm({ company, canEdit, onSaved }: CompanyFormProps) {
  const {
    save,
    isSaving,
    error: submitError,
    fieldErrors: serverErrors,
    resetErrors,
  } = useUpdateCompany();

  const [values, setValues] = useState<CompanyFormValues>(() => toValues(company));
  const [baseline, setBaseline] = useState<CompanyFormValues>(() => toValues(company));
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CompanyFormValues, string>>>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [privateKeyFile, setPrivateKeyFile] = useState<File | null>(null);
  const [privateKeyError, setPrivateKeyError] = useState<string | undefined>(undefined);

  // Re-sincroniza sempre que a empresa é recarregada (ex.: após guardar).
  useEffect(() => {
    const next = toValues(company);
    setValues(next);
    setBaseline(next);
    setLogoFile(null);
    setPrivateKeyFile(null);
    setPrivateKeyError(undefined);
    setFormErrors({});
  }, [company]);

  const isDirty = useMemo(
    () =>
      JSON.stringify(values) !== JSON.stringify(baseline) ||
      logoFile !== null ||
      privateKeyFile !== null,
    [values, baseline, logoFile, privateKeyFile],
  );

  const fieldError = (field: keyof CompanyFormValues): string | undefined =>
    formErrors[field] ?? serverErrors[field];

  const update = (field: keyof CompanyFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handlePrivateKey = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    const validationError = validatePrivateKeyFile(selected);
    setPrivateKeyError(validationError);
    setPrivateKeyFile(validationError ? null : selected);
    event.target.value = '';
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canEdit || isSaving) return;

    resetErrors();
    const errors = validateCompanyFields(values);
    setFormErrors(errors);
    if (hasAnyError(errors) || privateKeyError) return;

    try {
      // Enviamos SEMPRE o payload completo (ver achado 3 da Fase 1): campos
      // omitidos no `company/update` são sobrescritos com string vazia.
      const updated = await save({
        company_id: company.id,
        company_name: values.company_name,
        tax_number: sanitizeTaxNumber(values.tax_number),
        admin_email: values.admin_email,
        phone: sanitizeAngolanPhone(values.phone),
        phone_number_alternative: values.phone_number_alternative
          ? sanitizeAngolanPhone(values.phone_number_alternative)
          : '',
        address: values.address,
        city: values.city,
        province: values.province,
        agt_certificate_number: values.agt_certificate_number,
        private_key: privateKeyFile,
        logo: logoFile,
      });

      toast.success('Dados da empresa atualizados com sucesso.');
      onSaved(updated);
    } catch {
      // O erro já foi normalizado para `submitError` / `serverErrors`.
    }
  };

  const currentPrivateKey = company.private_key_path
    ? company.private_key_path.split('/').pop()
    : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {!canEdit ? (
        <FormAlert
          variant="info"
          message="Só um Super Administrador pode alterar os dados da empresa. Está a ver os dados em modo de leitura."
        />
      ) : null}

      {submitError ? (
        <FormAlert variant="error" title="Não foi possível guardar" message={submitError} />
      ) : null}

      {/* Dados fiscais */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-foreground">Dados fiscais</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            id="company_name"
            label="Nome da empresa"
            value={values.company_name}
            onChange={(v) => update('company_name', v)}
            error={fieldError('company_name')}
            disabled={!canEdit}
            required
            maxLength={200}
            className="md:col-span-2"
          />
          <FormField
            id="tax_number"
            label="NIF"
            value={values.tax_number}
            onChange={(v) => update('tax_number', sanitizeTaxNumber(v))}
            error={fieldError('tax_number')}
            disabled={!canEdit}
            required
          />
          <FormField
            id="agt_certificate_number"
            label="Nº certificado AGT"
            value={values.agt_certificate_number}
            onChange={(v) => update('agt_certificate_number', v)}
            error={fieldError('agt_certificate_number')}
            disabled={!canEdit}
          />
          <FormField
            id="admin_email"
            label="Email do administrador"
            type="email"
            value={values.admin_email}
            onChange={(v) => update('admin_email', v)}
            error={fieldError('admin_email')}
            disabled={!canEdit}
            required
          />
          <FormField
            id="phone"
            label="Telefone"
            type="tel"
            inputMode="tel"
            value={values.phone}
            onChange={(v) => update('phone', sanitizeAngolanPhone(v))}
            error={fieldError('phone')}
            disabled={!canEdit}
            required
            hint="9 dígitos, ex.: 923456789"
          />
          <FormField
            id="phone_number_alternative"
            label="Telefone alternativo"
            type="tel"
            inputMode="tel"
            value={values.phone_number_alternative}
            onChange={(v) => update('phone_number_alternative', sanitizeAngolanPhone(v))}
            error={fieldError('phone_number_alternative')}
            disabled={!canEdit}
            className="md:col-span-2"
          />
        </div>
      </div>

      {/* Localização */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-foreground">Localização</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            id="address"
            label="Endereço"
            value={values.address}
            onChange={(v) => update('address', v)}
            error={fieldError('address')}
            disabled={!canEdit}
            className="md:col-span-2"
          />
          <FormField
            id="city"
            label="Cidade / Município"
            value={values.city}
            onChange={(v) => update('city', v)}
            error={fieldError('city')}
            disabled={!canEdit}
          />
          <FormField
            id="province"
            label="Província"
            value={values.province}
            onChange={(v) => update('province', v)}
            error={fieldError('province')}
            disabled={!canEdit}
          />
        </div>
      </div>

      {/* Identidade e certificação */}
      <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-base font-semibold text-foreground">Identidade e certificação</h2>

        <CompanyLogoUpload
          file={logoFile}
          onChange={setLogoFile}
          disabled={!canEdit}
          error={serverErrors['logo']}
        />

        <div>
          <Label htmlFor="private_key" className="text-sm font-medium text-foreground">
            Chave privada (certificado AGT)
          </Label>
          <p className="mt-1 text-xs text-muted-foreground">
            {currentPrivateKey ? `Ficheiro atual: ${currentPrivateKey}` : 'Nenhum ficheiro carregado.'}
          </p>
          <Input
            id="private_key"
            name="private_key"
            type="file"
            accept={LOGO_ACCEPT_ATTRIBUTE}
            className="mt-1.5 h-12 rounded-xl bg-background"
            disabled={!canEdit}
            onChange={handlePrivateKey}
          />
          {privateKeyError ? (
            <FieldError id="private_key-error" message={privateKeyError} />
          ) : serverErrors['private_key'] ? (
            <FieldError id="private_key-server-error" message={serverErrors['private_key']} />
          ) : null}
        </div>
      </div>

      {canEdit ? (
        <div className="flex items-center justify-end gap-3">
          <Button type="submit" disabled={!isDirty || isSaving} className="h-11 rounded-xl px-6">
            {isSaving ? (
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            ) : (
              <Save size={16} aria-hidden="true" />
            )}
            {isSaving ? 'A guardar…' : 'Guardar alterações'}
          </Button>
        </div>
      ) : null}
    </form>
  );
}
