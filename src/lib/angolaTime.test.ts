import { describe, expect, it } from 'vitest';
import { nowInAngolaForInput, todayInAngola } from './angolaTime';

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

describe('nowInAngolaForInput', () => {
  it('devolve a hora de Luanda (UTC+1) no formato do datetime-local', () => {
    expect(nowInAngolaForInput(new Date('2026-11-17T07:30:45Z'))).toBe('2026-11-17T08:30');
  });

  it('passa para o dia seguinte depois das 23h00 UTC', () => {
    expect(nowInAngolaForInput(new Date('2026-11-16T23:05:00Z'))).toBe('2026-11-17T00:05');
  });
});
