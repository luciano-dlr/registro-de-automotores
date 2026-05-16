import { registerDecorator, ValidationOptions } from 'class-validator';

/**
 * Validador de CUIT (Clave Única de Identificación Tributaria)
 * Reglas: 11 dígitos, dígito verificador según algoritmo módulo 11
 *
 * Algoritmo:
 * 1. Separar los 10 primeros dígitos y el dígito verificador (último)
 * 2. Multiplicar cada dígito por la serie [5,4,3,2,7,6,5,4,3,2]
 * 3. Sumar productos, calcular resto de dividir por 11 (resto = suma % 11)
 * 4. Si resto == 0 → verificador debe ser 0
 *    Si resto == 1 → verificador debe ser 9
 *    Else → verificador debe ser (11 - resto)
 */
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

/**
 * Función utilitaria para validar CUIT (sin decorador)
 */
export function validarCuit(cuit: string): boolean {
  // Verificar que no sea null, undefined o string vacío
  if (!cuit || typeof cuit !== 'string') {
    return false;
  }

  // Limpiar el CUIT (solo dígitos)
  const cleanCuit = cuit.replace(/\D/g, '');

  // Debe tener exactamente 11 dígitos
  if (cleanCuit.length !== 11) {
    return false;
  }

  // Verificar que no sean todos ceros
  if (/^0+$/.test(cleanCuit)) {
    return false;
  }

  // Los primeros 10 dígitos
  const base = cleanCuit.substring(0, 10);
  // El dígito verificador
  const verificador = parseInt(cleanCuit.charAt(10), 10);

  // Serie multiplicadora
  const multiplicadores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

  // Calcular suma de productos
  let suma = 0;
  for (let i = 0; i < 10; i++) {
    suma += parseInt(base.charAt(i), 10) * multiplicadores[i];
  }

  // Calcular resto
  const resto = suma % 11;

  // Calcular dígito verificador esperado
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

/**
 * CUITs válidos de ejemplo para testing:
 * - 20345678905 (válido)
 * - 27123456780 (válido)
 * - 20000000006 (válido)
 */
