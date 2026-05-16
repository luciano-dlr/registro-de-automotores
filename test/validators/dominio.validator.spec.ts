import { validarDominio } from '../../src/common/validators/dominio.validator';

describe('DominioValidator', () => {
  describe('validarDominio', () => {
    it('debe aceptar formato AAA999 (tres letras + tres dígitos)', () => {
      expect(validarDominio('ABC123')).toBe(true);
      expect(validarDominio('aaa123')).toBe(true); // también acepta minúsculas
      expect(validarDominio('XYZ999')).toBe(true);
    });

    it('debe aceptar formato AA999AA (dos letras + tres dígitos + dos letras)', () => {
      expect(validarDominio('AB123CD')).toBe(true);
      expect(validarDominio('ab123cd')).toBe(true); // también acepta minúsculas
      expect(validarDominio('XY987ZW')).toBe(true);
    });

    it('debe aceptar dominio con letras minúsculas (se convierte a mayúsculas)', () => {
      // La función convierte a mayúsculas con toUpperCase()
      expect(validarDominio('abc123')).toBe(true);
    });

    it('debe rechazar formato inválido (mezcla incorrecta)', () => {
      expect(validarDominio('AB12C3')).toBe(false); // 2 dígitos en medio
      expect(validarDominio('123ABC')).toBe(false); //Empieza con números
    });

    it('debe rechazar valores vacíos o inválidos', () => {
      expect(validarDominio('')).toBe(false);
      expect(validarDominio(null as any)).toBe(false);
      expect(validarDominio(undefined as any)).toBe(false);
    });

    it('debe rechazar dominios con longitud incorrecta', () => {
      expect(validarDominio('AB123')).toBe(false); // muy corto
      expect(validarDominio('AB12345')).toBe(false); // muy largo
      expect(validarDominio('ABCD1234')).toBe(false);
    });

    it('debe rechazar dominios con caracteres no permitidos', () => {
      expect(validarDominio('ABC-123')).toBe(false);
      expect(validarDominio('AB#123CD')).toBe(false);
      expect(validarDominio('ABC 123')).toBe(false);
    });
  });
});
