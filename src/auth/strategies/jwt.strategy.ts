import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { ITokenPayload } from '../interfaces/auth.interface';
import { EnvConfig } from 'src/config/env.zod';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService<EnvConfig>,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: ITokenPayload) {
    const user = await this.usersService.findById(payload.sub.toString());

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user.toJSON();
  }
}
