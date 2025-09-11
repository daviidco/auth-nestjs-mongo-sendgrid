import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto<T = any> {
  @ApiProperty({
    description: 'Indicates if the operation was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'The response data',
    required: false,
  })
  data?: T;

  @ApiProperty({
    description: 'Human readable message about the operation',
    example: 'Operation completed successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Array of error messages if any',
    type: [String],
    example: [],
  })
  errors: string[];

  @ApiProperty({
    description: 'Metadata about the response',
    example: {
      timestamp: '2024-03-15T10:30:00Z',
    },
  })
  meta: {
    timestamp: string;
    [key: string]: any;
  };
}

export class ErrorResponseDto extends BaseResponseDto {
  @ApiProperty({ example: false })
  declare success: false;

  @ApiProperty({
    description: 'Error message',
    example: 'Validation failed',
  })
  declare message: string;

  @ApiProperty({
    description: 'Detailed error messages',
    type: [String],
    example: ['Email is required', 'Password must be at least 8 characters'],
  })
  declare errors: string[];
}
