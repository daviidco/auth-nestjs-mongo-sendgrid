// src/config/env.zod.ts
import { z } from 'zod';

export const envSchema = z.object({
  // Servidor
  PORT: z.coerce.number().min(1).max(65535).default(3000),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // Base de datos
  MONGODB_URI: z.string().url(),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_SECRET: z.string().min(32),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),

  // Rate Limiting
  RATE_LIMIT_TTL: z.coerce.number().min(1000).default(60000),
  RATE_LIMIT_MAX: z.coerce.number().min(1).default(100),

  // Bcrypt
  BCRYPT_ROUNDS: z.coerce.number().min(8).max(16).default(12),

  // Throttle
  THROTTLE_TTL: z.coerce.number().min(1000).default(60000),
  THROTTLE_LIMIT: z.coerce.number().min(1).default(100),

  // SendGrid Configuration
  SENDGRID_API_KEY: z.string().min(1),
  SENDGRID_FROM_EMAIL: z.string().email(),
  SENDGRID_FROM_NAME: z.string().default('Auth Microservice'),

  // Email Verification Settings
  FRONTEND_URL: z.string().url().default('http://localhost:3001'),
  EMAIL_VERIFICATION_URL: z.string().url().optional(),
  PASSWORD_RESET_URL: z.string().url().optional(),
  REQUIRE_EMAIL_VERIFICATION: z.coerce.boolean().default(true),
  VERIFICATION_DEFAULT_MODE: z.enum(['web', 'api', 'hybrid']).default('web'),

  // Email Rate Limiting
  EMAIL_RATE_LIMIT_TTL: z.coerce.number().default(60000),
  EMAIL_RATE_LIMIT_MAX: z.coerce.number().default(2),
  PASSWORD_RESET_RATE_LIMIT_TTL: z.coerce.number().default(300000),
  PASSWORD_RESET_RATE_LIMIT_MAX: z.coerce.number().default(3),
});

// Inferencia TypeScript automática
export type EnvConfig = z.infer<typeof envSchema>;
