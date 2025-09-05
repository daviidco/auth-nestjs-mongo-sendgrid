import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

export class RequestPasswordResetDto {
  @ApiProperty({
    description: 'Email address for password reset',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;
}
