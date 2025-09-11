import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { BaseResponseDto, ErrorResponseDto } from '../dto/base-response.dto';

/**
 * Decorator for standardized success responses (200 OK)
 */
export function ApiStandardResponse<T>(
  dataType?: Type<T>,
  options: {
    description?: string;
    isArray?: boolean;
    message?: string;
  } = {},
) {
  const {
    description = 'Successful operation',
    isArray = false,
    message = 'Operation successful',
  } = options;

  const dataSchema = dataType
    ? isArray
      ? { type: 'array', items: { $ref: getSchemaPath(dataType) } }
      : { $ref: getSchemaPath(dataType) }
    : { type: 'object' };

  return applyDecorators(
    ApiOkResponse({
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(BaseResponseDto) },
          {
            properties: {
              success: { type: 'boolean', example: true },
              data: dataSchema,
              message: { type: 'string', example: message },
              errors: { type: 'array', items: { type: 'string' }, example: [] },
              meta: {
                type: 'object',
                properties: {
                  timestamp: { type: 'string', format: 'date-time' },
                },
                example: { timestamp: '2024-03-15T10:30:00Z' },
              },
            },
          },
        ],
      },
    }),
  );
}

/**
 * Decorator for standardized created responses (201 Created)
 */
export function ApiStandardCreatedResponse<T>(
  dataType?: Type<T>,
  options: {
    description?: string;
    message?: string;
  } = {},
) {
  const {
    description = 'Resource created successfully',
    message = 'Resource created successfully',
  } = options;

  const dataSchema = dataType
    ? { $ref: getSchemaPath(dataType) }
    : { type: 'object' };

  return applyDecorators(
    ApiCreatedResponse({
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(BaseResponseDto) },
          {
            properties: {
              success: { type: 'boolean', example: true },
              data: dataSchema,
              message: { type: 'string', example: message },
              errors: { type: 'array', items: { type: 'string' }, example: [] },
              meta: {
                type: 'object',
                properties: {
                  timestamp: { type: 'string', format: 'date-time' },
                },
                example: { timestamp: '2024-03-15T10:30:00Z' },
              },
            },
          },
        ],
      },
    }),
  );
}

/**
 * Decorator for standardized error responses
 */
export function ApiStandardErrorResponses() {
  return applyDecorators(
    ApiBadRequestResponse({
      description: 'Bad Request',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ErrorResponseDto) },
          {
            properties: {
              success: { type: 'boolean', example: false },
              message: { type: 'string', example: 'Validation failed' },
              errors: {
                type: 'array',
                items: { type: 'string' },
                example: [
                  'Email is required',
                  'Password must be at least 8 characters',
                ],
              },
              meta: {
                type: 'object',
                properties: {
                  timestamp: { type: 'string', format: 'date-time' },
                },
                example: { timestamp: '2024-03-15T10:30:00Z' },
              },
            },
          },
        ],
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ErrorResponseDto) },
          {
            properties: {
              success: { type: 'boolean', example: false },
              message: { type: 'string', example: 'Unauthorized access' },
              errors: {
                type: 'array',
                items: { type: 'string' },
                example: ['Invalid credentials'],
              },
            },
          },
        ],
      },
    }),
    ApiForbiddenResponse({
      description: 'Forbidden',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ErrorResponseDto) },
          {
            properties: {
              success: { type: 'boolean', example: false },
              message: { type: 'string', example: 'Insufficient permissions' },
              errors: {
                type: 'array',
                items: { type: 'string' },
                example: ['Access denied'],
              },
            },
          },
        ],
      },
    }),
    ApiNotFoundResponse({
      description: 'Not Found',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ErrorResponseDto) },
          {
            properties: {
              success: { type: 'boolean', example: false },
              message: { type: 'string', example: 'Resource not found' },
              errors: {
                type: 'array',
                items: { type: 'string' },
                example: ['User not found'],
              },
            },
          },
        ],
      },
    }),
    ApiInternalServerErrorResponse({
      description: 'Internal Server Error',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ErrorResponseDto) },
          {
            properties: {
              success: { type: 'boolean', example: false },
              message: { type: 'string', example: 'Internal server error' },
              errors: {
                type: 'array',
                items: { type: 'string' },
                example: ['Something went wrong'],
              },
            },
          },
        ],
      },
    }),
  );
}

/**
 * Decorator for simple responses (health, ping) - unchanged format
 */
export function ApiSimpleResponse(
  description: string = 'Simple response format',
) {
  return ApiOkResponse({ description });
}
