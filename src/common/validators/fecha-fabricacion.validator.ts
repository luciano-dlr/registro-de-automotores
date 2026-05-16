import { registerDecorator, ValidationOptions } from 'class-validator';

/**
 * Validador de Fecha de Fabricación (YYYYMM)
 * Reglas:
 * - Exactamente 6 dígitos
 * - Mes entre 01 y 12
 * - No puede ser futura (comparar contra año y mes actual)
 */
export function IsFechaFabricacion(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isFechaFabricacion',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'number') {
            // Si es string, intentar convertir
            if (typeof value === 'string') {
              const numValue = parseInt(value, 10);
              if (isNaN(numValue)) return false;
              return isFechaFabricacionValida(numValue);
            }
            return false;
          }
          return isFechaFabricacionValida(value);
        },
      },
    });
  };
}

/**
 * Función utilitaria para validar fecha de fabricación (sin decorador)
 * Devuelve: { valido: boolean, mensaje?: string }
 */
export function validarFechaFabricacion(fecha: number | string): {
  valido: boolean;
  mensaje?: string;
} {
  // Convertir a número si es string
  const fechaNum = typeof fecha === 'string' ? parseInt(fecha, 10) : fecha;

  // Debe ser número
  if (isNaN(fechaNum)) {
    return {
      valido: false,
      mensaje: 'La fecha de fabricación debe tener formato YYYYMM (6 dígitos)',
    };
  }

  // Validar que sean exactamente 6 dígitos
  if (fechaNum < 100000 || fechaNum > 999999) {
    return {
      valido: false,
      mensaje: 'La fecha de fabricación debe tener formato YYYYMM (6 dígitos)',
    };
  }

  // Extraer año y mes
  const anio = Math.floor(fechaNum / 100);
  const mes = fechaNum % 100;

  // Validar mes entre 01 y 12
  if (mes < 1 || mes > 12) {
    return {
      valido: false,
      mensaje: 'El mes debe estar entre 01 y 12',
    };
  }

  // Obtener fecha actual
  const ahora = new Date();
  const anioActual = ahora.getFullYear();
  const mesActual = ahora.getMonth() + 1; // Los meses en JS van de 0 a 11

  // Validar que no sea futura (año > actual + 1 se considera futuro)
  // Nota: permitimos hasta el año actual + 1 porque puede haber autos del año que viene en pre-venta
  if (anio > anioActual + 1) {
    return {
      valido: false,
      mensaje: 'La fecha de fabricación no puede ser futura',
    };
  }

  // Si es el año actual + 1, verificar que el mes no sea mayor al actual
  if (anio === anioActual + 1 && mes > mesActual) {
    return {
      valido: false,
      mensaje: 'La fecha de fabricación no puede ser futura',
    };
  }

  return { valido: true };
}

/**
 * Versión simple (solo booleano) para usar en validators
 */
export function isFechaFabricacionValida(fecha: number | string): boolean {
  const resultado = validarFechaFabricacion(fecha);
  return resultado.valido;
}
