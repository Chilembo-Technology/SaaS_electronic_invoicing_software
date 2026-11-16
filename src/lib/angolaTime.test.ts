import { describe, expect, it } from 'vitest';
import { todayInAngola } from './angolaTime';

describe('todayInAngola', () => {
  it('usa o dia de Luanda: às 23h30 UTC já é o dia seguinte', () => {
    expect(todayInAngola(new Date('2026-11-16T23:30:00Z'))).toBe('2026-11-17');
  });

  it('antes das 23h00 UTC é o mesmo dia', () => {
    expect(todayInAngola(new Date('2026-11-16T22:59:59Z'))).toBe('2026-11-16');
  });

  it('muda de ano à meia-noite de Luanda (23h00 UTC de 31/12)', () => {
    expect(todayInAngola(new Date('2026-12-31T23:00:00Z'))).toBe('2027-01-01');
  });
});
