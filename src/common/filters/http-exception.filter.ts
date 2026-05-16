import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Manejar errores de tipo HttpException
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Si es un error de validación (BadRequestException de class-validator)
      if (exception instanceof BadRequestException) {
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

      // Si es 422 explícito
      if (status === HttpStatus.UNPROCESSABLE_ENTITY) {
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

      // Para otros errores HTTP (404, etc), dejar el comportamiento por defecto
      return response.status(status).json(exceptionResponse);
    }

    // Manejar errores no esperados (incluye errores de TypeORM, etc)
    console.error('Unexpected error:', exception);

    // Si es un error de base de datos o tipo error
    if (exception instanceof Error) {
      const message = exception.message;

      // Error de dominio duplicado
      if (message.includes('duplicate') || message.includes('unique')) {
        return response.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          message: 'El dominio ya existe',
          error: 'Conflict',
        });
      }

      // Otros errores
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: message || 'Internal server error',
        error: 'Internal Server Error',
      });
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
    });
  }
}
