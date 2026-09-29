import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

/**
 * Teste de integração da página de registo: passos, erros inline com as
 * mensagens do Laravel, banner de erro global e confirmação final.
 * Os serviços são substituídos por espiões — nenhum pedido HTTP é feito.
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

import { RegisterPage } from "./RegisterPage";
import { httpError, validationErrorBody } from "../../../test/helpers";

function renderPage(url = "/registar") {
  const utils = render(
    <MemoryRouter initialEntries={[url]}>
      <RegisterPage />
    </MemoryRouter>,
  );

  return { ...utils, form: () => utils.container.querySelector("form") as HTMLFormElement };
}

/** Campos do passo 1 (os labels obrigatórios incluem o asterisco do `required`). */
const COMPANY_FIELDS_FIXTURE: [RegExp, string][] = [
  [/Nome da empresa/, "Kianda Logística, Lda"],
  [/NIF da empresa/, "541789632LA045"],
  [/Email do administrador/, "admin@kianda.ao"],
  [/Telefone da empresa/, "923000000"],
];

/** Campos do passo 2 (utilizador administrador). */
const USER_FIELDS_FIXTURE: [RegExp, string][] = [
  [/^Nome/, "Ana"],
  [/Sobrenome/, "Silva"],
  [/Email de acesso/, "ana@kianda.ao"],
  [/^Telefone/, "923111222"],
  [/Número de BI/, "000000000LA000"],
  [/^Senha/, "segredo123"],
  [/Confirmar senha/, "segredo123"],
];

/** Preenche um campo pelo respectivo label (inputs controlados). */
function fill(label: string | RegExp, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

function fillFields(fields: [RegExp, string][]) {
  fields.forEach(([label, value]) => fill(label, value));
}

function submitForm() {
  fireEvent.submit(document.querySelector("form") as HTMLFormElement);
}

/** Preenche e submete o passo 1, aguardando a passagem para o passo 2. */
async function submitValidCompany() {
  serviceMocks.createCompany.mockResolvedValueOnce({
    id: "uuid-1",
    company_name: "Kianda Logística, Lda",
  });

  fillFields(COMPANY_FIELDS_FIXTURE);
  submitForm();

  // "Utilizador administrador" também existe no stepper — o subtítulo confirma o passo 2.
  await screen.findByText(/Passo 2 de 2/);
}

function fillValidUser() {
  fillFields(USER_FIELDS_FIXTURE);
  fireEvent.click(screen.getByLabelText(/aceito os Termos e Condições/i));
}

describe("RegisterPage — passo 1 (empresa)", () => {
  it("apresenta o passo 1 e o indicador de progresso", () => {
    renderPage();

    expect(screen.getByText("Criar conta da empresa")).toBeInTheDocument();
    expect(screen.getByText("Passo 1 de 2 · dados fiscais e de contacto")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Criar empresa e continuar/ })).toBeInTheDocument();
    expect(screen.getByText("Empresa")).toBeInTheDocument();
    expect(screen.getByText("Utilizador administrador")).toBeInTheDocument();
  });

  it("valida no cliente antes de chamar a API", () => {
    renderPage();

    fireEvent.submit(document.querySelector("form") as HTMLFormElement);

    expect(serviceMocks.createCompany).not.toHaveBeenCalled();
    expect(screen.getByText("O nome da empresa é obrigatório.")).toBeInTheDocument();
    expect(screen.getByText("O número de imposto é obrigatório.")).toBeInTheDocument();
    expect(screen.getByText("Dados incompletos")).toBeInTheDocument();
  });

  it("mostra a mensagem do backend (422) junto ao campo", async () => {
    serviceMocks.createCompany.mockRejectedValueOnce(
      httpError(422, validationErrorBody({ admin_email: ["O email do administrador já está em uso."] })),
    );

    renderPage();
    fillFields(COMPANY_FIELDS_FIXTURE);
    submitForm();

    expect(await screen.findByText("O email do administrador já está em uso.")).toBeInTheDocument();
    expect(screen.getByText("Não foi possível criar a empresa")).toBeInTheDocument();
    expect(screen.getByLabelText(/Email do administrador/)).toHaveAttribute("aria-invalid", "true");
    expect(toastMocks.error).not.toHaveBeenCalled();
  });

  it("mostra toast de erro e banner em falha de servidor", async () => {
    serviceMocks.createCompany.mockRejectedValueOnce(httpError(500, {}));

    renderPage();
    fillFields(COMPANY_FIELDS_FIXTURE);
    submitForm();

    expect(
      await screen.findByText("Não foi possível concluir o registo. Tente novamente dentro de instantes."),
    ).toBeInTheDocument();
    expect(toastMocks.error).toHaveBeenCalledWith(
      "Não foi possível concluir o registo. Tente novamente dentro de instantes.",
    );
  });
});

describe("RegisterPage — passo 2 e confirmação", () => {
  it("cria o utilizador administrador e confirma a conta", async () => {
    serviceMocks.createAdminUser.mockResolvedValueOnce({ id: "user-1" });
    renderPage();
    await submitValidCompany();
    expect(serviceMocks.createCompany).toHaveBeenCalledTimes(1);

    fillValidUser();
    fireEvent.submit(document.querySelector("form") as HTMLFormElement);

    expect(await screen.findByText("Conta criada com sucesso")).toBeInTheDocument();
    expect(screen.getByText(/Kianda Logística, Lda/)).toBeInTheDocument();
    expect(screen.getByText(/ana@kianda.ao/)).toBeInTheDocument();
    expect(screen.getByText(/A redirecionar para o login em 5 segundos/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Entrar agora/ })).toHaveAttribute("href", "/login");

    expect(serviceMocks.createAdminUser).toHaveBeenCalledWith(
      expect.objectContaining({
        company_id: "uuid-1",
        role: "Administrator",
        status: "active",
        email: "ana@kianda.ao",
      }),
    );
    expect(toastMocks.success).toHaveBeenCalledWith("Conta criada com sucesso", expect.anything());
  });

  it("mostra os erros do passo 2 junto aos campos e explica que a empresa já existe", async () => {
    serviceMocks.createAdminUser.mockRejectedValueOnce(
      httpError(
        422,
        validationErrorBody({
          email: ["O email já está em uso."],
          phone_number: ["O número de telefone já está em uso."],
        }),
      ),
    );

    renderPage();
    await submitValidCompany();
    fillValidUser();
    fireEvent.submit(document.querySelector("form") as HTMLFormElement);

    expect(await screen.findByText("O email já está em uso.")).toBeInTheDocument();
    expect(screen.getByText("O número de telefone já está em uso.")).toBeInTheDocument();
    expect(screen.getByText(/já está criada/)).toBeInTheDocument();
    expect(screen.getByText(/Passo 2 de 2/)).toBeInTheDocument();
    expect(screen.queryByText("Conta criada com sucesso")).not.toBeInTheDocument();
  });

  it("permite voltar do passo 2 para o passo 1 (sem recriar a empresa)", async () => {
    renderPage();
    await submitValidCompany();

    fireEvent.click(screen.getByRole("button", { name: /Voltar/ }));

    expect(await screen.findByText("Passo 1 de 2 · dados fiscais e de contacto")).toBeInTheDocument();
    expect(serviceMocks.createCompany).toHaveBeenCalledTimes(1);
  });

  it("apresenta o plano escolhido na Landing Page (?plano=)", () => {
    renderPage("/registar?plano=empresa");

    expect(screen.getByText(/Plano/)).toBeInTheDocument();
    expect(screen.getByText("Empresa (pré-pago)")).toBeInTheDocument();
  });
});
