/**
 * Validação do formulário de registo (página pública `/registar`).
 *
 * Nota: validação 100% no cliente. Quando o `auth_service` expuser um endpoint
 * de auto-registo, a validação do servidor deve ser acrescentada ao erro
 * devolvido pela API — a UI já suporta erros por campo.
 */

export interface RegisterFormValues {
  companyName: string;
  nif: string;
  fullName: string;
  email: string;
  phone: string;
  plan: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export type RegisterFormErrors = Partial<Record<keyof RegisterFormValues, string>>;

export const initialRegisterValues: RegisterFormValues = {
  companyName: "",
  nif: "",
  fullName: "",
  email: "",
  phone: "",
  plan: "profissional",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
};

/** Etiquetas amigáveis dos planos escolhidos na Landing Page. */
export const planLabels: Record<string, string> = {
  essencial: "Essencial (pré-pago)",
  profissional: "Profissional (pré-pago)",
  empresa: "Empresa (pré-pago)",
  "pos-pago": "Pós-Pago Flex",
  personalizado: "Plano personalizado",
};

export function resolvePlanLabel(plan: string | null): string {
  if (!plan) {
    return planLabels.profissional;
  }
  return planLabels[plan] ?? planLabels.profissional;
}

/** Devolve um mapa de erros por campo (vazio quando o formulário é válido). */
export function validateRegisterForm(
  values: RegisterFormValues,
): RegisterFormErrors {
  const errors: RegisterFormErrors = {};

  if (values.companyName.trim().length < 3) {
    errors.companyName = "Indique o nome da empresa (mínimo 3 caracteres).";
  }

  if (!/^\d{10}$/.test(values.nif.trim())) {
    errors.nif = "O NIF deve ter exatamente 10 dígitos.";
  }

  if (values.fullName.trim().length < 3) {
    errors.fullName = "Indique o nome do responsável.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
    errors.email = "Indique um email válido.";
  }

  if (!/^(\+?244)?\s?9\d{2}\s?\d{3}\s?\d{3}$/.test(values.phone.trim())) {
    errors.phone = "Indique um número angolano válido (ex.: 923 000 000).";
  }

  if (values.password.length < 8) {
    errors.password = "A senha deve ter pelo menos 8 caracteres.";
  } else if (!/[A-Za-z]/.test(values.password) || !/\d/.test(values.password)) {
    errors.password = "Combine letras e números na senha.";
  }

  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "As senhas não coincidem.";
  }

  if (!values.acceptTerms) {
    errors.acceptTerms = "É necessário aceitar os Termos e a Condições.";
  }

  return errors;
}

export function hasErrors(errors: RegisterFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
