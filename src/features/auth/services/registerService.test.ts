import { describe, expect, it, vi } from "vitest";

import type { CompanyFormValues } from "../types/register";

/**
 * Testes do serviço de registo — o ÚNICO ponto do fluxo que fala HTTP.
 * As instâncias do axios (`src/lib/api.ts`) são substituídas por espiões, para
 * verificar rotas, payloads e o cabeçalho de multipart do logotipo.
 */

const { mocks } = vi.hoisted(() => ({
  mocks: {
    orgPost: vi.fn(),
    authPost: vi.fn(),
  },
}));

vi.mock("../../../lib/api", () => ({
  authApi: { post: mocks.authPost },
  orgApi: { post: mocks.orgPost },
}));

import { registerService, toAdminUserPayload, toCompanyPayload } from "./registerService";
import { emptyAdminUserValues, emptyCompanyValues } from "../types/register";

const companyValues: CompanyFormValues = {
  ...emptyCompanyValues,
  companyName: "  Kianda Logística, Lda  ",
  taxNumber: "541789632la045",
  adminEmail: "  Admin@Kianda.AO ",
  phone: "+244 923 000 000",
  address: "  Rua 1  ",
  city: "Luanda",
  province: "",
  agtCertificateNumber: "AGT-001",
};

describe("toCompanyPayload", () => {
  it("normaliza os campos e omite os opcionais vazios", () => {
    expect(toCompanyPayload({ ...companyValues, province: "", agtCertificateNumber: "" })).toEqual({
      company_name: "Kianda Logística, Lda",
      tax_number: "541789632LA045",
      admin_email: "admin@kianda.ao",
      phone: "923000000",
      address: "Rua 1",
      city: "Luanda",
    });
  });

  it("inclui os opcionais quando preenchidos", () => {
    expect(toCompanyPayload(companyValues)).toEqual({
      company_name: "Kianda Logística, Lda",
      tax_number: "541789632LA045",
      admin_email: "admin@kianda.ao",
      phone: "923000000",
      address: "Rua 1",
      city: "Luanda",
      agt_certificate_number: "AGT-001",
    });
  });
});

describe("toAdminUserPayload", () => {
  it("envia o onboarding_token (a empresa e a role vêm do token, não do pedido)", () => {
    const payload = toAdminUserPayload(
      {
        ...emptyAdminUserValues,
        firstName: "  Ana ",
        lastName: " Silva  ",
        email: "  Ana@Kianda.AO ",
        phoneNumber: "923 111 222",
        biNumber: "000000000la000",
        password: "segredo123",
      },
      "token-de-onboarding",
    );

    expect(payload).toEqual({
      onboarding_token: "token-de-onboarding",
      first_name: "Ana",
      last_name: "Silva",
      email: "ana@kianda.ao",
      password: "segredo123",
      phone_number: "923111222",
      bi_number: "000000000LA000",
    });
  });
});

describe("registerService.createCompany", () => {
  it("envia JSON quando não há logotipo e devolve a empresa criada", async () => {
    mocks.orgPost.mockResolvedValueOnce({
      data: {
        success: true,
        data: { id: "uuid-1", company_name: "Kianda Logística, Lda" },
        onboarding_token: "token-1",
      },
    });

    const company = await registerService.createCompany(toCompanyPayload(companyValues));

    expect(mocks.orgPost).toHaveBeenCalledTimes(1);
    const [path, body, config] = mocks.orgPost.mock.calls[0];
    expect(path).toBe("/v1/company/store");
    expect(body).toEqual(toCompanyPayload(companyValues));
    expect(config).toBeUndefined();
    expect(company.id).toBe("uuid-1");
    expect(company.onboarding_token).toBe("token-1");
  });

  it("envia multipart/form-data quando existe logotipo", async () => {
    mocks.orgPost.mockResolvedValueOnce({ data: { success: true, data: { id: "uuid-2" }, onboarding_token: "token-2" } });
    const logo = new File(["conteudo"], "logo.png", { type: "image/png" });

    await registerService.createCompany(toCompanyPayload(companyValues), logo);

    const [path, body, config] = mocks.orgPost.mock.calls[0];
    expect(path).toBe("/v1/company/store");
    expect(body).toBeInstanceOf(FormData);

    const formData = body as FormData;
    expect(formData.get("company_name")).toBe("Kianda Logística, Lda");
    expect(formData.get("tax_number")).toBe("541789632LA045");
    expect(formData.get("admin_email")).toBe("admin@kianda.ao");
    expect((formData.get("logo") as File).name).toBe("logo.png");
    // Sem este cabeçalho o axios converteria o FormData em JSON e perderia o ficheiro.
    expect(config).toEqual({ headers: { "Content-Type": "multipart/form-data" } });
  });

  it("falha quando a API não devolve o identificador da empresa", async () => {
    mocks.orgPost.mockResolvedValueOnce({ data: { success: true, data: {} } });

    await expect(registerService.createCompany(toCompanyPayload(companyValues))).rejects.toThrow(
      /não devolveu o identificador/i,
    );
  });

  it("falha quando a API não devolve o token de onboarding", async () => {
    mocks.orgPost.mockResolvedValueOnce({ data: { success: true, data: { id: "uuid-3" } } });

    await expect(registerService.createCompany(toCompanyPayload(companyValues))).rejects.toThrow(
      /token de onboarding/i,
    );
  });
});

describe("registerService.createAdminUser", () => {
  it("cria o administrador em /v1/onboarding/admin com o token e devolve a resposta", async () => {
    mocks.authPost.mockResolvedValueOnce({
      data: { success: true, data: { id: "user-1", email: "ana@kianda.ao" } },
    });

    const user = await registerService.createAdminUser(
      toAdminUserPayload({ ...emptyAdminUserValues, email: "ana@kianda.ao" }, "token-1"),
    );

    expect(mocks.authPost).toHaveBeenCalledWith(
      "/v1/onboarding/admin",
      expect.objectContaining({ onboarding_token: "token-1" }),
    );
    expect(mocks.authPost.mock.calls[0][1]).not.toHaveProperty("company_id");
    expect(mocks.authPost.mock.calls[0][1]).not.toHaveProperty("role");
    expect(user.id).toBe("user-1");
  });
});
