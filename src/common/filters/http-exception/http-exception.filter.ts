import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import type { IResponseBuilder } from '../../interfaces/response-builder.interface';
import { RESPONSE_BUILDER } from '../../providers/response.provider';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(
    @Inject(RESPONSE_BUILDER)
    private readonly responseBuilder: IResponseBuilder,
  ) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const message = exception.getResponse();

    // Check if this is a business endpoint
    const isBusinessEndpoint = this.isBusinessEndpoint(request.url);

    let errorResponse: any;

    if (isBusinessEndpoint) {
      // Use standardized format for business endpoints
      const errorMessage =
        typeof message === 'string'
          ? message
          : (message as any).message || 'An error occurred';

      const errors =
        typeof message === 'object' && (message as any).message
          ? Array.isArray((message as any).message)
            ? (message as any).message
            : [(message as any).message]
          : [errorMessage];

      errorResponse = this.responseBuilder.error(errorMessage, errors, {
        statusCode: status,
        path: request.url,
        method: request.method,
      });
    } else {
      // Keep original format for health/ping endpoints
      errorResponse = {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        message:
          typeof message === 'string' ? message : (message as any).message,
        error: typeof message === 'object' ? (message as any).error : undefined,
      };
    }

    // Log del error
    this.logger.error(
      `HTTP ${status} Error - ${request.method} ${request.url}`,
      JSON.stringify(errorResponse),
    );

    response.status(status).json(errorResponse);
  }

  /**
   * Check if URL belongs to business endpoints
   */
  private isBusinessEndpoint(url: string): boolean {
    const businessPrefixes = [
      '/api/v1/auth',
      '/api/v1/users',
      '/api/v1/verification',
    ];

    return businessPrefixes.some((prefix) => url.startsWith(prefix));
  }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: 'Internal server error',
    };

    this.logger.error(
      `Unhandled Exception - ${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : exception,
    );

    response.status(status).json(errorResponse);
  }
}
