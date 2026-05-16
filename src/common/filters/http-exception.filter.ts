import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Manejar errores de class-validator (BadRequestException)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Si es un error de validación (422 o 400)
      if (
        status === HttpStatus.BAD_REQUEST ||
        status === HttpStatus.UNPROCESSABLE_ENTITY
      ) {
        const message =
          typeof exceptionResponse === 'object'
            ? (exceptionResponse as any).message || exceptionResponse
            : exceptionResponse;

        return response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          message: Array.isArray(message) ? message : [message],
          error: 'Unprocessable Entity',
        });
      }

      // Para otros errores HTTP, dejar el comportamiento por defecto
      return response.status(status).json(exceptionResponse);
    }

    // Manejar errores no esperados
    console.error('Unexpected error:', exception);

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
    });
  }
}
