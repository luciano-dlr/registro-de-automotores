import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsDomain(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isDomain',
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
          const domainRegex = /^[A-Z]{3}[0-9]{3}$|^[A-Z]{2}[0-9]{3}[A-Z]{2}$/;
          return domainRegex.test(value.toUpperCase());
        },
      },
    });
  };
}
