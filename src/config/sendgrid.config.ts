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
    false,
  ),

  // Hybrid Verification Configuration
  verificationDefaultMode: configService.get(
    'VERIFICATION_DEFAULT_MODE',
    'web',
  ),
  enableHybridVerification: configService.get(
    'ENABLE_HYBRID_VERIFICATION',
    true,
  ),
  apiVerificationBaseUrl: configService.get('API_VERIFICATION_BASE_URL'),
  verificationApiTimeout: configService.get('VERIFICATION_API_TIMEOUT', 30000),

  // API Command Generation Settings
  enableApiCommands: configService.get('ENABLE_API_COMMANDS', true),
  supportedApiTools: configService
    .get('SUPPORTED_API_TOOLS', 'curl,httpie,postman')
    .split(',')
    .map((tool: string) => tool.trim()),
  includeApiExamples: configService.get('INCLUDE_API_EXAMPLES', true),

  // Template Mode Detection
  enableUserAgentDetection: configService.get(
    'ENABLE_USER_AGENT_DETECTION',
    true,
  ),
  fallbackToWebMode: configService.get('FALLBACK_TO_WEB_MODE', true),
  apiClientUserAgents: configService
    .get('API_CLIENT_USER_AGENTS', 'curl,httpie,postman,insomnia,rest-client')
    .split(',')
    .map((agent: string) => agent.trim().toLowerCase()),
});

export type SendGridConfig = ReturnType<typeof getSendGridConfig>;
