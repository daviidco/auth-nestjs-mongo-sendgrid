import { Inject } from '@nestjs/common';
import { BaseResponseDto } from '../dto/base-response.dto';
import type { IResponseBuilder } from '../interfaces/response-builder.interface';
import { RESPONSE_BUILDER } from '../providers/response.provider';

export abstract class BaseController {
  constructor(
    @Inject(RESPONSE_BUILDER)
    protected readonly responseBuilder: IResponseBuilder,
  ) {}

  /**
   * Create a successful response
   */
  protected success<T>(
    data?: T,
    message?: string,
    meta?: Record<string, any>,
  ): BaseResponseDto<T> {
    return this.responseBuilder.success(data, message, meta);
  }

  /**
   * Create an error response
   */
  protected error(
    message: string,
    errors?: string[],
    meta?: Record<string, any>,
  ): BaseResponseDto {
    return this.responseBuilder.error(message, errors, meta);
  }

  /**
   * Create a simple response (for health/ping endpoints)
   */
  protected simple(data: Record<string, any>): Record<string, any> {
    return this.responseBuilder.simple(data);
  }
}
