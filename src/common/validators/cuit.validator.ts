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
          return validateCuit(value);
        },
      },
    });
  };
}


export function validateCuit(cuit: string): boolean {
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
  const verif = parseInt(cleanCuit.charAt(10), 10);

  const multiplicadores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

  let suma = 0;
  for (let i = 0; i < 10; i++) {
    suma += parseInt(base.charAt(i), 10) * multiplicadores[i];
  }

  const resto = suma % 11;

  let correctNumber: number;
  if (resto === 0) {
    correctNumber = 0;
  } else if (resto === 1) {
    correctNumber = 9;
  } else {
    correctNumber = 11 - resto;
  }

  return verif === correctNumber;
}

