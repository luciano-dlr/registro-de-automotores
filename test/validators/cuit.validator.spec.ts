import { validarCuit } from '../../src/common/validators/cuit.validator';

describe('CuitValidator', () => {
  describe('validarCuit', () => {
    describe('CUITs válidos', () => {
      it('debe aceptar CUIT válido 27123456780', () => {
        expect(validarCuit('27123456780')).toBe(true);
      });

      it('debe aceptar CUIT válido 20000000001', () => {
        expect(validarCuit('20000000001')).toBe(true);
      });

      it('debe aceptar CUIT válido 27000000006', () => {
        expect(validarCuit('27000000006')).toBe(true);
      });

      it('debe aceptar CUIT con guiones (los elimina)', () => {
        expect(validarCuit('27-12345678-0')).toBe(true);
      });

      it('debe aceptar CUIT con espacios', () => {
        expect(validarCuit('20 00000000 1')).toBe(true);
      });
    });

    describe('CUITs inválidos', () => {
      it('debe rechazar CUIT con dígito verificador incorrecto', () => {
        expect(validarCuit('27123456781')).toBe(false);
      });

      it('debe rechazar CUIT con 10 dígitos (falta uno)', () => {
        expect(validarCuit('2034567890')).toBe(false);
      });

      it('debe rechazar CUIT con 12 dígitos (sobra uno)', () => {
        expect(validarCuit('203456789050')).toBe(false);
      });

      it('debe rechazar CUIT con letras', () => {
        expect(validarCuit('20A45678905')).toBe(false);
      });

      it('debe rechazar CUIT vacío', () => {
        expect(validarCuit('')).toBe(false);
      });

      it('debe rechazar CUIT null', () => {
        expect(validarCuit(null as any)).toBe(false);
      });

      it('debe rechazar CUIT undefined', () => {
        expect(validarCuit(undefined as any)).toBe(false);
      });

      it('debe rechazar CUIT con solo ceros', () => {
        expect(validarCuit('00000000000')).toBe(false);
      });

      it('debe rechazar CUIT con primer dígito inválido (no 20, 23, 24, 27, 30, 34)', () => {
        expect(validarCuit('10345678905')).toBe(false);
        expect(validarCuit('50345678905')).toBe(false);
      });
    });

    describe('Casos edge', () => {
      it('debe aceptar CUIT con leading zeros en base', () => {
        expect(validarCuit('20000000001')).toBe(true);
      });

      it('debe manejar strings con caracteres especiales', () => {
        expect(validarCuit('$20345678905%')).toBe(false);
      });
    });
  });
});
