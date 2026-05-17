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

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (exception instanceof BadRequestException) {
        let rawMessage: unknown =
          typeof exceptionResponse === 'object'
            ? ((exceptionResponse as { message?: unknown }).message ??
              exceptionResponse)
            : exceptionResponse;

        let finalMessage: string[];
        if (Array.isArray(rawMessage)) {
          const filtered = rawMessage.filter(
            (m: unknown) => m && typeof m === 'string' && m.trim() !== '',
          );
          finalMessage =
            filtered.length > 0 ? filtered : ['Error de validación'];
        } else if (typeof rawMessage === 'string') {
          finalMessage = [rawMessage];
        } else {
          finalMessage = ['Error de validación'];
        }

        return response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          message: finalMessage,
          error: 'Unprocessable Entity',
        });
      }

      if (status === HttpStatus.UNPROCESSABLE_ENTITY) {
        let rawMessage: unknown =
          typeof exceptionResponse === 'object'
            ? ((exceptionResponse as { message?: unknown }).message ??
              exceptionResponse)
            : exceptionResponse;

        let finalMessage: string[];
        if (Array.isArray(rawMessage)) {
          const filtered = rawMessage.filter(
            (m: unknown) => m && typeof m === 'string' && m.trim() !== '',
          );
          finalMessage =
            filtered.length > 0 ? filtered : ['Error de validación'];
        } else if (typeof rawMessage === 'string') {
          finalMessage = [rawMessage];
        } else {
          finalMessage = ['Error de validación'];
        }

        return response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          message: finalMessage,
          error: 'Unprocessable Entity',
        });
      }

      return response.status(status).json(exceptionResponse);
    }

    console.error('Unexpected error:', exception);

    if (exception instanceof Error) {
      const errorMessage = exception.message;

      if (
        errorMessage.includes('duplicate') ||
        errorMessage.includes('unique')
      ) {
        return response.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          message: 'El dominio ya existe',
          error: 'Conflict',
        });
      }

      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: errorMessage || 'Internal server error',
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
