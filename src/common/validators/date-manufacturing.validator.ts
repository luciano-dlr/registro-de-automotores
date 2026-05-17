import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsManufacturingDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isManufacturingDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'number') {
            if (typeof value === 'string') {
              const numValue = parseInt(value, 10);
              if (isNaN(numValue)) return false;
              return isManufacturingDateValid(numValue);
            }
            return false;
          }
          return isManufacturingDateValid(value);
        },
      },
    });
  };
}

export function validateManufacturingDate(fecha: number | string): {
  valido: boolean;
  mensaje?: string;
} {
  const fechaNum = typeof fecha === 'string' ? parseInt(fecha, 10) : fecha;

  if (isNaN(fechaNum)) {
    return {
      valido: false,
      mensaje: 'La fecha de fabricación debe tener formato YYYYMM (6 dígitos)',
    };
  }

  if (fechaNum < 100000 || fechaNum > 999999) {
    return {
      valido: false,
      mensaje: 'La fecha de fabricación debe tener formato YYYYMM (6 dígitos)',
    };
  }

  const anio = Math.floor(fechaNum / 100);
  const mes = fechaNum % 100;

  if (mes < 1 || mes > 12) {
    return {
      valido: false,
      mensaje: 'El mes debe estar entre 01 y 12',
    };
  }

  const ahora = new Date();
  const anioActual = ahora.getFullYear();
  const mesActual = ahora.getMonth() + 1;

  // El año no puede ser mayor al actual
  if (anio > anioActual) {
    return {
      valido: false,
      mensaje: 'La fecha de fabricación no puede ser futura',
    };
  }

  // Si el año es el actual, el mes no puede ser mayor al mes actual
  if (anio === anioActual && mes > mesActual) {
    return {
      valido: false,
      mensaje: 'La fecha de fabricación no puede ser futura',
    };
  }

  return { valido: true };
}

export function isManufacturingDateValid(fecha: number | string): boolean {
  const resultado = validateManufacturingDate(fecha);
  return resultado.valido;
}
