/**
 * Auxiliares de estado de formulário usados pelos hooks do login.
 *
 * Replicam os privados do `useRegisterForm` (que não é alterado por este
 * trabalho): marcar todos os campos como "tocados" e dar foco ao primeiro
 * campo inválido — o `id` do DOM é igual ao nome do campo (ver `FormField`).
 */

export type TouchedMap<T extends string> = Partial<Record<T, boolean>>;

/** Dá foco ao primeiro campo inválido. */
export function focusField(field: string): void {
  if (typeof document === 'undefined') return;

  const element = document.getElementById(field);
  if (element instanceof HTMLElement) {
    element.focus();
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

/** Constrói o mapa de "tocado" com todos os campos do formulário. */
export function markAllTouched<T extends string>(fields: readonly T[]): TouchedMap<T> {
  return fields.reduce<TouchedMap<T>>((acc, field) => {
    acc[field] = true;
    return acc;
  }, {});
}
