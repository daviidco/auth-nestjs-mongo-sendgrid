import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  Get,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import type { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { VerificationService } from './verification.service';
import { Public } from '../common/decorators/public/public.decorator';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';

@ApiTags('Email Verification')
@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @ApiOperation({ summary: 'Verify email address' })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.verificationService.verifyEmail(
      verifyEmailDto.token,
      verifyEmailDto.email,
    );
  }

  @ApiOperation({ summary: 'Resend email verification' })
  @ApiResponse({
    status: 200,
    description: 'Verification email sent successfully',
  })
  @Public()
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 2, ttl: 60000 } })
  async resendVerification(
    @Body() resendVerificationDto: ResendVerificationDto,
    @Req() request: Request,
  ) {
    const ipAddress = request.ip;
    const userAgent = request.get('User-Agent');

    await this.verificationService.resendVerificationEmailByEmail(
      resendVerificationDto.email,
      ipAddress,
      userAgent,
    );

    return {
      message: 'Verification email sent successfully',
    };
  }

  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent if email exists',
  })
  @Public()
  @Post('request-password-reset')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 300000 } })
  async requestPasswordReset(
    @Body() requestPasswordResetDto: RequestPasswordResetDto,
    @Req() request: Request,
  ) {
    const ipAddress = request.ip;
    const userAgent = request.get('User-Agent');

    await this.verificationService.requestPasswordReset(
      requestPasswordResetDto.email,
      ipAddress,
      userAgent,
    );

    return {
      message: 'If the email exists, a password reset link has been sent',
    };
  }

  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
  })
  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.verificationService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.email,
      resetPasswordDto.newPassword,
    );
  }

  @ApiOperation({ summary: 'Get verification options based on user agent' })
  @ApiResponse({
    status: 200,
    description: 'Returns available verification modes and capabilities',
  })
  @Public()
  @Get('options')
  @HttpCode(HttpStatus.OK)
  async getVerificationOptions() {
    const options = this.verificationService.getVerificationOptions();

    return {
      message: 'Verification options retrieved successfully',
      options,
    };
  }

  @ApiOperation({ summary: 'Resend verification email with specific mode' })
  @ApiResponse({
    status: 200,
    description: 'Verification email sent successfully with specified mode',
  })
  @ApiResponse({ status: 400, description: 'Invalid verification mode' })
  @ApiQuery({
    name: 'mode',
    required: true,
    description: 'Verification mode (web, api, hybrid)',
    enum: ['web', 'api', 'hybrid'],
  })
  @Public()
  @Post('resend-verification/mode')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 2, ttl: 60000 } })
  async resendVerificationWithMode(
    @Body() resendVerificationDto: ResendVerificationDto,
    @Query('mode') mode: string,
    @Req() request: Request,
  ) {
    const ipAddress = request.ip;
    const userAgent = request.get('User-Agent');

    await this.verificationService.sendVerificationEmailWithModeByEmail(
      resendVerificationDto.email,
      mode,
      ipAddress,
      userAgent,
    );

    return {
      message: `Verification email sent successfully with ${mode} mode`,
      mode,
    };
  }

  @ApiOperation({
    summary: 'Get verification capabilities for API clients',
    description:
      'Returns API command examples and configuration for programmatic email verification',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns API verification capabilities and examples',
  })
  @Public()
  @Get('api-capabilities')
  @HttpCode(HttpStatus.OK)
  async getApiCapabilities() {
    const options = this.verificationService.getVerificationOptions();

    // Filter to show only API-related capabilities
    const apiCapabilities = {
      isApiClientDetected: options.isApiClient,
      detectedClient: options.detectedClient,
      recommendedMode: options.defaultMode,
      verificationMethods: options.verificationMethods,
      endpoints: {
        verify: '/auth/verification/verify-email',
        resendWithMode: '/auth/verification/resend-verification/mode',
        options: '/auth/verification/options',
      },
      notes: [
        'Use POST /auth/verification/verify-email with token and email in request body',
        'Include Content-Type: application/json header',
        'Verification mode is configured globally in the application',
      ],
    };

    return {
      message: 'API verification capabilities retrieved successfully',
      capabilities: apiCapabilities,
    };
  }
}
