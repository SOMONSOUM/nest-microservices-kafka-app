import { HttpException, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface MicroserviceError {
  success: false;
  status: number;
  message: string;
  errors?: unknown;
}

export interface MicroserviceSuccess<T = unknown> {
  success: true;
  data: T;
}

export type MicroserviceResponse<T> =
  | MicroserviceSuccess<T>
  | MicroserviceError;

export class MicroserviceErrorHandler {
  /**
   * Handle microservice responses and convert RPC errors to HTTP exceptions
   */
  static handleMicroserviceResponse<T>(
    response$: Observable<T>,
  ): Observable<T> {
    return response$.pipe(
      map((response) => {
        // If the response is an error object, throw it as an HTTP exception
        if (
          response &&
          typeof response === 'object' &&
          'success' in response &&
          response.success === false
        ) {
          const errorResponse = response as unknown as MicroserviceError;
          throw new HttpException(
            {
              success: false,
              status: errorResponse.status,
              message: errorResponse.message,
              errors: errorResponse.errors,
            },
            errorResponse.status,
          );
        }
        return response;
      }),
      catchError((error) => {
        // Handle RpcException
        if (error instanceof RpcException) {
          const rpcError = error.getError();
          if (typeof rpcError === 'object' && rpcError !== null) {
            const errorObj = rpcError as MicroserviceError;
            throw new HttpException(
              {
                success: false,
                status: errorObj.status || HttpStatus.INTERNAL_SERVER_ERROR,
                message: errorObj.message || 'Microservice error',
                errors: errorObj.errors,
              },
              errorObj.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
          throw new HttpException(
            {
              success: false,
              status: HttpStatus.INTERNAL_SERVER_ERROR,
              message:
                typeof rpcError === 'string' ? rpcError : 'Microservice error',
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        // Handle HttpException
        if (error instanceof HttpException) {
          throw error;
        }

        // Handle generic errors
        const errorMessage =
          error instanceof Error ? error.message : 'Internal server error';

        // Handle connection errors specifically
        if (
          errorMessage.includes('Connection closed') ||
          errorMessage.includes('ECONNREFUSED')
        ) {
          throw new HttpException(
            {
              success: false,
              status: HttpStatus.SERVICE_UNAVAILABLE,
              message:
                'Service temporarily unavailable. Please try again later.',
            },
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }

        throw new HttpException(
          {
            success: false,
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: errorMessage,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }),
    );
  }

  /**
   * Create a standardized error response for microservices
   */
  static createErrorResponse(
    message: string,
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    errors?: unknown,
  ): MicroserviceError {
    const response: MicroserviceError = {
      success: false,
      status,
      message,
    };

    if (errors !== undefined) {
      response.errors = errors;
    }

    return response;
  }

  /**
   * Create a standardized success response for microservices
   */
  static createSuccessResponse<T>(data: T): MicroserviceSuccess<T> {
    return {
      success: true,
      data,
    };
  }
}
