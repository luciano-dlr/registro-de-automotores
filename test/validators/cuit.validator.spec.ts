import { validateCuit } from '../../src/common/validators/cuit.validator';

describe('CuitValidator', () => {
  describe('validateCuit', () => {
    describe('CUITs válidos', () => {
      it('debe aceptar CUIT válido 27123456780', () => {
        expect(validateCuit('27123456780')).toBe(true);
      });

      it('debe aceptar CUIT válido 20000000001', () => {
        expect(validateCuit('20000000001')).toBe(true);
      });

      it('debe aceptar CUIT válido 27000000006', () => {
        expect(validateCuit('27000000006')).toBe(true);
      });

      it('debe aceptar CUIT con guiones (los elimina)', () => {
        expect(validateCuit('27-12345678-0')).toBe(true);
      });

      it('debe aceptar CUIT con espacios', () => {
        expect(validateCuit('20 00000000 1')).toBe(true);
      });
    });

    describe('CUITs inválidos', () => {
      it('debe rechazar CUIT con dígito verificador incorrecto', () => {
        expect(validateCuit('27123456781')).toBe(false);
      });

      it('debe rechazar CUIT con 10 dígitos (falta uno)', () => {
        expect(validateCuit('2034567890')).toBe(false);
      });

      it('debe rechazar CUIT con 12 dígitos (sobra uno)', () => {
        expect(validateCuit('203456789050')).toBe(false);
      });

      it('debe rechazar CUIT con letras', () => {
        expect(validateCuit('20A45678905')).toBe(false);
      });

      it('debe rechazar CUIT vacío', () => {
        expect(validateCuit('')).toBe(false);
      });

      it('debe rechazar CUIT null', () => {
        expect(validateCuit(null as any)).toBe(false);
      });

      it('debe rechazar CUIT undefined', () => {
        expect(validateCuit(undefined as any)).toBe(false);
      });

      it('debe rechazar CUIT con solo ceros', () => {
        expect(validateCuit('00000000000')).toBe(false);
      });

      it('debe rechazar CUIT con primer dígito inválido (no 20, 23, 24, 27, 30, 34)', () => {
        expect(validateCuit('10345678905')).toBe(false);
        expect(validateCuit('50345678905')).toBe(false);
      });
    });

    describe('Casos edge', () => {
      it('debe aceptar CUIT con leading zeros en base', () => {
        expect(validateCuit('20000000001')).toBe(true);
      });

      it('debe manejar strings con caracteres especiales', () => {
        expect(validateCuit('$20345678905%')).toBe(false);
      });
    });
  });
});
