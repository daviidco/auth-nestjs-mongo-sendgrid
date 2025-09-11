import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { PasswordUtil } from '../utils/password.util';
import { TokenUtil } from '../utils/token.util';
import { VerificationService } from '../verification/verification.service';
import { getErrorMessage } from '../common/utils';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import {
  IAuthResponse,
  ITokenPayload,
  IRefreshTokenPayload,
} from './interfaces/auth.interface';
import { UserDocument } from '../users/schemas/user.schema';
import { toUserResponse } from 'src/users/mappers/user.mapper';
import { EnvConfig } from 'src/config/env.zod';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService<EnvConfig>,
    private passwordUtil: PasswordUtil,
    private tokenUtil: TokenUtil,
    private verificationService: VerificationService,
  ) {}

  async register(registerDto: RegisterDto): Promise<IAuthResponse> {
    const user = await this.usersService.create(registerDto);
    const tokens = await this.generateTokens(user);

    // Guardar refresh token en la base de datos
    await this.usersService.updateRefreshTokens(user.id, [tokens.refreshToken]);

    // Enviar email de verificación
    try {
      await this.verificationService.sendVerificationEmail(
        user.id,
        user.email,
        `${user.firstName} ${user.lastName}`,
      );
    } catch (error) {
      // Log error but don't fail registration
      this.logger.error('Failed to send verification email:', {
        error: getErrorMessage(error),
        userId: user.id,
        email: user.email,
      });
    }

    return {
      user,
      ...tokens,
      emailVerificationSent: true,
    };
  }

  async login(loginDto: LoginDto): Promise<IAuthResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verificar si la cuenta está bloqueada
    const isLocked = await this.usersService.isAccountLocked(user);
    if (isLocked) {
      throw new ForbiddenException('Account is temporarily locked');
    }

    // Verificar email si está habilitado
    const requireEmailVerification = this.configService.get(
      'REQUIRE_EMAIL_VERIFICATION',
      true,
    );
    if (requireEmailVerification && !user.emailVerified) {
      throw new ForbiddenException(
        'Please verify your email address before logging in',
      );
    }

    const tokens = await this.generateTokens(user.toJSON());

    // Actualizar refresh tokens y último login
    const updatedRefreshTokens = [...user.refreshTokens, tokens.refreshToken];
    await Promise.all([
      this.usersService.updateRefreshTokens(
        user._id as string,
        updatedRefreshTokens,
      ),
      this.usersService.updateLastLogin(user._id as string),
    ]);

    return {
      user: toUserResponse(user),
      ...tokens,
    };
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      const refreshSecret = this.configService.getOrThrow(
        'REFRESH_TOKEN_SECRET',
        {
          infer: true,
        },
      );

      const payload = this.jwtService.verify<IRefreshTokenPayload>(
        refreshTokenDto.refreshToken,
        {
          secret: refreshSecret,
        },
      );

      const user = await this.usersService.findById(payload.sub);

      if (!user || !user.refreshTokens.includes(refreshTokenDto.refreshToken)) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generar nuevos tokens
      const tokens = await this.generateTokens(user.toJSON());

      // Actualizar refresh tokens en la base de datos
      const newRefreshTokens = user.refreshTokens.filter(
        (token) => token !== refreshTokenDto.refreshToken,
      );
      newRefreshTokens.push(tokens.refreshToken);

      await this.usersService.updateRefreshTokens(
        user._id as string,
        newRefreshTokens,
      );

      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    await this.usersService.removeRefreshToken(userId, refreshToken);
  }

  async logoutAll(userId: string): Promise<void> {
    await this.usersService.updateRefreshTokens(userId, []);
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserDocument | null> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return null;
    }

    const isPasswordValid = await this.passwordUtil.comparePasswords(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      // Incrementar intentos de login fallidos
      await this.usersService.incrementLoginAttempts(user._id as string);
      return null;
    }

    return user;
  }

  private async generateTokens(user: any): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const tokenPayload: ITokenPayload = {
      sub: user._id,
      email: user.email,
      role: user.role,
    };

    const refreshPayload: IRefreshTokenPayload = {
      sub: user._id,
      tokenId: this.tokenUtil.generateTokenId(),
    };

    // Obtener variables con validación y tipado
    const refreshSecret = this.configService.getOrThrow(
      'REFRESH_TOKEN_SECRET',
      {
        infer: true,
      },
    );
    const refreshExpiresIn = this.configService.getOrThrow(
      'REFRESH_TOKEN_EXPIRES_IN',
      {
        infer: true,
      },
    );

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(tokenPayload),
      this.jwtService.signAsync(refreshPayload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn,
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
