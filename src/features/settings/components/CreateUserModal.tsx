import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { Loader2, Upload, UserPlus, X } from 'lucide-react';
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
import { FieldError } from '../../../components/forms/FieldError';
import { FormAlert } from '../../../components/forms/FormAlert';
import { FormField } from '../../../components/forms/FormField';
import { sanitizeAngolanPhone, sanitizeBiNumber } from '../../auth/utils/registerValidation';
import { useCreateUser } from '../hooks/useCreateUser';
import {
  CREATE_USER_DEFAULTS,
  type CreateUserRole,
  type CreateUserField,
  type CreateUserFieldErrors,
  type CreateUserFormValues,
  type UserListItem,
} from '../types/user.types';
import {
  PHOTO_ACCEPT_ATTRIBUTE,
  hasAnyError,
  validateCreateUserFields,
  validateCreateUserPhoto,
} from '../utils/validation';

interface CreateUserModalProps {
  /** `company_id` do utilizador autenticado (`getCompanyId(user)` na página) — NUNCA é campo do formulário. */
  companyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Chamado com o utilizador devolvido pelo 201 — a página faz `refresh()` da lista. */
  onCreated: (user: UserListItem) => void;
}

/** Opções do select de papel — valores EXACTOS aceites pelo `StoreUserRequest`. */
const ROLE_OPTIONS: { value: CreateUserRole; label: string }[] = [
  { value: 'Administrator', label: 'Administrador' },
  { value: 'Operator', label: 'Operador' },
  { value: 'Viewer', label: 'Visualizador' },
];

/**
 * Modal de CRIAÇÃO de utilizador (`POST /v1/users`).
 *
 * Espelha o `EditUserModal` (Dialog shadcn + FormField + FormAlert), com três
 * diferenças: `password`/`bi_number` são obrigatórios, existe select de papel
 * (Administrator | Viewer | Operator — nunca "super-admin") e o `company_id`
 * vem da sessão (`AuthContext`), nunca do formulário.
 */
export function CreateUserModal({ companyId, open, onOpenChange, onCreated }: CreateUserModalProps) {
  const {
    create,
    isCreating,
    error: submitError,
    fieldErrors: serverErrors,
    resetErrors,
  } = useCreateUser();

  const [values, setValues] = useState<CreateUserFormValues>(() => ({ ...CREATE_USER_DEFAULTS }));
  const [formErrors, setFormErrors] = useState<CreateUserFieldErrors>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  /** Cada abertura começa de zero: valores default, sem erros e sem foto. */
  useEffect(() => {
    if (open) {
      setValues({ ...CREATE_USER_DEFAULTS });
      setFormErrors({});
      setPhotoFile(null);
      resetErrors();
    }
  }, [open, resetErrors]);

  const photoPreview = useMemo(() => {
    if (!photoFile || !photoFile.type.startsWith('image/')) return null;
    return URL.createObjectURL(photoFile);
  }, [photoFile]);

  /** Liberta o objectURL quando a foto muda ou o componente é desmontado. */
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const fieldError = (field: CreateUserField): string | undefined =>
    formErrors[field] ?? serverErrors[field];

  const update = <K extends keyof CreateUserFormValues>(
    field: K,
    value: CreateUserFormValues[K],
  ): void => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhoto = (event: ChangeEvent<HTMLInputElement>): void => {
    setPhotoFile(event.target.files?.[0] ?? null);
    // Permite voltar a escolher o mesmo ficheiro depois de o remover.
    event.target.value = '';
  };

  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    if (isCreating || !companyId) return;

    resetErrors();
    const validationErrors = validateCreateUserFields(values);
    const photoError = validateCreateUserPhoto(photoFile);
    if (photoError) validationErrors.photo = photoError;
    setFormErrors(validationErrors);
    if (hasAnyError(validationErrors)) return;

    try {
      const created = await create({
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        phone_number: sanitizeAngolanPhone(values.phone_number),
        bi_number: sanitizeBiNumber(values.bi_number),
        company_id: companyId,
        role: values.role,
        status: values.status,
        photo: photoFile,
      });

      toast.success('Utilizador criado com sucesso.');

      // Reset: a próxima abertura nunca herda os dados anteriores.
      setValues({ ...CREATE_USER_DEFAULTS });
      setFormErrors({});
      setPhotoFile(null);

      onCreated(created);
      onOpenChange(false);
    } catch {
      // Erro já normalizado em `submitError` / `serverErrors`.
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar Utilizador</DialogTitle>
          <DialogDescription>
            Crie um novo utilizador para a sua empresa. O papel define as permissões de acesso.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {submitError ? (
            <FormAlert variant="error" title="Não foi possível criar" message={submitError} />
          ) : null}

          {!companyId ? (
            <FormAlert
              variant="error"
              title="Sessão sem empresa"
              message="Não foi possível identificar a empresa do utilizador autenticado. Volte a iniciar sessão."
            />
          ) : null}

          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              id="create_first_name"
              label="Nome"
              value={values.first_name}
              onChange={(v) => update('first_name', v)}
              error={fieldError('first_name')}
              required
              disabled={isCreating}
              autoComplete="given-name"
              placeholder="Nome próprio"
            />
            <FormField
              id="create_last_name"
              label="Apelido"
              value={values.last_name}
              onChange={(v) => update('last_name', v)}
              error={fieldError('last_name')}
              required
              disabled={isCreating}
              autoComplete="family-name"
              placeholder="Apelido"
            />
            <FormField
              id="create_email"
              label="Email"
              type="email"
              value={values.email}
              onChange={(v) => update('email', v)}
              error={fieldError('email')}
              required
              disabled={isCreating}
              autoComplete="email"
              placeholder="nome@empresa.ao"
              className="md:col-span-2"
            />
            <FormField
              id="create_phone"
              label="Telefone"
              type="tel"
              inputMode="tel"
              value={values.phone_number}
              onChange={(v) => update('phone_number', sanitizeAngolanPhone(v))}
              error={fieldError('phone_number')}
              required
              disabled={isCreating}
              autoComplete="tel"
              placeholder="923000000"
              hint="9 dígitos, começando por 91, 92, 93, 94, 99, 90, 95, 96 ou 97."
            />
            <FormField
              id="create_bi"
              label="Nº de BI"
              value={values.bi_number}
              onChange={(v) => update('bi_number', sanitizeBiNumber(v))}
              error={fieldError('bi_number')}
              required
              disabled={isCreating}
              autoComplete="off"
              placeholder="000000000LA000"
              hint="9 dígitos + 2 letras maiúsculas + 3 dígitos."
            />
            <FormField
              id="create_password"
              label="Senha"
              type="password"
              value={values.password}
              onChange={(v) => update('password', v)}
              error={fieldError('password')}
              required
              disabled={isCreating}
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              hint="Mínimo 8 caracteres — o utilizador poderá alterá-la depois."
              className="md:col-span-2"
            />

            <div>
              <Label htmlFor="create_role" className="text-sm font-medium text-foreground">
                Papel
                <span className="text-destructive" aria-hidden="true">
                  *
                </span>
              </Label>
              <Select
                value={values.role}
                onValueChange={(value) => update('role', value as CreateUserRole)}
                disabled={isCreating}
              >
                <SelectTrigger id="create_role" className="mt-1.5 h-12 w-full rounded-xl">
                  <SelectValue placeholder="Selecione o papel" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldError('role') ? (
                <FieldError id="create_role-error" message={fieldError('role') as string} />
              ) : (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Define as permissões do utilizador.
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="create_status" className="text-sm font-medium text-foreground">
                Estado
              </Label>
              <Select
                value={values.status}
                onValueChange={(value) => update('status', value as CreateUserFormValues['status'])}
                disabled={isCreating}
              >
                <SelectTrigger id="create_status" className="mt-1.5 h-12 w-full rounded-xl">
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
              {fieldError('status') ? (
                <FieldError id="create_status-error" message={fieldError('status') as string} />
              ) : null}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="create_photo" className="text-sm font-medium text-foreground">
                Fotografia (opcional)
              </Label>
              <div className="mt-1.5 flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-border bg-background p-3">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Pré-visualização da fotografia"
                    className="h-12 w-12 rounded-lg border border-border bg-white object-contain p-1"
                  />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Upload size={20} aria-hidden="true" />
                  </span>
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {photoFile ? photoFile.name : 'Sem ficheiro selecionado'}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {photoFile
                      ? `${(photoFile.size / 1024 / 1024).toFixed(2)} MB`
                      : 'JPEG, PNG, GIF, BMP, SVG, WEBP ou HEIC · até 2 MB'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label
                    htmlFor="create_photo"
                    className="inline-flex h-8 cursor-pointer items-center rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    {photoFile ? 'Substituir' : 'Escolher ficheiro'}
                  </label>
                  {photoFile ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setPhotoFile(null)}
                      aria-label="Remover fotografia"
                      className="h-8 rounded-lg px-3 text-muted-foreground"
                    >
                      <X size={15} aria-hidden="true" />
                    </Button>
                  ) : null}
                </div>

                <Input
                  id="create_photo"
                  name="photo"
                  type="file"
                  accept={PHOTO_ACCEPT_ATTRIBUTE}
                  disabled={isCreating}
                  className="sr-only"
                  onChange={handlePhoto}
                />
              </div>
              {fieldError('photo') ? (
                <FieldError id="create_photo-error" message={fieldError('photo') as string} />
              ) : (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Aparece na lista de utilizadores e nos documentos emitidos.
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating || !companyId}>
              {isCreating ? (
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              ) : (
                <UserPlus size={16} aria-hidden="true" />
              )}
              {isCreating ? 'A criar…' : 'Criar Utilizador'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}