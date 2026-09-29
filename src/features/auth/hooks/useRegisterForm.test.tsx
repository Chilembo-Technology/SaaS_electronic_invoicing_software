import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { API_ERROR_MESSAGES } from "../utils/apiError";
import { MESSAGES } from "../utils/registerValidation";
import { httpError, networkError, validationErrorBody } from "../../../test/helpers";

/**
 * Testes do hook que orquestra o registo. Os serviços são substituídos por
 * espiões: verifica-se a validação cliente, o mapeamento do 422, os avisos
 * globais (toast) e a regra que impede duplicar a empresa.
 */

const { serviceMocks, toastMocks } = vi.hoisted(() => ({
  serviceMocks: { createCompany: vi.fn(), createAdminUser: vi.fn() },
  toastMocks: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("../services/registerService", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../services/registerService")>();
  return { ...actual, registerService: serviceMocks };
});

vi.mock("sonner", () => ({ toast: toastMocks }));

import { useRegisterForm } from "./useRegisterForm";

const validCompany = {
  companyName: "Kianda Logística, Lda",
  taxNumber: "541789632la045",
  adminEmail: "Admin@Kianda.ao",
  phone: "+244 923 000 000",
  address: "Rua 1",
  city: "Luanda",
  province: "Luanda",
  agtCertificateNumber: "",
  logo: null as File | null,
};

const validUser = {
  firstName: "Ana",
  lastName: "Silva",
  email: "ana@kianda.ao",
  phoneNumber: "923111222",
  biNumber: "000000000LA000",
  password: "segredo123",
  confirmPassword: "segredo123",
  acceptTerms: true,
};

type RegisterForm = ReturnType<typeof useRegisterForm>;

/** Preenche o passo 1 campo a campo (cada `set` provoca uma re-renderização). */
async function fillCompany(result: { current: RegisterForm }, values: Partial<typeof validCompany> = {}) {
  for (const [field, value] of Object.entries({ ...validCompany, ...values })) {
    await act(async () => {
      result.current.setCompanyValue(field as never, value as never);
    });
  }
}

/** Preenche o passo 2 campo a campo. */
async function fillUser(result: { current: RegisterForm }, values: Partial<typeof validUser> = {}) {
  for (const [field, value] of Object.entries({ ...validUser, ...values })) {
    await act(async () => {
      result.current.setUserValue(field as never, value as never);
    });
  }
}

describe("useRegisterForm — validação no cliente", () => {
  it("não chama a API quando a empresa está incompleta", async () => {
    const { result } = renderHook(() => useRegisterForm());

    await act(async () => {
      await result.current.submitCompany();
    });

    expect(serviceMocks.createCompany).not.toHaveBeenCalled();
    expect(result.current.step).toBe(1);
    expect(result.current.companyErrors.companyName).toBe(MESSAGES.companyNameRequired);
    expect(result.current.companyErrors.taxNumber).toBe(MESSAGES.taxNumberRequired);
    expect(result.current.globalError).toEqual({
      variant: "warning",
      title: "Dados incompletos",
      message: API_ERROR_MESSAGES.validation,
    });
    expect(toastMocks.error).not.toHaveBeenCalled();
  });

  it("valida por campo no blur e limpa o erro quando o valor é corrigido", async () => {
    const { result } = renderHook(() => useRegisterForm());

    await act(async () => result.current.setCompanyValue("taxNumber", "123"));
    await act(async () => result.current.handleCompanyBlur("taxNumber"));
    expect(result.current.companyErrors.taxNumber).toBe(MESSAGES.taxNumberFormat);

    await act(async () => result.current.setCompanyValue("taxNumber", "541789632LA045"));
    expect(result.current.companyErrors.taxNumber).toBeUndefined();
  });

  it("não avança quando faltam dados do utilizador", async () => {
    const { result } = renderHook(() => useRegisterForm());

    serviceMocks.createCompany.mockResolvedValueOnce({ id: "uuid-1", company_name: "Kianda Logística, Lda" });
    await fillCompany(result);
    await act(async () => {
      await result.current.submitCompany();
    });

    await act(async () => {
      await result.current.submitAdminUser();
    });

    expect(serviceMocks.createAdminUser).not.toHaveBeenCalled();
    expect(result.current.userErrors.firstName).toBe(MESSAGES.firstNameRequired);
    expect(result.current.userErrors.acceptTerms).toBe(MESSAGES.acceptTermsRequired);
    expect(result.current.succeeded).toBe(false);
  });
});

describe("useRegisterForm — passo 1 (empresa)", () => {
  it("cria a empresa, avança para o passo 2 e notifica o sucesso", async () => {
    const { result } = renderHook(() => useRegisterForm());
    serviceMocks.createCompany.mockResolvedValueOnce({ id: "uuid-1", company_name: "Kianda Logística, Lda" });

    await fillCompany(result);
    await act(async () => {
      await result.current.submitCompany();
    });

    expect(serviceMocks.createCompany).toHaveBeenCalledTimes(1);
    expect(serviceMocks.createCompany).toHaveBeenCalledWith(
      expect.objectContaining({
        company_name: "Kianda Logística, Lda",
        tax_number: "541789632LA045",
        admin_email: "admin@kianda.ao",
        phone: "923000000",
      }),
      null,
    );

    expect(result.current.step).toBe(2);
    expect(result.current.companyLocked).toBe(true);
    expect(result.current.createdCompany?.id).toBe("uuid-1");
    expect(result.current.pendingStep).toBeNull();
    expect(toastMocks.success).toHaveBeenCalledWith("Empresa registada", expect.anything());
  });

  it("distribui o 422 do Laravel pelos campos e não usa toast", async () => {
    const { result } = renderHook(() => useRegisterForm());
    serviceMocks.createCompany.mockRejectedValueOnce(
      httpError(
        422,
        validationErrorBody({
          admin_email: ["O email do administrador já está em uso."],
          tax_number: ["O número de imposto já está em uso."],
        }),
      ),
    );

    await fillCompany(result);
    await act(async () => {
      await result.current.submitCompany();
    });

    expect(result.current.companyErrors.adminEmail).toBe("O email do administrador já está em uso.");
    expect(result.current.companyErrors.taxNumber).toBe("O número de imposto já está em uso.");
    expect(result.current.globalError?.variant).toBe("warning");
    expect(result.current.step).toBe(1);
    expect(toastMocks.error).not.toHaveBeenCalled();
  });

  it("mostra no banner os erros que não correspondem a nenhum campo", async () => {
    const { result } = renderHook(() => useRegisterForm());
    serviceMocks.createCompany.mockRejectedValueOnce(
      httpError(422, validationErrorBody({ company_id: ["O campo ID da empresa é obrigatório."] })),
    );

    await fillCompany(result);
    await act(async () => {
      await result.current.submitCompany();
    });

    expect(result.current.globalError?.message).toContain("O campo ID da empresa é obrigatório.");
  });

  it("usa toast e banner de erro em falhas de servidor", async () => {
    const { result } = renderHook(() => useRegisterForm());
    serviceMocks.createCompany.mockRejectedValueOnce(httpError(500, { message: "Server Error" }));

    await fillCompany(result);
    await act(async () => {
      await result.current.submitCompany();
    });

    expect(result.current.globalError?.variant).toBe("error");
    expect(result.current.globalError?.message).toBe(API_ERROR_MESSAGES.server);
    expect(toastMocks.error).toHaveBeenCalledWith(API_ERROR_MESSAGES.server);
  });

  it("usa banner de rede quando o servidor não responde", async () => {
    const { result } = renderHook(() => useRegisterForm());
    serviceMocks.createCompany.mockRejectedValueOnce(networkError());

    await fillCompany(result);
    await act(async () => {
      await result.current.submitCompany();
    });

    expect(result.current.globalError?.message).toBe(API_ERROR_MESSAGES.network);
    expect(toastMocks.error).toHaveBeenLastCalledWith(API_ERROR_MESSAGES.network);
  });

  it("não duplica a empresa quando o passo 1 é submetido novamente", async () => {
    const { result } = renderHook(() => useRegisterForm());
    serviceMocks.createCompany.mockResolvedValueOnce({ id: "uuid-1" });

    await fillCompany(result);
    await act(async () => {
      await result.current.submitCompany();
    });
    await act(async () => {
      await result.current.submitCompany();
    });

    expect(serviceMocks.createCompany).toHaveBeenCalledTimes(1);
    expect(result.current.step).toBe(2);
  });
});

describe("useRegisterForm — passo 2 (utilizador administrador)", () => {
  /** Leva o formulário até ao passo 2 (empresa criada com sucesso). */
  async function reachStepTwo(result: { current: RegisterForm }) {
    serviceMocks.createCompany.mockResolvedValueOnce({
      id: "uuid-1",
      company_name: "Kianda Logística, Lda",
    });
    await fillCompany(result);
    await act(async () => {
      await result.current.submitCompany();
    });
  }

  it("cria o utilizador com o company_id devolvido no passo 1", async () => {
    const { result } = renderHook(() => useRegisterForm());
    serviceMocks.createAdminUser.mockResolvedValueOnce({ id: "user-1" });
    await reachStepTwo(result);

    await fillUser(result);
    await act(async () => {
      await result.current.submitAdminUser();
    });

    expect(serviceMocks.createAdminUser).toHaveBeenCalledWith(
      expect.objectContaining({
        first_name: "Ana",
        last_name: "Silva",
        email: "ana@kianda.ao",
        phone_number: "923111222",
        bi_number: "000000000LA000",
        company_id: "uuid-1",
        role: "Administrator",
        status: "active",
      }),
    );
    expect(result.current.succeeded).toBe(true);
    expect(toastMocks.success).toHaveBeenCalledWith("Conta criada com sucesso", expect.anything());
  });

  it("exige o passo 1 antes de submeter o utilizador", async () => {
    const { result } = renderHook(() => useRegisterForm());

    await act(async () => {
      await result.current.submitAdminUser();
    });

    expect(serviceMocks.createAdminUser).not.toHaveBeenCalled();
    expect(result.current.step).toBe(1);
    expect(result.current.globalError?.title).toBe("Empresa em falta");
  });

  it("mantém a empresa criada quando o utilizador falha e explica como repetir", async () => {
    const { result } = renderHook(() => useRegisterForm());
    await reachStepTwo(result);

    serviceMocks.createAdminUser.mockRejectedValueOnce(
      httpError(422, validationErrorBody({ email: ["O email já está em uso."] })),
    );
    await fillUser(result);
    await act(async () => {
      await result.current.submitAdminUser();
    });

    expect(result.current.userErrors.email).toBe("O email já está em uso.");
    expect(result.current.createdCompany?.id).toBe("uuid-1");
    expect(result.current.companyLocked).toBe(true);
    expect(result.current.globalError?.message).toContain("já está criada");
    expect(result.current.succeeded).toBe(false);
    expect(toastMocks.error).not.toHaveBeenCalled();
  });

  it("permite voltar ao passo 1 e regressar ao passo 2", async () => {
    const { result } = renderHook(() => useRegisterForm());
    await reachStepTwo(result);

    await act(async () => result.current.goToCompanyStep());
    expect(result.current.step).toBe(1);

    await act(async () => result.current.goToUserStep());
    expect(result.current.step).toBe(2);
  });
});
