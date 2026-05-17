import { validateDomain } from '../../src/common/validators/domain.validator';

describe('DominioValidator', () => {
  describe('validateDomain', () => {
    it('debe aceptar formato AAA999 (tres letras + tres dígitos)', () => {
      expect(validateDomain('ABC123')).toBe(true);
      expect(validateDomain('aaa123')).toBe(true);
      expect(validateDomain('XYZ999')).toBe(true);
    });

    it('debe aceptar formato AA999AA (dos letras + tres dígitos + dos letras)', () => {
      expect(validateDomain('AB123CD')).toBe(true);
      expect(validateDomain('ab123cd')).toBe(true);
      expect(validateDomain('XY987ZW')).toBe(true);
    });

    it('debe aceptar dominio con letras minúsculas (se convierte a mayúsculas)', () => {
      expect(validateDomain('abc123')).toBe(true);
    });

    it('debe rechazar formato inválido (mezcla incorrecta)', () => {
      expect(validateDomain('AB12C3')).toBe(false);
      expect(validateDomain('123ABC')).toBe(false);
    });

    it('debe rechazar valores vacíos o inválidos', () => {
      expect(validateDomain('')).toBe(false);
      expect(validateDomain(null as any)).toBe(false);
      expect(validateDomain(undefined as any)).toBe(false);
    });

    it('debe rechazar dominios con longitud incorrecta', () => {
      expect(validateDomain('AB123')).toBe(false);
      expect(validateDomain('AB12345')).toBe(false);
      expect(validateDomain('ABCD1234')).toBe(false);
    });

    it('debe rechazar dominios con caracteres no permitidos', () => {
      expect(validateDomain('ABC-123')).toBe(false);
      expect(validateDomain('AB#123CD')).toBe(false);
      expect(validateDomain('ABC 123')).toBe(false);
    });
  });
});
