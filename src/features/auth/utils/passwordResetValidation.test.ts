import { describe, expect, it } from "vitest";

/**
 * Testes das regras do fluxo de recuperação de palavra-passe.
 *
 * As mensagens são as MESMAS constantes já usadas pelo registo (`MESSAGES`) e
 * pelo login (`LOGIN_MESSAGES`) — não são reescritas neste módulo.
 */

import {
  FORGOT_PASSWORD_FIELDS,
  NEW_PASSWORD_FIELDS,
  RESET_OTP_FIELDS,
  isPendingPasswordReset,
  mapNewPasswordFieldErrors,
  validateForgotPasswordForm,
  validateNewPasswordField,
  validateNewPasswordForm,
  validateResetOtpForm,
} from "./passwordResetValidation";
import { MESSAGES } from "./registerValidation";
import { LOGIN_MESSAGES } from "./loginValidation";
import {
  emptyForgotPasswordValues,
  emptyNewPasswordValues,
  emptyResetOtpValues,
} from "../types/passwordReset";

describe("validação do ecrã 1 (email)", () => {
  it("exige o email", () => {
    expect(validateForgotPasswordForm(emptyForgotPasswordValues)).toEqual({
      email: MESSAGES.emailRequired,
    });
  });

  it("recusa um email sem formato válido", () => {
    expect(validateForgotPasswordForm({ email: "sem-arroba" })).toEqual({
      email: MESSAGES.emailInvalid,
    });
  });

  it("aceita um email válido e só tem o campo `email`", () => {
    expect(validateForgotPasswordForm({ email: "ana@kianda.ao" })).toEqual({});
    expect(FORGOT_PASSWORD_FIELDS).toEqual(["email"]);
  });
});

describe("validação do ecrã 2 (código OTP)", () => {
  it("exige o código e respeita os 9 dígitos do backend", () => {
    expect(validateResetOtpForm(emptyResetOtpValues)).toEqual({
      code: LOGIN_MESSAGES.codeRequired,
    });
    expect(validateResetOtpForm({ code: "12345678" })).toEqual({
      code: LOGIN_MESSAGES.codeDigits,
    });
    expect(validateResetOtpForm({ code: "123456789" })).toEqual({});
    expect(RESET_OTP_FIELDS).toEqual(["code"]);
  });
});

describe("validação do ecrã 3 (nova senha)", () => {
  it("exige as duas senhas", () => {
    const errors = validateNewPasswordForm(emptyNewPasswordValues);
    expect(errors.password).toBe(MESSAGES.passwordRequired);
    expect(errors.confirmPassword).toBe(MESSAGES.confirmPasswordMismatch);
  });

  it("impõe o comprimento mínimo usado no registo", () => {
    expect(
      validateNewPasswordField("password", { password: "curta", confirmPassword: "curta" }),
    ).toBe(MESSAGES.passwordMin);
  });

  it("avisa quando as senhas não coincidem", () => {
    expect(
      validateNewPasswordForm({ password: "segredo123", confirmPassword: "segredo124" }),
    ).toEqual({ confirmPassword: MESSAGES.confirmPasswordMismatch });
  });

  it("aceita duas senhas iguais e só tem `password`/`confirmPassword`", () => {
    expect(validateNewPasswordForm({ password: "segredo123", confirmPassword: "segredo123" })).toEqual(
      {},
    );
    expect(NEW_PASSWORD_FIELDS).toEqual(["password", "confirmPassword"]);
  });
});

describe("mapNewPasswordFieldErrors", () => {
  it("traduz `new_password` (Laravel) para `password` (formulário)", () => {
    expect(
      mapNewPasswordFieldErrors({
        new_password: ["O campo senha é obrigatorio."],
        email: ["Email inexistente"],
      }),
    ).toEqual({
      password: ["O campo senha é obrigatorio."],
      email: ["Email inexistente"],
    });
  });
});

describe("isPendingPasswordReset", () => {
  it("aceita o estado com email e recusa tudo o resto", () => {
    expect(isPendingPasswordReset({ email: "ana@kianda.ao", expiresAt: null })).toBe(true);
    expect(isPendingPasswordReset({ email: "  " })).toBe(false);
    expect(isPendingPasswordReset({ expiresAt: "2026-09-30 10:30:00" })).toBe(false);
    expect(isPendingPasswordReset(null)).toBe(false);
    expect(isPendingPasswordReset(undefined)).toBe(false);
    expect(isPendingPasswordReset("ana@kianda.ao")).toBe(false);
  });
});
