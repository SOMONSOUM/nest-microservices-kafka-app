import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { ZodError } from 'zod';

interface ErrorResponse {
  success: false;
  status: number;
  message: string;
  errors?: unknown;
}

interface ValidationError {
  field: string;
  message: string;
  code: string;
}

interface HttpExceptionResponse {
  message?: string;
  errors?: unknown;
}

@Catch()
export class ErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(ErrorFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const contextType = host.getType();
    let status: number;
    let message: string;
    let errors: ValidationError[] | undefined = undefined;

    // Handle RpcException first to avoid double-wrapping
    if (exception instanceof RpcException) {
      const rpcError = exception.getError();
      if (typeof rpcError === 'object' && rpcError !== null) {
        throw exception; // Re-throw RpcException as-is
      }
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = typeof rpcError === 'string' ? rpcError : 'RPC error occurred';
    } else if (exception instanceof ZodError) {
      // Handle Zod validation errors
      status = HttpStatus.BAD_REQUEST;
      message = 'Validation failed';
      errors = exception.errors.map((error) => ({
        field: error.path.join('.'),
        message: error.message,
        code: error.code,
      }));
    } else if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      status = exception.getStatus();
      message = exception.message;

      // Check if the HttpException contains Zod errors
      if (
        exceptionResponse &&
        typeof exceptionResponse === 'object' &&
        'errors' in exceptionResponse
      ) {
        const responseData = exceptionResponse as HttpExceptionResponse;
        message = responseData.message || 'Validation failed';
        errors = responseData.errors as ValidationError[];
      }
    } else if (exception instanceof NotFoundException) {
      status = HttpStatus.NOT_FOUND;
      message = exception.message;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      const errorMessage = (exception as Error)?.message;

      // Handle connection errors specifically
      if (
        errorMessage?.includes('Connection closed') ||
        errorMessage?.includes('ECONNREFUSED')
      ) {
        status = HttpStatus.SERVICE_UNAVAILABLE;
        message = 'Service temporarily unavailable. Please try again later.';
      } else {
        message = errorMessage || 'Internal server error';
      }

      this.logger.error(
        `Unhandled exception: ${errorMessage}`,
        (exception as Error)?.stack,
      );
    }

    const responseBody: ErrorResponse = {
      success: false,
      status,
      message,
      ...(errors && { errors }),
    };

    if (contextType === 'http') {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      (response as any).status(status).json(responseBody);
      return;
    } else if (contextType === 'rpc') {
      // For RPC context, return error response directly
      return responseBody;
    }

    return responseBody;
  }
}
