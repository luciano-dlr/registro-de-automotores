import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsCuit(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isCuit',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: 'CUIT inválido, no pasa el dígito verificador',
        ...validationOptions,
      },
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') {
            return false;
          }
          return validarCuit(value);
        },
      },
    });
  };
}


export function validarCuit(cuit: string): boolean {
  if (!cuit || typeof cuit !== 'string') {
    return false;
  }

  const cleanCuit = cuit.replace(/\D/g, '');

  if (cleanCuit.length !== 11) {
    return false;
  }

  if (/^0+$/.test(cleanCuit)) {
    return false;
  }

  const base = cleanCuit.substring(0, 10);
  const verificador = parseInt(cleanCuit.charAt(10), 10);

  const multiplicadores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

  let suma = 0;
  for (let i = 0; i < 10; i++) {
    suma += parseInt(base.charAt(i), 10) * multiplicadores[i];
  }

  const resto = suma % 11;

  let digitoEsperado: number;
  if (resto === 0) {
    digitoEsperado = 0;
  } else if (resto === 1) {
    digitoEsperado = 9;
  } else {
    digitoEsperado = 11 - resto;
  }

  return verificador === digitoEsperado;
}

