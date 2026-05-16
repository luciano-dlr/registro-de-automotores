import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Validador de Dominio de Automotor
 * Formato válido: AAA999 (ej: ABC123) o AA999AA (ej: AB123CD)
 * Regex: ^[A-Z]{3}[0-9]{3}$|^[A-Z]{2}[0-9]{3}[A-Z]{2}$
 */
export function IsDominio(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isDominio',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: 'El dominio debe tener formato AAA999 o AA999AA',
        ...validationOptions,
      },
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') {
            return false;
          }
          const dominioRegex = /^[A-Z]{3}[0-9]{3}$|^[A-Z]{2}[0-9]{3}[A-Z]{2}$/;
          return dominioRegex.test(value.toUpperCase());
        },
      },
    });
  };
}

/**
 * Función utilitaria para validar dominio (sin decorador)
 */
export function validarDominio(dominio: string): boolean {
  if (!dominio || typeof dominio !== 'string') {
    return false;
  }
  const dominioRegex = /^[A-Z]{3}[0-9]{3}$|^[A-Z]{2}[0-9]{3}[A-Z]{2}$/;
  return dominioRegex.test(dominio.toUpperCase());
}
