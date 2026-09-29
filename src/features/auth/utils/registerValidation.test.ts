import { describe, expect, it } from "vitest";

import {
  ADMIN_USER_FIELDS,
  COMPANY_FIELDS,
  COMPANY_NAME_MAX,
  COMPANY_PASSWORD_MIN,
  EMAIL_REGEX,
  LOGO_MAX_BYTES,
  MESSAGES,
  PHONE_REGEX,
  TAX_NUMBER_MAX,
  TAX_NUMBER_REGEX,
  firstErrorField,
  hasErrors,
  planLabels,
  resolvePlanLabel,
  sanitizeAngolanPhone,
  sanitizeBiNumber,
  sanitizeTaxNumber,
  validateAdminUserField,
  validateAdminUserForm,
  validateCompanyField,
  validateCompanyForm,
} from "./registerValidation";
import { emptyAdminUserValues, emptyCompanyValues } from "../types/register";

/** Valores válidos do passo 2 (utilizador administrador). */
const validUser = {
  ...emptyAdminUserValues,
  firstName: "Ana",
  lastName: "Silva",
  email: "ana@kianda.ao",
  phoneNumber: "923111222",
  biNumber: "000000000LA000",
  password: "segredo123",
  confirmPassword: "segredo123",
  acceptTerms: true,
};

/**
 * Estas regras são o ESPELHO de:
 *   - organization_service/app/Http/Requests/Company/StoreCompanyRequest.php
 *   - auth_service/app/Http/Requests/User/StoreUserRequest.php
 * As cadeias comparadas aqui são as mensagens exactas devolvidas pelo Laravel.
 */

/** Ficheiro falso: a validação só usa `name` e `size`. */
const fakeFile = (name: string, size: number) => ({ name, size }) as unknown as File;

const validCompany = {
  ...emptyCompanyValues,
  companyName: "Kianda Logística, Lda",
  taxNumber: "541789632LA045",
  adminEmail: "admin@kianda.ao",
  phone: "923000000",
  address: "Rua Amílcar Cabral, 12",
  city: "Luanda",
  province: "Luanda",
  agtCertificateNumber: "AGT-2026-001",
};

describe("constantes espelhadas do backend", () => {
  it("aceita os padrões de telefone angolano do Laravel", () => {
    [
      "900000000",
      "910000000",
      "920000000",
      "930000000",
      "940000000",
      "950000000",
      "960000000",
      "970000000",
      "990000000",
    ].forEach((phone) => expect(PHONE_REGEX.test(phone)).toBe(true));

    ["890000000", "92300000", "9230000000", "92300000a"].forEach((phone) =>
      expect(PHONE_REGEX.test(phone)).toBe(false),
    );
  });

  it("aceita os dois formatos de NIF da AGT", () => {
    expect(TAX_NUMBER_REGEX.test("541789632LA045")).toBe(true);
    ["1", "2", "5"].forEach((prefix) =>
      expect(TAX_NUMBER_REGEX.test(`${prefix}000000000`)).toBe(true),
    );
    expect(TAX_NUMBER_REGEX.test("3000000000")).toBe(false);
    expect(TAX_NUMBER_REGEX.test("541789632la045")).toBe(false); // exige maiúsculas
  });

  it("respeita os limites usados nas colunas da BD", () => {
    expect(COMPANY_NAME_MAX).toBe(200);
    expect(TAX_NUMBER_MAX).toBe(20);
    expect(COMPANY_PASSWORD_MIN).toBe(8);
  });
});

describe("sanitizadores (o backend exige formatos estritos)", () => {
  it("remove o indicativo do país e os não-dígitos do telefone", () => {
    expect(sanitizeAngolanPhone("+244 923 000 000")).toBe("923000000");
    expect(sanitizeAngolanPhone("(923) 000-000")).toBe("923000000");
    expect(sanitizeAngolanPhone("244923000000")).toBe("923000000");
    expect(sanitizeAngolanPhone("92300000012")).toBe("923000000");
  });

  it("normaliza o NIF para maiúsculas alfanuméricas", () => {
    expect(sanitizeTaxNumber("541789632la045")).toBe("541789632LA045");
    expect(sanitizeTaxNumber("541 789 632 / la 045")).toBe("541789632LA045");
  });

  it("normaliza o número de BI", () => {
    expect(sanitizeBiNumber(" 000000000la000 ")).toBe("000000000LA000");
  });
});

describe("passo 1 — validação por campo (empresa)", () => {
  it("exige os campos obrigatórios", () => {
    expect(validateCompanyField("companyName", emptyCompanyValues)).toBe(MESSAGES.companyNameRequired);
    expect(validateCompanyField("taxNumber", emptyCompanyValues)).toBe(MESSAGES.taxNumberRequired);
    expect(validateCompanyField("adminEmail", emptyCompanyValues)).toBe(MESSAGES.adminEmailRequired);
    expect(validateCompanyField("phone", emptyCompanyValues)).toBe(MESSAGES.phoneRequired);
  });

  it("valida o formato do NIF com a mensagem do backend", () => {
    expect(validateCompanyField("taxNumber", { ...emptyCompanyValues, taxNumber: "123" })).toBe(
      MESSAGES.taxNumberFormat,
    );
    expect(
      validateCompanyField("taxNumber", { ...emptyCompanyValues, taxNumber: "541789632LA045" }),
    ).toBeUndefined();
    expect(validateCompanyField("taxNumber", { ...emptyCompanyValues, taxNumber: "5000000000" })).toBeUndefined();
  });

  it("valida o email do administrador", () => {
    expect(validateCompanyField("adminEmail", { ...emptyCompanyValues, adminEmail: "sem-arroba" })).toBe(
      MESSAGES.adminEmailInvalid,
    );
    expect(EMAIL_REGEX.test("admin@kianda.ao")).toBe(true);
    expect(
      validateCompanyField("adminEmail", { ...emptyCompanyValues, adminEmail: "admin@kianda.ao" }),
    ).toBeUndefined();
  });

  it("valida o telefone da empresa", () => {
    expect(validateCompanyField("phone", { ...emptyCompanyValues, phone: "123000000" })).toBe(MESSAGES.phoneFormat);
    expect(validateCompanyField("phone", { ...emptyCompanyValues, phone: "923000000" })).toBeUndefined();
  });

  it("limita os campos opcionais a 255 caracteres", () => {
    const long = "a".repeat(256);
    expect(validateCompanyField("address", { ...emptyCompanyValues, address: long })).toBe(MESSAGES.addressMax);
    expect(validateCompanyField("city", { ...emptyCompanyValues, city: long })).toBe(MESSAGES.cityMax);
    expect(validateCompanyField("province", { ...emptyCompanyValues, province: long })).toBe(MESSAGES.provinceMax);
    expect(
      validateCompanyField("agtCertificateNumber", { ...emptyCompanyValues, agtCertificateNumber: long }),
    ).toBe(MESSAGES.agtMax);
  });

  it("valida o logotipo (extensão e tamanho) e aceita a ausência", () => {
    expect(validateCompanyField("logo", { ...emptyCompanyValues, logo: fakeFile("logo.exe", 1024) })).toBe(
      MESSAGES.logoMimes,
    );
    expect(
      validateCompanyField("logo", { ...emptyCompanyValues, logo: fakeFile("logo.png", 3 * 1024 * 1024) }),
    ).toBe(MESSAGES.logoMax);
    expect(
      validateCompanyField("logo", { ...emptyCompanyValues, logo: fakeFile("logo.png", LOGO_MAX_BYTES) }),
    ).toBeUndefined();
    expect(validateCompanyField("logo", emptyCompanyValues)).toBeUndefined();
  });

  it("não devolve erros quando o formulário está completo", () => {
    expect(hasErrors(validateCompanyForm(validCompany))).toBe(false);
  });

  it("acumula vários erros de uma só vez", () => {
    const errors = validateCompanyForm(emptyCompanyValues);
    // Só os obrigatórios falham: address, city, province, agtCertificateNumber e logo são opcionais.
    expect(Object.keys(errors)).toHaveLength(COMPANY_FIELDS.length - 5);
    expect(hasErrors(errors)).toBe(true);
  });

  it("devolve o primeiro campo inválido pela ordem visual", () => {
    const errors = validateCompanyForm({ ...validCompany, companyName: "", taxNumber: "", adminEmail: "x" });
    expect(firstErrorField(errors, COMPANY_FIELDS)).toBe("companyName");
    expect(firstErrorField({ ...errors, companyName: undefined }, COMPANY_FIELDS)).toBe("taxNumber");
    expect(firstErrorField({}, COMPANY_FIELDS)).toBeUndefined();
  });
});

describe("passo 2 — validação por campo (utilizador administrador)", () => {
  it("exige nome, sobrenome, email e telefone", () => {
    expect(validateAdminUserField("firstName", emptyAdminUserValues)).toBe(MESSAGES.firstNameRequired);
    expect(validateAdminUserField("lastName", emptyAdminUserValues)).toBe(MESSAGES.lastNameRequired);
    expect(validateAdminUserField("email", emptyAdminUserValues)).toBe(MESSAGES.emailRequired);
    expect(validateAdminUserField("phoneNumber", emptyAdminUserValues)).toBe(MESSAGES.userPhoneRequired);
  });

  it("valida o número de BI (9 dígitos + 2 letras + 3 dígitos)", () => {
    expect(validateAdminUserField("biNumber", { ...emptyAdminUserValues, biNumber: "00000000LA000" })).toBe(
      MESSAGES.biFormat,
    );
    expect(
      validateAdminUserField("biNumber", { ...emptyAdminUserValues, biNumber: "000000000LA000" }),
    ).toBeUndefined();
  });

  it("valida a senha e a confirmação (regra exclusiva do cliente)", () => {
    expect(validateAdminUserField("password", { ...emptyAdminUserValues, password: "123" })).toBe(
      MESSAGES.passwordMin,
    );
    expect(validateAdminUserField("password", { ...emptyAdminUserValues, password: "segredo123" })).toBeUndefined();
    expect(
      validateAdminUserField("confirmPassword", {
        ...emptyAdminUserValues,
        password: "segredo123",
        confirmPassword: "outra-coisa",
      }),
    ).toBe(MESSAGES.confirmPasswordMismatch);
    expect(validateAdminUserField("confirmPassword", validUser)).toBeUndefined();
  });

  it("exige a aceitação dos termos", () => {
    expect(validateAdminUserField("acceptTerms", emptyAdminUserValues)).toBe(MESSAGES.acceptTermsRequired);
    expect(validateAdminUserField("acceptTerms", validUser)).toBeUndefined();
  });

  it("não devolve erros quando o utilizador está completo", () => {
    expect(hasErrors(validateAdminUserForm(validUser))).toBe(false);
    expect(ADMIN_USER_FIELDS).toHaveLength(8);
  });

  it("acusa todos os campos em falta no formulário vazio", () => {
    const errors = validateAdminUserForm(emptyAdminUserValues);
    expect(Object.keys(errors)).toHaveLength(ADMIN_USER_FIELDS.length);
  });
});

describe("etiquetas de plano da Landing Page", () => {
  it("traduz o código do plano para o nome apresentado", () => {
    expect(resolvePlanLabel("empresa")).toBe(planLabels.empresa);
    expect(resolvePlanLabel("essencial")).toBe(planLabels.essencial);
    expect(resolvePlanLabel("pos-pago")).toBe("Pós-Pago Flex");
  });

  it("usa o plano padrão quando não há código ou o código é desconhecido", () => {
    expect(resolvePlanLabel(null)).toBe(planLabels.profissional);
    expect(resolvePlanLabel("desconhecido")).toBe(planLabels.profissional);
  });
});
