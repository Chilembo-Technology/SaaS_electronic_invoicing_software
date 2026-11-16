import { describe, expect, it } from 'vitest';
import { RETENTION_TYPES } from '../constants';
import { validateRetention } from './retention';

describe('validateRetention', () => {
  it('sem retenção não exige tipo nem descrição', () => {
    expect(validateRetention({ amount: 0, type: '', description: '' })).toBeNull();
  });

  it('com retenção o tipo é obrigatório', () => {
    expect(validateRetention({ amount: 10, type: '', description: '' })).toBe(
      'Indique o tipo de retenção.',
    );
  });

  it('no Imposto do Selo a descrição (código da verba) é obrigatória', () => {
    expect(validateRetention({ amount: 10, type: 'IS', description: '  ' })).toBe(
      'Na retenção de Imposto do Selo indique o código da verba na descrição.',
    );
    expect(validateRetention({ amount: 10, type: 'IS', description: 'Verba 23.3' })).toBeNull();
  });

  it('nos outros tipos a descrição é opcional', () => {
    expect(validateRetention({ amount: 10, type: 'II', description: '' })).toBeNull();
  });

  it('a descrição tem no máximo 60 caracteres', () => {
    expect(validateRetention({ amount: 10, type: 'II', description: 'a'.repeat(60) })).toBeNull();
    expect(validateRetention({ amount: 10, type: 'II', description: 'a'.repeat(61) })).toBe(
      'A descrição da retenção não pode exceder 60 caracteres.',
    );
  });

  it('oferece exactamente os tipos do Decreto 317/20', () => {
    expect(RETENTION_TYPES.map((option) => option.value)).toEqual([
      'IRT', 'II', 'IS', 'IVA', 'IPU', 'IAC', 'OU',
    ]);
  });
});
