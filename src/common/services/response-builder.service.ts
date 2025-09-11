import { Injectable } from '@nestjs/common';
import { BaseResponseDto } from '../dto/base-response.dto';
import {
  IResponseBuilder,
  IResponseMeta,
} from '../interfaces/response-builder.interface';

@Injectable()
export class ResponseBuilderService implements IResponseBuilder {
  /**
   * Creates a successful response with standardized format
   */
  success<T>(
    data?: T,
    message: string = 'Operation successful',
    meta: Record<string, any> = {},
  ): BaseResponseDto<T> {
    return {
      success: true,
      data,
      message,
      errors: [],
      meta: this.createMeta(meta),
    };
  }

  /**
   * Creates an error response with standardized format
   */
  error(
    message: string,
    errors: string[] = [],
    meta: Record<string, any> = {},
  ): BaseResponseDto {
    return {
      success: false,
      message,
      errors,
      meta: this.createMeta(meta),
    };
  }

  /**
   * Passthrough for simple responses (health, ping)
   */
  simple(data: Record<string, any>): Record<string, any> {
    return data;
  }

  /**
   * Creates metadata with timestamp and custom fields
   */
  private createMeta(customMeta: Record<string, any> = {}): IResponseMeta {
    return {
      timestamp: new Date().toISOString(),
      ...customMeta,
    };
  }
}
