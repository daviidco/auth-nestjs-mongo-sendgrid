import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
  Delete,
  Inject,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from '../guards/jwt-auth/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user/get-user.decorator';
import { IAuthResponse } from './interfaces/auth.interface';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public/public.decorator';
import { LogoutDto } from './dto/logout.dto';
import { BaseController } from '../common/controllers/base.controller';
import {
  ApiStandardResponse,
  ApiStandardCreatedResponse,
  ApiStandardErrorResponses,
} from '../common/decorators/api-standard-response.decorator';
import { BaseResponseDto } from '../common/dto/base-response.dto';
import { RESPONSE_BUILDER } from '../common/providers/response.provider';
import type { IResponseBuilder } from '../common/interfaces/response-builder.interface';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController extends BaseController {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(RESPONSE_BUILDER) responseBuilder: IResponseBuilder,
  ) {
    super(responseBuilder);
  }

  @ApiOperation({ summary: 'Register a new user' })
  @ApiStandardCreatedResponse(undefined, {
    description: 'User successfully registered',
    message: 'User registered successfully',
  })
  @ApiStandardErrorResponses()
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<BaseResponseDto<IAuthResponse>> {
    const result = await this.authService.register(registerDto);
    return this.success(result, 'User registered successfully');
  }

  @ApiOperation({ summary: 'Login user' })
  @ApiStandardResponse(undefined, {
    description: 'User successfully logged in',
    message: 'Login successful',
  })
  @ApiStandardErrorResponses()
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<BaseResponseDto<IAuthResponse>> {
    const result = await this.authService.login(loginDto);
    return this.success(result, 'Login successful');
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBearerAuth('JWT-auth')
  @ApiStandardResponse(undefined, {
    description: 'Token refreshed successfully',
    message: 'Tokens refreshed successfully',
  })
  @ApiStandardErrorResponses()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto): Promise<
    BaseResponseDto<{
      accessToken: string;
      refreshToken: string;
    }>
  > {
    const result = await this.authService.refreshTokens(refreshTokenDto);
    return this.success(result, 'Tokens refreshed successfully');
  }

  @ApiOperation({ summary: 'Logout user' })
  @ApiBearerAuth('JWT-auth')
  @ApiStandardResponse(undefined, {
    description: 'User logged out successfully',
    message: 'Logged out successfully',
  })
  @ApiStandardErrorResponses()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @GetUser('id') userId: string,
    @Body() body: LogoutDto,
  ): Promise<BaseResponseDto> {
    await this.authService.logout(userId, body.refreshToken);
    return this.success(null, 'Logged out successfully');
  }

  @ApiOperation({ summary: 'Logout from all devices' })
  @ApiBearerAuth('JWT-auth')
  @ApiStandardResponse(undefined, {
    description: 'Logged out from all devices',
    message: 'Logged out from all devices successfully',
  })
  @ApiStandardErrorResponses()
  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  async logoutAll(@GetUser('id') userId: string): Promise<BaseResponseDto> {
    await this.authService.logoutAll(userId);
    return this.success(null, 'Logged out from all devices successfully');
  }

  @ApiOperation({ summary: 'Get user profile' })
  @ApiBearerAuth('JWT-auth')
  @ApiStandardResponse(undefined, {
    description: 'User profile retrieved successfully',
    message: 'Profile retrieved successfully',
  })
  @ApiStandardErrorResponses()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(
    @GetUser() user: any,
  ): Promise<BaseResponseDto<{ user: any }>> {
    return this.success({ user }, 'Profile retrieved successfully');
  }
}
