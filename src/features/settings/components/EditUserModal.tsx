import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '../../../app/components/ui/button';
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
import { FormAlert } from '../../../components/forms/FormAlert';
import { FormField } from '../../../components/forms/FormField';
import { sanitizeAngolanPhone, sanitizeBiNumber } from '../../auth/utils/registerValidation';
import { useUpdateUser } from '../hooks/useUpdateUser';
import type { EditUserFormValues, UserListItem } from '../types/user.types';
import { roleLabel } from '../utils/session';
import { hasAnyError, validateEditUserFields } from '../utils/validation';

interface EditUserModalProps {
  user: UserListItem | null;
  companyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (user: UserListItem) => void;
}

function toValues(user: UserListItem | null): EditUserFormValues {
  return {
    first_name: user?.first_name ?? '',
    last_name: user?.last_name ?? '',
    email: user?.email ?? '',
    phone_number: user?.phone_number ?? '',
    bi_number: user?.bi_number ?? '',
    status: user?.status === 'inactive' ? 'inactive' : 'active',
    password: '',
  };
}

/**
 * Modal de edição de um utilizador.
 *
 * ⚠️ O papel (role) NÃO é editável: o endpoint `POST /v1/users/update/{id}` não
 * aceita `role` no backend. Mostramos o papel atual apenas como informação.
 */
export function EditUserModal({ user, companyId, open, onOpenChange, onSaved }: EditUserModalProps) {
  const {
    update: submitUpdate,
    isUpdating,
    error: submitError,
    fieldErrors: serverErrors,
    resetErrors,
  } = useUpdateUser();

  const [values, setValues] = useState<EditUserFormValues>(() => toValues(user));
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof EditUserFormValues, string>>>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      setValues(toValues(user));
      setFormErrors({});
      setPhotoFile(null);
      resetErrors();
    }
  }, [user, resetErrors]);

  const fieldError = (field: keyof EditUserFormValues): string | undefined =>
    formErrors[field] ?? serverErrors[field];

  const update = (field: keyof EditUserFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    setPhotoFile(event.target.files?.[0] ?? null);
    event.target.value = '';
  };

  if (!user) return null;

  const fullName = `${user.first_name} ${user.last_name}`.trim() || user.email;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isUpdating) return;

    resetErrors();
    const validationErrors = validateEditUserFields(values);
    setFormErrors(validationErrors);
    if (hasAnyError(validationErrors)) return;

    try {
      const updated = await submitUpdate(user.id, {
        company_id: companyId,
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone_number: values.phone_number ? sanitizeAngolanPhone(values.phone_number) : '',
        bi_number: values.bi_number ? sanitizeBiNumber(values.bi_number) : '',
        status: values.status,
        password: values.password || undefined,
        photo: photoFile,
      });
      toast.success('Utilizador atualizado com sucesso.');
      onSaved(updated);
      onOpenChange(false);
    } catch {
      // Erro já normalizado em `submitError` / `serverErrors`.
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar utilizador</DialogTitle>
          <DialogDescription>
            {fullName} · Papel atual: {roleLabel(user.roles[0])} (não editável)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {submitError ? (
            <FormAlert variant="error" title="Não foi possível atualizar" message={submitError} />
          ) : null}

          <div className="grid gap-5 md:grid-cols-2">
            <FormField id="edit_first_name" label="Nome" value={values.first_name} onChange={(v) => update('first_name', v)} error={fieldError('first_name')} required />
            <FormField id="edit_last_name" label="Apelido" value={values.last_name} onChange={(v) => update('last_name', v)} error={fieldError('last_name')} required />
            <FormField id="edit_email" label="Email" type="email" value={values.email} onChange={(v) => update('email', v)} error={fieldError('email')} required className="md:col-span-2" />
            <FormField id="edit_phone" label="Telefone" type="tel" inputMode="tel" value={values.phone_number} onChange={(v) => update('phone_number', sanitizeAngolanPhone(v))} error={fieldError('phone_number')} />
            <FormField id="edit_bi" label="Nº de BI" value={values.bi_number} onChange={(v) => update('bi_number', sanitizeBiNumber(v))} error={fieldError('bi_number')} />
            <FormField id="edit_password" label="Nova palavra-passe" type="password" autoComplete="new-password" value={values.password} onChange={(v) => update('password', v)} error={fieldError('password')} hint="Deixe vazio para manter" className="md:col-span-2" />

            <div className="md:col-span-2">
              <Label htmlFor="edit_status" className="text-sm font-medium text-foreground">
                Estado
              </Label>
              <Select value={values.status} onValueChange={(value) => update('status', value)}>
                <SelectTrigger id="edit_status" className="mt-1.5 h-12 w-full rounded-xl">
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="edit_photo" className="text-sm font-medium text-foreground">
                Fotografia (opcional)
              </Label>
              <Input
                id="edit_photo"
                name="photo"
                type="file"
                accept="image/*"
                className="mt-1.5 h-12 rounded-xl bg-background"
                onChange={handlePhoto}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUpdating}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              ) : (
                <Save size={16} aria-hidden="true" />
              )}
              {isUpdating ? 'A guardar…' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
