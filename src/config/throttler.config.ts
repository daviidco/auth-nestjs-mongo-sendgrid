import { ConfigService } from '@nestjs/config';
import { ThrottlerModuleOptions } from '@nestjs/throttler';
import { EnvConfig } from './env.zod';

export const getThrottlerConfig = (
  configService: ConfigService<EnvConfig>,
): ThrottlerModuleOptions => [
  {
    ttl: configService.getOrThrow('THROTTLE_TTL', { infer: true }),
    limit: configService.getOrThrow('THROTTLE_LIMIT', { infer: true }),
  },
];
