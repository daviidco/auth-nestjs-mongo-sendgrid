import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';
import { EnvConfig } from '../config/env.zod';

export const getDatabaseConfig = (
  configService: ConfigService<EnvConfig>,
): MongooseModuleOptions => ({
  uri: configService.get('MONGODB_URI', { infer: true }),
  autoIndex: true,
  maxPoolSize: 10,
  bufferCommands: false,
});
