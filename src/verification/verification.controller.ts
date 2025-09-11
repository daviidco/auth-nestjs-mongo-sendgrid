import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  Get,
  Query,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import type { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { VerificationService } from './verification.service';
import { Public } from '../common/decorators/public/public.decorator';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { BaseController } from '../common/controllers/base.controller';
import {
  ApiStandardResponse,
  ApiStandardErrorResponses,
} from '../common/decorators/api-standard-response.decorator';
import { BaseResponseDto } from '../common/dto/base-response.dto';
import { RESPONSE_BUILDER } from '../common/providers/response.provider';
import type { IResponseBuilder } from '../common/interfaces/response-builder.interface';

@ApiTags('Email Verification')
@Controller('verification')
export class VerificationController extends BaseController {
  constructor(
    @Inject(VerificationService) private readonly verificationService: VerificationService,
    @Inject(RESPONSE_BUILDER) responseBuilder: IResponseBuilder,
  ) {
    super(responseBuilder);
  }

  @ApiOperation({ summary: 'Verify email address' })
  @ApiStandardResponse(undefined, {
    description: 'Email verified successfully',
    message: 'Email verified successfully',
  })
  @ApiStandardErrorResponses()
  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async verifyEmail(
    @Body() verifyEmailDto: VerifyEmailDto,
  ): Promise<BaseResponseDto> {
    const result = await this.verificationService.verifyEmail(
      verifyEmailDto.token,
      verifyEmailDto.email,
    );
    return this.success(result, 'Email verified successfully');
  }

  @ApiOperation({ summary: 'Resend email verification' })
  @ApiStandardResponse(undefined, {
    description: 'Verification email sent successfully',
    message: 'Verification email sent successfully',
  })
  @ApiStandardErrorResponses()
  @Public()
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 2, ttl: 60000 } })
  async resendVerification(
    @Body() resendVerificationDto: ResendVerificationDto,
    @Req() request: Request,
  ): Promise<BaseResponseDto> {
    const ipAddress = request.ip;
    const userAgent = request.get('User-Agent');

    await this.verificationService.resendVerificationEmailByEmail(
      resendVerificationDto.email,
      ipAddress,
      userAgent,
    );

    return this.success(null, 'Verification email sent successfully');
  }

  @ApiOperation({ summary: 'Request password reset' })
  @ApiStandardResponse(undefined, {
    description: 'Password reset email sent if email exists',
    message: 'If the email exists, a password reset link has been sent',
  })
  @ApiStandardErrorResponses()
  @Public()
  @Post('request-password-reset')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 300000 } })
  async requestPasswordReset(
    @Body() requestPasswordResetDto: RequestPasswordResetDto,
    @Req() request: Request,
  ): Promise<BaseResponseDto> {
    const ipAddress = request.ip;
    const userAgent = request.get('User-Agent');

    await this.verificationService.requestPasswordReset(
      requestPasswordResetDto.email,
      ipAddress,
      userAgent,
    );

    return this.success(
      null,
      'If the email exists, a password reset link has been sent',
    );
  }

  @ApiOperation({ summary: 'Reset password with token' })
  @ApiStandardResponse(undefined, {
    description: 'Password reset successfully',
    message: 'Password reset successfully',
  })
  @ApiStandardErrorResponses()
  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<BaseResponseDto> {
    const result = await this.verificationService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.email,
      resetPasswordDto.newPassword,
    );
    return this.success(result, 'Password reset successfully');
  }

  @ApiOperation({ summary: 'Get verification options based on user agent' })
  @ApiStandardResponse(undefined, {
    description: 'Returns available verification modes and capabilities',
    message: 'Verification options retrieved successfully',
  })
  @ApiStandardErrorResponses()
  @Public()
  @Get('options')
  @HttpCode(HttpStatus.OK)
  async getVerificationOptions(): Promise<BaseResponseDto> {
    const options = this.verificationService.getVerificationOptions();
    return this.success(
      { options },
      'Verification options retrieved successfully',
    );
  }

  @ApiOperation({ summary: 'Resend verification email with specific mode' })
  @ApiStandardResponse(undefined, {
    description: 'Verification email sent successfully with specified mode',
    message: 'Verification email sent successfully with specified mode',
  })
  @ApiStandardErrorResponses()
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
  ): Promise<BaseResponseDto> {
    const ipAddress = request.ip;
    const userAgent = request.get('User-Agent');

    await this.verificationService.sendVerificationEmailWithModeByEmail(
      resendVerificationDto.email,
      mode,
      ipAddress,
      userAgent,
    );

    return this.success(
      { mode },
      `Verification email sent successfully with ${mode} mode`,
    );
  }

  @ApiOperation({
    summary: 'Get verification capabilities for API clients',
    description:
      'Returns API command examples and configuration for programmatic email verification',
  })
  @ApiStandardResponse(undefined, {
    description: 'Returns API verification capabilities and examples',
    message: 'API verification capabilities retrieved successfully',
  })
  @ApiStandardErrorResponses()
  @Public()
  @Get('api-capabilities')
  @HttpCode(HttpStatus.OK)
  async getApiCapabilities(): Promise<BaseResponseDto> {
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

    return this.success(
      { capabilities: apiCapabilities },
      'API verification capabilities retrieved successfully',
    );
  }
}
