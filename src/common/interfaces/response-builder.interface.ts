import { BaseResponseDto } from '../dto/base-response.dto';

export interface IResponseBuilder {
  /**
   * Creates a successful response with data
   */
  success<T>(
    data?: T,
    message?: string,
    meta?: Record<string, any>,
  ): BaseResponseDto<T>;

  /**
   * Creates an error response
   */
  error(
    message: string,
    errors?: string[],
    meta?: Record<string, any>,
  ): BaseResponseDto;

  /**
   * Creates a simple response for health/ping endpoints (passthrough)
   */
  simple(data: Record<string, any>): Record<string, any>;
}

export interface IResponseMeta {
  timestamp: string;
  [key: string]: any;
}
