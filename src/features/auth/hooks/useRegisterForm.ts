import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import type {
  AdminUserFieldErrors,
  AdminUserFormValues,
  CompanyFieldErrors,
  CompanyFormValues,
  RegisterStep,
  RegisteredCompany,
} from "../types/register";
import { emptyAdminUserValues, emptyCompanyValues } from "../types/register";
import {
  ADMIN_USER_FIELDS,
  COMPANY_FIELDS,
  firstErrorField,
  hasErrors,
  validateAdminUserField,
  validateAdminUserForm,
  validateCompanyField,
  validateCompanyForm,
} from "../utils/registerValidation";
import { API_ERROR_MESSAGES, normalizeApiError, type NormalizedApiError } from "../utils/apiError";
import { registerService, toAdminUserPayload, toCompanyPayload } from "../services/registerService";

/**
 * Orquestra o registo em dois passos: empresa (organization_service) e depois
 * utilizador administrador (auth_service) ligado por `company_id`.
 *
 * Toda a comunicação HTTP acontece em `registerService` — aqui só há estado,
 * validação e tratamento de erros.
 */

/** Mapa `campo do backend -> campo do formulário` para distribuir o 422 do Laravel. */
const COMPANY_FIELD_MAP: Record<string, string> = {
  company_name: "companyName",
  tax_number: "taxNumber",
  admin_email: "adminEmail",
  phone: "phone",
  address: "address",
  city: "city",
  province: "province",
  agt_certificate_number: "agtCertificateNumber",
  logo: "logo",
};

const ADMIN_USER_FIELD_MAP: Record<string, string> = {
  first_name: "firstName",
  last_name: "lastName",
  email: "email",
  password: "password",
  phone_number: "phoneNumber",
  bi_number: "biNumber",
};

type TouchedMap<T extends string> = Partial<Record<T, boolean>>;

export interface GlobalErrorState {
  variant: "error" | "warning" | "info";
  title?: string;
  message: string;
}

/** Dá foco ao primeiro campo inválido (ids do DOM iguais às chaves dos valores). */
function focusField(field: string) {
  if (typeof document === "undefined") return;
  const element = document.getElementById(field);
  if (element instanceof HTMLElement) {
    element.focus();
    element.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

/** Constrói o mapa de "tocado" com todos os campos do passo (foca o 1.º erro). */
function markAllTouched<T extends string>(fields: readonly T[]): TouchedMap<T> {
  return fields.reduce<TouchedMap<T>>((acc, field) => {
    acc[field] = true;
    return acc;
  }, {});
}

/**
 * Separa os erros do backend entre campos do formulário e erros sem campo
 * correspondente (ex.: `company_id`), para que nenhuma mensagem se perca.
 */
function splitBackendFieldErrors(
  fieldErrors: Record<string, string>,
  allowedFields: readonly string[],
): { fields: Record<string, string>; unmatched: string[] } {
  const fields: Record<string, string> = {};
  const unmatched: string[] = [];

  Object.entries(fieldErrors).forEach(([field, message]) => {
    if (allowedFields.includes(field)) {
      fields[field] = message;
    } else {
      unmatched.push(message);
    }
  });

  return { fields, unmatched };
}

export function useRegisterForm() {
  const [step, setStep] = useState<RegisterStep>(1);
  const [companyValues, setCompanyValues] = useState<CompanyFormValues>(emptyCompanyValues);
  const [companyErrors, setCompanyErrors] = useState<CompanyFieldErrors>({});
  const [companyTouched, setCompanyTouched] = useState<TouchedMap<keyof CompanyFormValues>>({});
  const [userValues, setUserValues] = useState<AdminUserFormValues>(emptyAdminUserValues);
  const [userErrors, setUserErrors] = useState<AdminUserFieldErrors>({});
  const [userTouched, setUserTouched] = useState<TouchedMap<keyof AdminUserFormValues>>({});
  /** Passo cujo pedido HTTP está em curso (`null` = nada a decorrer). */
  const [pendingStep, setPendingStep] = useState<RegisterStep | null>(null);
  const [succeeded, setSucceeded] = useState(false);
  const [createdCompany, setCreatedCompany] = useState<RegisteredCompany | null>(null);
  const [globalError, setGlobalError] = useState<GlobalErrorState | null>(null);

  const submitting = pendingStep !== null;
  /** A empresa já existe no servidor: o passo 1 passa a apenas-leitura. */
  const companyLocked = createdCompany !== null;

  /* ------------------------------------------------------------------ */
  /* Passo 1 — empresa                                                   */
  /* ------------------------------------------------------------------ */

  const setCompanyValue = <K extends keyof CompanyFormValues>(
    field: K,
    value: CompanyFormValues[K],
  ) => {
    const nextValues = { ...companyValues, [field]: value };
    setCompanyValues(nextValues);

    // Só revalida depois de o campo ter sido tocado (evita ruído enquanto se escreve)
    if (companyTouched[field] || companyErrors[field]) {
      const error = validateCompanyField(field, nextValues);
      setCompanyErrors((current) => {
        const next = { ...current };
        if (error) next[field] = error;
        else delete next[field];
        return next;
      });
    }
  };

  const handleCompanyBlur = (field: keyof CompanyFormValues) => {
    setCompanyTouched((current) => ({ ...current, [field]: true }));
    const error = validateCompanyField(field, companyValues);
    setCompanyErrors((current) => {
      const next = { ...current };
      if (error) next[field] = error;
      else delete next[field];
      return next;
    });
  };

  const isCompanyFieldValid = (field: keyof CompanyFormValues): boolean => {
    if (!companyTouched[field] || companyErrors[field]) return false;
    if (field === "logo") return Boolean(companyValues.logo);
    return String(companyValues[field] ?? "").trim().length > 0;
  };

  /* ------------------------------------------------------------------ */
  /* Passo 2 — utilizador administrador                                  */
  /* ------------------------------------------------------------------ */

  const setUserValue = <K extends keyof AdminUserFormValues>(
    field: K,
    value: AdminUserFormValues[K],
  ) => {
    const nextValues = { ...userValues, [field]: value };
    setUserValues(nextValues);

    if (userTouched[field] || userErrors[field]) {
      const error = validateAdminUserField(field, nextValues);
      setUserErrors((current) => {
        const next = { ...current };
        if (error) next[field] = error;
        else delete next[field];
        return next;
      });
    }

    // A confirmação de senha depende do campo "password": revalida-a também.
    if (field === "password" && userTouched.confirmPassword) {
      const confirmError = validateAdminUserField("confirmPassword", nextValues);
      setUserErrors((current) => {
        const next = { ...current };
        if (confirmError) next.confirmPassword = confirmError;
        else delete next.confirmPassword;
        return next;
      });
    }
  };

  const handleUserBlur = (field: keyof AdminUserFormValues) => {
    setUserTouched((current) => ({ ...current, [field]: true }));
    const error = validateAdminUserField(field, userValues);
    setUserErrors((current) => {
      const next = { ...current };
      if (error) next[field] = error;
      else delete next[field];
      return next;
    });
  };

  const isUserFieldValid = (field: keyof AdminUserFormValues): boolean => {
    if (!userTouched[field] || userErrors[field]) return false;
    if (field === "acceptTerms") return userValues.acceptTerms;
    return String(userValues[field] ?? "").trim().length > 0;
  };

  /* ------------------------------------------------------------------ */
  /* Navegação entre passos                                              */
  /* ------------------------------------------------------------------ */

  const goToCompanyStep = () => {
    if (submitting) return;
    setGlobalError(null);
    setStep(1);
  };

  const goToUserStep = () => {
    if (submitting || !companyLocked) return;
    setGlobalError(null);
    setStep(2);
    window.setTimeout(() => focusField("firstName"), 0);
  };

  /* ------------------------------------------------------------------ */
  /* Submissão — empresa (passo 1)                                       */
  /* ------------------------------------------------------------------ */

  /** Distribui os erros do backend pelos campos da empresa. */
  const applyCompanyApiErrors = (normalized: NormalizedApiError) => {
    const { fields, unmatched } = splitBackendFieldErrors(normalized.fieldErrors, COMPANY_FIELDS);
    setCompanyErrors(fields as CompanyFieldErrors);
    setCompanyTouched(markAllTouched(COMPANY_FIELDS));

    const firstInvalid = firstErrorField(fields as CompanyFieldErrors, COMPANY_FIELDS);
    if (firstInvalid) window.setTimeout(() => focusField(firstInvalid), 0);

    // Erro por campo fica sempre inline; o toast é reservado a falhas globais.
    const base = normalized.isValidationError ? API_ERROR_MESSAGES.validation : normalized.message;

    setGlobalError({
      variant: normalized.isValidationError ? "warning" : "error",
      title: "Não foi possível criar a empresa",
      message: [base, ...unmatched].join(" "),
    });

    if (!normalized.isValidationError) {
      toast.error(normalized.message);
    }
  };

  const submitCompany = async (event?: FormEvent<HTMLFormElement>): Promise<boolean> => {
    event?.preventDefault();
    if (submitting) return false;

    // Empresa já criada: valida localmente e avança sem novo pedido HTTP
    // (evita duplicar o registo se o utilizador voltar ao passo 1).
    if (companyLocked) {
      const lockedErrors = validateCompanyForm(companyValues);
      if (hasErrors(lockedErrors)) {
        setCompanyErrors(lockedErrors);
        setCompanyTouched(markAllTouched(COMPANY_FIELDS));
        return false;
      }
      goToUserStep();
      return true;
    }

    const validationErrors = validateCompanyForm(companyValues);
    setCompanyErrors(validationErrors);
    setCompanyTouched(markAllTouched(COMPANY_FIELDS));

    if (hasErrors(validationErrors)) {
      const firstInvalid = firstErrorField(validationErrors, COMPANY_FIELDS);
      setGlobalError({
        variant: "warning",
        title: "Dados incompletos",
        message: API_ERROR_MESSAGES.validation,
      });
      if (firstInvalid) window.setTimeout(() => focusField(firstInvalid), 0);
      return false;
    }

    setGlobalError(null);
    setPendingStep(1);

    try {
      const company = await registerService.createCompany(
        toCompanyPayload(companyValues),
        companyValues.logo,
      );

      setCreatedCompany(company);
      setStep(2);

      toast.success("Empresa registada", {
        description: `Ambiente de ${
          company.company_name ?? companyValues.companyName.trim()
        } criado. Falta o utilizador administrador.`,
      });

      window.setTimeout(() => focusField("firstName"), 0);
      return true;
    } catch (error) {
      applyCompanyApiErrors(normalizeApiError(error, COMPANY_FIELD_MAP));
      return false;
    } finally {
      setPendingStep(null);
    }
  };

  /* ------------------------------------------------------------------ */
  /* Submissão — utilizador administrador (passo 2)                      */
  /* ------------------------------------------------------------------ */

  const applyUserApiErrors = (normalized: NormalizedApiError) => {
    const { fields, unmatched } = splitBackendFieldErrors(
      normalized.fieldErrors,
      ADMIN_USER_FIELDS,
    );
    setUserErrors(fields as AdminUserFieldErrors);
    setUserTouched(markAllTouched(ADMIN_USER_FIELDS));

    const firstInvalid = firstErrorField(fields as AdminUserFieldErrors, ADMIN_USER_FIELDS);
    if (firstInvalid) window.setTimeout(() => focusField(firstInvalid), 0);

    const base = normalized.isValidationError ? API_ERROR_MESSAGES.validation : normalized.message;
    const createdCompanyName = createdCompany?.company_name ?? companyValues.companyName.trim();
    const companyHint = createdCompany
      ? ` A empresa «${createdCompanyName}» já está criada — corrija os dados do utilizador e submeta novamente, sem repetir o passo 1.`
      : "";

    setGlobalError({
      variant: normalized.isValidationError ? "warning" : "error",
      title: "Não foi possível criar o utilizador administrador",
      message: `${[base, ...unmatched].join(" ")}${companyHint}`,
    });

    if (!normalized.isValidationError) {
      toast.error(normalized.message);
    }
  };

  const submitAdminUser = async (event?: FormEvent<HTMLFormElement>): Promise<boolean> => {
    event?.preventDefault();
    if (submitting) return false;

    if (!createdCompany?.id) {
      setGlobalError({
        variant: "error",
        title: "Empresa em falta",
        message:
          "Preencha primeiro os dados da empresa — é o `company_id` que liga o utilizador ao ambiente correcto.",
      });
      setStep(1);
      return false;
    }

    const validationErrors = validateAdminUserForm(userValues);
    setUserErrors(validationErrors);
    setUserTouched(markAllTouched(ADMIN_USER_FIELDS));

    if (hasErrors(validationErrors)) {
      const firstInvalid = firstErrorField(validationErrors, ADMIN_USER_FIELDS);
      setGlobalError({
        variant: "warning",
        title: "Dados incompletos",
        message: API_ERROR_MESSAGES.validation,
      });
      if (firstInvalid) window.setTimeout(() => focusField(firstInvalid), 0);
      return false;
    }

    setGlobalError(null);
    setPendingStep(2);

    try {
      await registerService.createAdminUser(toAdminUserPayload(userValues, createdCompany.id));
      setSucceeded(true);

      toast.success("Conta criada com sucesso", {
        description: "Vai ser encaminhado para o login para entrar com as suas credenciais.",
      });

      return true;
    } catch (error) {
      applyUserApiErrors(normalizeApiError(error, ADMIN_USER_FIELD_MAP));
      return false;
    } finally {
      setPendingStep(null);
    }
  };

  /** Limpa todo o formulário (útil para recomeçar depois de um erro). */
  const resetForm = () => {
    setStep(1);
    setCompanyValues(emptyCompanyValues);
    setCompanyErrors({});
    setCompanyTouched({});
    setUserValues(emptyAdminUserValues);
    setUserErrors({});
    setUserTouched({});
    setCreatedCompany(null);
    setSucceeded(false);
    setGlobalError(null);
  };

  return {
    // estado
    step,
    companyValues,
    companyErrors,
    companyTouched,
    userValues,
    userErrors,
    userTouched,
    pendingStep,
    submitting,
    succeeded,
    createdCompany,
    companyLocked,
    globalError,
    // ações do passo 1
    setCompanyValue,
    handleCompanyBlur,
    isCompanyFieldValid,
    submitCompany,
    // ações do passo 2
    setUserValue,
    handleUserBlur,
    isUserFieldValid,
    submitAdminUser,
    // navegação / avisos
    goToCompanyStep,
    goToUserStep,
    setGlobalError,
    resetForm,
  };
}
