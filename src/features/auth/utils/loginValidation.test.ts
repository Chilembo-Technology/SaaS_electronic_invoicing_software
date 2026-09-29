import { describe, expect, it } from "vitest";

import {
  LOGIN_FIELDS,
  LOGIN_MESSAGES,
  OTP_LENGTH,
  VERIFY_OTP_FIELDS,
  isOtpComplete,
  sanitizeOtpCode,
  validateLoginField,
  validateLoginForm,
  validateVerifyOtpField,
  validateVerifyOtpForm,
} from "./loginValidation";
import { emptyLoginValues, emptyVerifyOtpValues } from "../types/login";

/**
 * Testes das regras do fluxo de entrada — espelho exacto de `AuthLoginRequest`
 * e `AuthVerifyOTPRequest` do auth_service (mensagens incluídas).
 */

describe("loginValidation — credenciais (AuthLoginRequest)", () => {
  it("exige o email com a mensagem do backend", () => {
    expect(validateLoginField("email", emptyLoginValues)).toBe(LOGIN_MESSAGES.emailRequired);
  });

  it("recusa emails sem formato válido", () => {
    expect(validateLoginField("email", { email: "sem-arroba", password: "x" })).toBe(
      LOGIN_MESSAGES.emailInvalid,
    );
  });

  it("aceita um email válido (mesmo com espaços à volta)", () => {
    expect(
      validateLoginField("email", { email: "  admin@kianda.ao  ", password: "x" }),
    ).toBeUndefined();
  });

  it("exige a password sem impor comprimento mínimo (o login só valida `required`)", () => {
    expect(validateLoginField("password", { email: "a@b.ao", password: "" })).toBe(
      LOGIN_MESSAGES.passwordRequired,
    );
    expect(validateLoginField("password", { email: "a@b.ao", password: "ab" })).toBeUndefined();
  });

  it("agrega os erros de todos os campos na ordem de apresentação", () => {
    const errors = validateLoginForm(emptyLoginValues);

    expect(LOGIN_FIELDS).toEqual(["email", "password"]);
    expect(errors).toEqual({
      email: LOGIN_MESSAGES.emailRequired,
      password: LOGIN_MESSAGES.passwordRequired,
    });
    expect(validateLoginForm({ email: "admin@kianda.ao", password: "segredo123" })).toEqual({});
  });
});

describe("loginValidation — código OTP (AuthVerifyOTPRequest)", () => {
  it("usa os 9 dígitos exigidos por `digits:9`", () => {
    expect(OTP_LENGTH).toBe(9);
  });

  it("mantém apenas dígitos e limita ao comprimento do código", () => {
    expect(sanitizeOtpCode("12 34-56789abc0")).toBe("123456789");
    expect(sanitizeOtpCode("abc")).toBe("");
  });

  it("detecta se o código está completo", () => {
    expect(isOtpComplete("123456789")).toBe(true);
    expect(isOtpComplete("12345678")).toBe(false);
  });

  it("exige o código e o comprimento exacto", () => {
    expect(validateVerifyOtpField("code", emptyVerifyOtpValues)).toBe(
      LOGIN_MESSAGES.codeRequired,
    );
    expect(validateVerifyOtpField("code", { code: "12345" })).toBe(LOGIN_MESSAGES.codeDigits);
    expect(validateVerifyOtpField("code", { code: "123456789" })).toBeUndefined();
  });

  it("valida o formulário do código", () => {
    expect(VERIFY_OTP_FIELDS).toEqual(["code"]);
    expect(validateVerifyOtpForm({ code: "12345678" })).toEqual({
      code: LOGIN_MESSAGES.codeDigits,
    });
    expect(validateVerifyOtpForm({ code: "123456789" })).toEqual({});
  });
});
