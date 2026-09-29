import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FormField } from "./FormField";

/**
 * Testes do campo genérico reutilizado por todos os formulários:
 * estados vermelho (erro), verde (válido) e "a validar".
 */

const renderField = (props: Partial<ComponentProps<typeof FormField>> = {}) =>
  render(<FormField id="companyName" label="Nome da empresa" value="" onChange={vi.fn()} {...props} />);

describe("FormField", () => {
  it("liga a etiqueta ao input e marca os campos obrigatórios", () => {
    renderField({ required: true });

    const input = screen.getByLabelText(/Nome da empresa/);
    expect(input).toHaveAttribute("id", "companyName");
    expect(input).toHaveAttribute("aria-required", "true");
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("mostra o texto de apoio quando não há erro", () => {
    renderField({ hint: "Como consta no certificado da AGT." });

    expect(screen.getByText("Como consta no certificado da AGT.")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("em erro: mensagem inline, borda vermelha, ícone de alerta e aria-invalid", () => {
    const { container } = renderField({ error: "O nome da empresa é obrigatório." });

    const input = screen.getByLabelText(/Nome da empresa/);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "companyName-error");
    expect(input.className).toContain("border-destructive");

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("O nome da empresa é obrigatório.");
    expect(container.querySelector("svg.text-destructive")).toBeTruthy();
    // mensagem de erro substitui a dica
    expect(screen.queryByText(/Como consta/)).not.toBeInTheDocument();
  });

  it("em estado válido: borda verde e ícone de confirmação", () => {
    const { container } = renderField({ value: "Kianda Logística, Lda", showValid: true });

    const input = screen.getByLabelText(/Nome da empresa/);
    expect(input.className).toContain("border-brand-green");
    expect(input).not.toHaveAttribute("aria-invalid", "true");
    expect(container.querySelector("svg.text-brand-green")).toBeTruthy();
    expect(container.querySelector("svg.text-destructive")).toBeFalsy();
  });

  it("durante a submissão mostra o estado «A validar…» com spinner", () => {
    const { container } = renderField({ value: "Kianda", validating: true });

    expect(screen.getByText("A validar…")).toBeInTheDocument();
    expect(screen.getByLabelText(/Nome da empresa/)).toHaveAttribute("aria-busy", "true");
    expect(container.querySelector("svg.animate-spin")).toBeTruthy();
  });

  it("propaga onChange e onBlur", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onBlur = vi.fn();

    renderField({ onChange, onBlur });

    const input = screen.getByLabelText(/Nome da empresa/);
    await user.type(input, "Kianda");

    // Campo controlado: cada tecla dispara onChange com o valor do DOM no momento.
    expect(onChange).toHaveBeenCalledTimes(6);
    expect(
      onChange.mock.calls
        .map(([value]) => value)
        .join(""),
    ).toBe("Kianda");

    await user.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("permite revelar e ocultar a senha", async () => {
    const user = userEvent.setup();
    render(<FormField id="password" label="Senha" type="password" value="segredo123" onChange={vi.fn()} />);

    const input = screen.getByLabelText("Senha");
    expect(input).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Mostrar senha" }));
    expect(screen.getByLabelText("Senha")).toHaveAttribute("type", "text");

    await user.click(screen.getByRole("button", { name: "Ocultar senha" }));
    expect(screen.getByLabelText("Senha")).toHaveAttribute("type", "password");
  });

  it("respeita o estado desactivado", () => {
    renderField({ disabled: true, value: "Kianda" });

    expect(screen.getByLabelText(/Nome da empresa/)).toBeDisabled();
  });
});
