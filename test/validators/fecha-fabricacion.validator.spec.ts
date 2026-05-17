import {
  validarFechaFabricacion,
  isFechaFabricacionValida,
} from '../../src/common/validators/fecha-fabricacion.validator';

describe('FechaFabricacionValidator', () => {
  describe('validarFechaFabricacion', () => {
    describe('Fechas válidas', () => {
      it('debe aceptar fecha válida 202301 (enero 2023)', () => {
        const resultado = validarFechaFabricacion(202301);
        expect(resultado.valido).toBe(true);
        expect(resultado.mensaje).toBeUndefined();
      });

      it('debe aceptar fecha con string numérico', () => {
        const resultado = validarFechaFabricacion('202301');
        expect(resultado.valido).toBe(true);
      });

      it('debe aceptar fecha de año actual', () => {
        const anioActual = new Date().getFullYear();
        const fechaActual = anioActual * 100 + 1;
        const resultado = validarFechaFabricacion(fechaActual);
        expect(resultado.valido).toBe(true);
      });

      it('debe aceptar fecha de año próximo (con mes válido)', () => {
        const anioProximo = new Date().getFullYear() + 1;
        const mesActual = new Date().getMonth() + 1;
        const fechaProxima = anioProximo * 100 + mesActual;


        if (mesActual <= 12) {
          const resultado = validarFechaFabricacion(fechaProxima);
          expect(resultado.valido).toBe(true);
        }
      });
    });

    describe('Fechas inválidas por formato', () => {
      it('debe rechazar mes 13 (202313)', () => {
        const resultado = validarFechaFabricacion(202313);
        expect(resultado.valido).toBe(false);
        expect(resultado.mensaje).toBe('El mes debe estar entre 01 y 12');
      });

      it('debe rechazar mes 00', () => {
        const resultado = validarFechaFabricacion(202300);
        expect(resultado.valido).toBe(false);
        expect(resultado.mensaje).toBe('El mes debe estar entre 01 y 12');
      });

      it('debe rechazar más de 6 dígitos', () => {
        const resultado = validarFechaFabricacion(2023012);
        expect(resultado.valido).toBe(false);
        expect(resultado.mensaje).toBe(
          'La fecha de fabricación debe tener formato YYYYMM (6 dígitos)',
        );
      });

      it('debe rechazar menos de 6 dígitos', () => {
        const resultado = validarFechaFabricacion(20230);
        expect(resultado.valido).toBe(false);
        expect(resultado.mensaje).toBe(
          'La fecha de fabricación debe tener formato YYYYMM (6 dígitos)',
        );
      });

      it('debe rechazar valores no numéricos', () => {
        const resultado = validarFechaFabricacion('abcde' as any);
        expect(resultado.valido).toBe(false);
        expect(resultado.mensaje).toBe(
          'La fecha de fabricación debe tener formato YYYYMM (6 dígitos)',
        );
      });
    });

    describe('Fechas inválidas por ser futuras', () => {
      it('debe rechazar año muy futuro (año > actual + 1)', () => {
        const anioFuturo = new Date().getFullYear() + 5;
        const resultado = validarFechaFabricacion(anioFuturo * 100 + 1);
        expect(resultado.valido).toBe(false);
        expect(resultado.mensaje).toBe(
          'La fecha de fabricación no puede ser futura',
        );
      });

      it('debe rechazar año próximo con mes futuro', () => {
        const anioProximo = new Date().getFullYear() + 1;
        const mesFuturo = new Date().getMonth() + 1 + 3;
        if (mesFuturo <= 12) {
          const resultado = validarFechaFabricacion(
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
        const resultado = validarFechaFabricacion(null as any);
        expect(resultado.valido).toBe(false);
      });

      it('debe rechazar undefined', () => {
        const resultado = validarFechaFabricacion(undefined as any);
        expect(resultado.valido).toBe(false);
      });

      it('debe rechazar número muy pequeño', () => {
        const resultado = validarFechaFabricacion(1);
        expect(resultado.valido).toBe(false);
      });

      it('debe rechazar número muy grande', () => {
        const resultado = validarFechaFabricacion(99999999);
        expect(resultado.valido).toBe(false);
      });
    });
  });

  describe('isFechaFabricacionValida (versión booleana)', () => {
    it('debe retornar true para fecha válida', () => {
      expect(isFechaFabricacionValida(202301)).toBe(true);
    });

    it('debe retornar false para fecha inválida', () => {
      expect(isFechaFabricacionValida(202313)).toBe(false);
    });
  });
});
