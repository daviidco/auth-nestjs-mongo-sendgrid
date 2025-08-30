import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from '../guards/jwt-auth/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user/get-user.decorator';
import { IAuthResponse } from './interfaces/auth.interface';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public/public.decorator';
import { LogoutDto } from './dto/logout.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<IAuthResponse> {
    return this.authService.register(registerDto);
  }

  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 403, description: 'Account locked' })
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<IAuthResponse> {
    return this.authService.login(loginDto);
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    return this.authService.refreshTokens(refreshTokenDto);
  }

  @ApiOperation({ summary: 'Logout user' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 200, description: 'User logged out successfully' })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @GetUser('id') userId: string,
    @Body() body: LogoutDto,
  ): Promise<{ message: string }> {
    await this.authService.logout(userId, body.refreshToken);
    return { message: 'Logged out successfully' };
  }

  @ApiOperation({ summary: 'Logout from all devices' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 200, description: 'Logged out from all devices' })
  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  async logoutAll(@GetUser('id') userId: string): Promise<{ message: string }> {
    await this.authService.logoutAll(userId);
    return { message: 'Logged out from all devices successfully' };
  }

  @ApiOperation({ summary: 'Get user profile' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  @UseGuards(JwtAuthGuard)
  @Post('profile')
  @HttpCode(HttpStatus.OK)
  async getProfile(@GetUser() user: any): Promise<any> {
    return { user };
  }
}
