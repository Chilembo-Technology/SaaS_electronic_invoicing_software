import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { CompanyStepForm, type CompanyStepFormProps } from "./CompanyStepForm";
import { emptyCompanyValues } from "../types/register";
import { MESSAGES } from "../utils/registerValidation";

/** Passo 1 do registo: campos, estados visuais e bloqueio após criar a empresa. */
function renderForm(overrides: Partial<CompanyStepFormProps> = {}) {
  const props: CompanyStepFormProps = {
    values: emptyCompanyValues,
    errors: {},
    submitting: false,
    locked: false,
    onSubmit: vi.fn(),
    onContinue: vi.fn(),
    onChange: vi.fn(),
    onBlur: vi.fn(),
    isValid: () => false,
    ...overrides,
  };

  const utils = render(<CompanyStepForm {...props} />);
  return { ...utils, props };
}

describe("CompanyStepForm", () => {
  it("apresenta todos os campos do StoreCompanyRequest", () => {
    const { container } = renderForm();

    [
      /Nome da empresa/,
      /NIF da empresa/,
      /Email do administrador/,
      /Telefone da empresa/,
      /Endereço/,
      /Cidade/,
      /Província/,
      /Nº do certificado AGT/,
    ].forEach((label) => expect(screen.getByText(label)).toBeInTheDocument());

    expect(container.querySelector("#logo")).toBeInstanceOf(HTMLInputElement);
    expect(screen.getByRole("button", { name: /Criar empresa e continuar/ })).toBeInTheDocument();
  });

  it("mostra o erro do backend por campo (borda vermelha + mensagem inline)", () => {
    renderForm({
      values: { ...emptyCompanyValues, adminEmail: "email-repetido@empresa.ao" },
      errors: { adminEmail: "O email do administrador já está em uso." },
    });

    const input = screen.getByLabelText(/Email do administrador/);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input.className).toContain("border-destructive");
    expect(screen.getByRole("alert")).toHaveTextContent("O email do administrador já está em uso.");
  });

  it("normaliza o NIF e o telefone antes de os entregar ao estado", () => {
    const onChange = vi.fn();
    renderForm({ onChange });

    fireEvent.change(screen.getByLabelText(/NIF da empresa/), { target: { value: "541789632la045" } });
    expect(onChange).toHaveBeenCalledWith("taxNumber", "541789632LA045");

    fireEvent.change(screen.getByLabelText(/Telefone da empresa/), { target: { value: "+244 923 000 000" } });
    expect(onChange).toHaveBeenCalledWith("phone", "923000000");
  });

  it("valida no blur de cada campo", () => {
    const onBlur = vi.fn();
    renderForm({ onBlur });

    fireEvent.blur(screen.getByLabelText(/Nome da empresa/));
    expect(onBlur).toHaveBeenCalledWith("companyName");

    fireEvent.blur(screen.getByLabelText(/Cidade/));
    expect(onBlur).toHaveBeenCalledWith("city");
  });

  it("submete o formulário do passo 1", () => {
    const { container, props } = renderForm();

    fireEvent.submit(container.querySelector("form") as HTMLFormElement);

    expect(props.onSubmit).toHaveBeenCalledTimes(1);
  });

  it("durante a submissão mostra «A criar empresa…» e «A validar…» e desactiva o botão", () => {
    renderForm({ submitting: true });

    const button = screen.getByRole("button", { name: /A criar empresa…/ });
    expect(button).toBeDisabled();
    expect(screen.getAllByText("A validar…").length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/Nome da empresa/)).toBeDisabled();
  });

  it("com a empresa criada (locked) bloqueia os campos e deixa continuar", () => {
    const { props } = renderForm({ locked: true, values: { ...emptyCompanyValues, companyName: "Kianda" } });

    expect(screen.getByLabelText(/Nome da empresa/)).toBeDisabled();
    expect(screen.queryByRole("button", { name: /Criar empresa e continuar/ })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Continuar para o utilizador/ }));
    expect(props.onContinue).toHaveBeenCalledTimes(1);
  });

  it("entrega o logotipo escolhido e reporta a validação do backend", () => {
    const onChange = vi.fn();
    const { container } = renderForm({ onChange });

    const input = container.querySelector("#logo") as HTMLInputElement;
    const file = new File(["conteudo"], "logo.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [file] } });

    expect(onChange).toHaveBeenCalledWith("logo", file);
  });

  it("mostra o nome do logotipo escolhido e permite removê-lo", () => {
    const onChange = vi.fn();
    const file = new File(["conteudo"], "logo.png", { type: "image/png" });

    renderForm({ values: { ...emptyCompanyValues, logo: file }, onChange });

    expect(screen.getByText("logo.png")).toBeInTheDocument();
    expect(screen.getByAltText("Pré-visualização do logotipo")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Remover logotipo" }));
    expect(onChange).toHaveBeenCalledWith("logo", null);
  });

  it("mostra o erro do logotipo devolvido pelo Laravel", () => {
    renderForm({
      values: { ...emptyCompanyValues, logo: new File(["x"], "logo.exe") },
      errors: { logo: MESSAGES.logoMimes },
    });

    expect(screen.getByRole("alert")).toHaveTextContent(MESSAGES.logoMimes);
  });
});
