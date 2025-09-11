import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { IResponseBuilder } from '../interfaces/response-builder.interface';
import { RESPONSE_BUILDER } from '../providers/response.provider';

@Injectable()
export class ResponseFormatInterceptor implements NestInterceptor {
  constructor(
    @Inject(RESPONSE_BUILDER)
    private readonly responseBuilder: IResponseBuilder,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const url = request.url;

    return next.handle().pipe(
      map((data) => {
        // Only format business endpoint responses
        if (!this.isBusinessEndpoint(url)) {
          return data; // Keep original format for health/ping endpoints
        }

        // If already in standard format, don't modify
        if (this.hasStandardFormat(data)) {
          return data;
        }

        // Apply standard format to business endpoints
        return this.responseBuilder.success(data);
      }),
    );
  }

  /**
   * Check if URL belongs to business endpoints that should be standardized
   */
  private isBusinessEndpoint(url: string): boolean {
    const businessPrefixes = [
      '/api/v1/auth',
      '/api/v1/users',
      '/api/v1/verification',
    ];

    return businessPrefixes.some((prefix) => url.startsWith(prefix));
  }

  /**
   * Check if response already has standard format
   */
  private hasStandardFormat(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      'success' in data &&
      'message' in data &&
      'errors' in data &&
      'meta' in data
    );
  }
}
