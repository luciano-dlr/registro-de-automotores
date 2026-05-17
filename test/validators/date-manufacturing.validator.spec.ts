import {
  validateManufacturingDate,
  isManufacturingDateValid,
} from '../../src/common/validators/date-manufacturing.validator';

describe('FechaFabricacionValidator', () => {
  describe('validateManufacturingDate', () => {
    describe('Fechas válidas', () => {
      it('debe aceptar fecha válida 202301 (enero 2023)', () => {
        const resultado = validateManufacturingDate(202301);
        expect(resultado.valido).toBe(true);
        expect(resultado.mensaje).toBeUndefined();
      });

      it('debe aceptar fecha con string numérico', () => {
        const resultado = validateManufacturingDate('202301');
        expect(resultado.valido).toBe(true);
      });

      it('debe aceptar fecha de año actual', () => {
        const anioActual = new Date().getFullYear();
        const fechaActual = anioActual * 100 + 1;
        const resultado = validateManufacturingDate(fechaActual);
        expect(resultado.valido).toBe(true);
      });

      it('debe rechazar fecha de año próximo (año futuro no permitido)', () => {
        const anioProximo = new Date().getFullYear() + 1;
        const mesActual = new Date().getMonth() + 1;
        const fechaProxima = anioProximo * 100 + mesActual;

        if (mesActual <= 12) {
          const resultado = validateManufacturingDate(fechaProxima);
          expect(resultado.valido).toBe(false);
          expect(resultado.mensaje).toBe(
            'La fecha de fabricación no puede ser futura',
          );
        }
      });
    });

    describe('Fechas inválidas por formato', () => {
      it('debe rechazar mes 13 (202313)', () => {
        const resultado = validateManufacturingDate(202313);
        expect(resultado.valido).toBe(false);
        expect(resultado.mensaje).toBe('El mes debe estar entre 01 y 12');
      });

      it('debe rechazar mes 00', () => {
        const resultado = validateManufacturingDate(202300);
        expect(resultado.valido).toBe(false);
        expect(resultado.mensaje).toBe('El mes debe estar entre 01 y 12');
      });

      it('debe rechazar más de 6 dígitos', () => {
        const resultado = validateManufacturingDate(2023012);
        expect(resultado.valido).toBe(false);
        expect(resultado.mensaje).toBe(
          'La fecha de fabricación debe tener formato YYYYMM (6 dígitos)',
        );
      });

      it('debe rechazar menos de 6 dígitos', () => {
        const resultado = validateManufacturingDate(20230);
        expect(resultado.valido).toBe(false);
        expect(resultado.mensaje).toBe(
          'La fecha de fabricación debe tener formato YYYYMM (6 dígitos)',
        );
      });

      it('debe rechazar valores no numéricos', () => {
        const resultado = validateManufacturingDate('abcde' as any);
        expect(resultado.valido).toBe(false);
        expect(resultado.mensaje).toBe(
          'La fecha de fabricación debe tener formato YYYYMM (6 dígitos)',
        );
      });
    });

    describe('Fechas inválidas por ser futuras', () => {
      it('debe rechazar año muy futuro (año > actual + 1)', () => {
        const anioFuturo = new Date().getFullYear() + 5;
        const resultado = validateManufacturingDate(anioFuturo * 100 + 1);
        expect(resultado.valido).toBe(false);
        expect(resultado.mensaje).toBe(
          'La fecha de fabricación no puede ser futura',
        );
      });

      it('debe rechazar año próximo con mes futuro', () => {
        const anioProximo = new Date().getFullYear() + 1;
        const mesFuturo = new Date().getMonth() + 1 + 3;
        if (mesFuturo <= 12) {
          const resultado = validateManufacturingDate(
            anioProximo * 100 + mesFuturo,
          );
          expect(resultado.valido).toBe(false);
          expect(resultado.mensaje).toBe(
            'La fecha de fabricación no puede ser futura',
          );
        }
      });
    });

    describe('Casos edge', () => {
      it('debe rechazar null', () => {
        const resultado = validateManufacturingDate(null as any);
        expect(resultado.valido).toBe(false);
      });

      it('debe rechazar undefined', () => {
        const resultado = validateManufacturingDate(undefined as any);
        expect(resultado.valido).toBe(false);
      });

      it('debe rechazar número muy pequeño', () => {
        const resultado = validateManufacturingDate(1);
        expect(resultado.valido).toBe(false);
      });

      it('debe rechazar número muy grande', () => {
        const resultado = validateManufacturingDate(99999999);
        expect(resultado.valido).toBe(false);
      });
    });
  });

  describe('isManufacturingDateValid (versión booleana)', () => {
    it('debe retornar true para fecha válida', () => {
      expect(isManufacturingDateValid(202301)).toBe(true);
    });

    it('debe retornar false para fecha inválida', () => {
      expect(isManufacturingDateValid(202313)).toBe(false);
    });
  });
});
