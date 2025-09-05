import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'Email verification token',
    example: 'a1b2c3d4e5f6...',
    minLength: 64,
    maxLength: 64,
  })
  @IsString()
  @Length(64, 64, { message: 'Token must be exactly 64 characters' })
  @Matches(/^[a-f0-9]{64}$/, { message: 'Invalid token format' })
  token: string;

  @ApiProperty({
    description: 'Email address to verify',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;
}
