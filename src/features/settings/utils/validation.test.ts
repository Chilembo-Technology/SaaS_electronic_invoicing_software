import { describe, expect, it } from 'vitest';

import {
  hasAnyError,
  validateCompanyFields,
  validateEditUserFields,
  validateLogoFile,
  validatePasswordFields,
  validateProfileFields,
} from './validation';

const COMPANY = {
  company_name: 'Acme Lda',
  tax_number: '5000000000',
  admin_email: 'a@b.ao',
  phone: '923456789',
  phone_number_alternative: '',
  address: '',
  city: '',
  province: '',
  country: 'AO',
  agt_certificate_number: '',
  bank_id: '',
  account_number: '',
  holder: '',
  iban: '',
};

describe('validateCompanyFields', () => {
  it('aceita valores válidos', () => {
    expect(validateCompanyFields(COMPANY)).toEqual({});
  });

  it('exige nome e NIF', () => {
    const errors = validateCompanyFields({ ...COMPANY, company_name: '', tax_number: '' });
    expect(errors.company_name).toBeTruthy();
    expect(errors.tax_number).toBeTruthy();
  });

  it('valida email e telefone', () => {
    const errors = validateCompanyFields({ ...COMPANY, admin_email: 'invalido', phone: '123' });
    expect(errors.admin_email).toBeTruthy();
    expect(errors.phone).toBeTruthy();
  });

  it('valida os dados bancários quando preenchidos', () => {
    const errors = validateCompanyFields({
      ...COMPANY,
      bank_id: 'nao-e-uuid',
      account_number: '123',
      iban: 'invalido',
    });
    expect(errors.bank_id).toBeTruthy();
    expect(errors.account_number).toBeTruthy();
    expect(errors.iban).toBeTruthy();
  });

  it('aceita dados bancários válidos', () => {
    const errors = validateCompanyFields({
      ...COMPANY,
      bank_id: '59183559-65ff-3076-b8ca-d2d03d26a42a',
      account_number: '56425593142',
      holder: 'Acme Lda',
      iban: '0005.0000.7998.9111.1019.7',
    });
    expect(errors.bank_id).toBeUndefined();
    expect(errors.account_number).toBeUndefined();
    expect(errors.iban).toBeUndefined();
  });
});

describe('validateProfileFields', () => {
  const base = {
    first_name: 'Ana',
    last_name: 'Silva',
    email: 'a@b.ao',
    phone_number: '923456789',
    bi_number: '',
  };

  it('aceita valores válidos', () => {
    expect(validateProfileFields(base)).toEqual({});
  });

  it('rejeita um BI inválido', () => {
    expect(validateProfileFields({ ...base, bi_number: 'abc' }).bi_number).toBeTruthy();
  });
});

describe('validatePasswordFields', () => {
  it('exige mínimo de 8 e confirmação igual', () => {
    const errors = validatePasswordFields({ password: '123', confirmPassword: '456' });
    expect(errors.password).toBeTruthy();
    expect(errors.confirmPassword).toBeTruthy();
  });

  it('aceita quando válido', () => {
    expect(validatePasswordFields({ password: 'segredo1', confirmPassword: 'segredo1' })).toEqual({});
  });
});

describe('validateEditUserFields', () => {
  it('a palavra-passe é opcional na edição', () => {
    const errors = validateEditUserFields({
      first_name: 'Ana',
      last_name: 'Silva',
      email: 'a@b.ao',
      phone_number: '923456789',
      bi_number: '',
      status: 'active',
      password: '',
    });
    expect(hasAnyError(errors)).toBe(false);
  });
});

describe('validateLogoFile', () => {
  it('rejeita extensões não permitidas', () => {
    expect(validateLogoFile(new File(['a'], 'virus.exe'))).toBeTruthy();
  });

  it('aceita um PNG pequeno', () => {
    expect(validateLogoFile(new File(['a'], 'logo.png', { type: 'image/png' }))).toBeUndefined();
  });
});
