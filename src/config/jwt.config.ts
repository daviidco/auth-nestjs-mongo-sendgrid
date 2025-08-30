import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';
import { EnvConfig } from './env.zod';

export const getJwtConfig = (
  configService: ConfigService<EnvConfig>,
): JwtModuleOptions => ({
  secret: configService.get('JWT_SECRET'),
  signOptions: {
    expiresIn: configService.get('JWT_EXPIRES_IN'),
  },
});
