import { ConfigService } from '@nestjs/config';
import { EnvConfig } from './env.zod';

export const getSendGridConfig = (configService: ConfigService<EnvConfig>) => ({
  apiKey: configService.getOrThrow('SENDGRID_API_KEY'),
  fromEmail: configService.getOrThrow('SENDGRID_FROM_EMAIL'),
  fromName: configService.get('SENDGRID_FROM_NAME', 'Auth Microservice'),
  frontendUrl: configService.get('FRONTEND_URL', 'http://localhost:3001'),
  emailVerificationUrl:
    configService.get('EMAIL_VERIFICATION_URL') ||
    `${configService.get('FRONTEND_URL', 'http://localhost:3001')}/auth/verify-email`,
  passwordResetUrl:
    configService.get('PASSWORD_RESET_URL') ||
    `${configService.get('FRONTEND_URL', 'http://localhost:3001')}/auth/reset-password`,
  requireEmailVerification: configService.get(
    'REQUIRE_EMAIL_VERIFICATION',
    true,
  ),
  verificationDefaultMode: configService.get(
    'VERIFICATION_DEFAULT_MODE',
    'web',
  ),
});

export type SendGridConfig = ReturnType<typeof getSendGridConfig>;
