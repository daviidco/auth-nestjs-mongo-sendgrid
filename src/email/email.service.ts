import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';
import { EnvConfig } from '../config/env.zod';
import { getSendGridConfig } from '../config/sendgrid.config';
import { getErrorMessage } from '../common/utils';
import {
  ISendEmailParams,
  IEmailResult,
  IEmailVerificationData,
  IPasswordResetData,
  IVerificationOptions,
} from './interfaces/email.interface';
import { emailVerificationTemplate } from './templates/email-verification.template';
import { passwordResetTemplate } from './templates/password-reset.template';
import {
  hybridEmailVerificationTemplate,
  IHybridEmailVerificationData,
} from './templates/hybrid-email-verification.template';
import {
  TemplateModeService,
  VerificationMode,
} from './services/template-mode.service';
import {
  ApiCommandBuilderService,
  IApiCommandConfig,
} from './services/api-command-builder.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly config: ReturnType<typeof getSendGridConfig>;

  constructor(
    private configService: ConfigService<EnvConfig>,
    private templateModeService: TemplateModeService,
    private apiCommandBuilderService: ApiCommandBuilderService,
  ) {
    this.config = getSendGridConfig(this.configService);
    // Only set API key if it's not a demo key
    if (this.config.apiKey && !this.config.apiKey.includes('demo-key')) {
      sgMail.setApiKey(this.config.apiKey);
    } else {
      this.logger.warn(
        'SendGrid API key not configured - email functionality disabled',
      );
    }
  }

  async sendEmail(params: ISendEmailParams): Promise<IEmailResult> {
    // If SendGrid is not configured, simulate success for development
    if (this.config.apiKey && this.config.apiKey.includes('demo-key')) {
      this.logger.log(`[DEMO MODE] Would send email to ${params.to}`, {
        to: params.to,
        subject: params.subject,
      });

      return {
        success: true,
        messageId: 'demo-message-id',
      };
    }

    try {
      const msg = {
        to: params.to,
        from: {
          email: this.config.fromEmail,
          name: this.config.fromName,
        },
        subject: params.subject,
        html: params.html,
        text: params.text,
        ...(params.templateId && {
          templateId: params.templateId,
          dynamicTemplateData: params.dynamicTemplateData,
        }),
      };

      const [response] = await sgMail.send(msg as any);

      this.logger.log(`Email sent successfully to ${params.to}`, {
        messageId: response.headers['x-message-id'],
        to: params.to,
        subject: params.subject,
      });

      return {
        success: true,
        messageId: response.headers['x-message-id'],
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      this.logger.error(`Failed to send email to ${params.to}`, {
        error: errorMessage,
        to: params.to,
        subject: params.subject,
      });

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async sendVerificationEmail(
    email: string,
    name: string,
    verificationToken: string,
  ): Promise<IEmailResult> {
    const verificationUrl = `${this.config.emailVerificationUrl}?token=${verificationToken}&email=${encodeURIComponent(email)}`;

    const templateData: IEmailVerificationData = {
      name,
      verificationUrl,
      expiryHours: 24,
    };

    return this.sendEmail({
      to: email,
      subject: emailVerificationTemplate.subject,
      html: emailVerificationTemplate.html(templateData),
      text: emailVerificationTemplate.text(templateData),
    });
  }

  async sendPasswordResetEmail(
    email: string,
    name: string,
    resetToken: string,
  ): Promise<IEmailResult> {
    const resetUrl = `${this.config.passwordResetUrl}?token=${resetToken}&email=${encodeURIComponent(email)}`;

    const templateData: IPasswordResetData = {
      name,
      resetUrl,
      expiryHours: 1,
    };

    return this.sendEmail({
      to: email,
      subject: passwordResetTemplate.subject,
      html: passwordResetTemplate.html(templateData),
      text: passwordResetTemplate.text(templateData),
    });
  }

  /**
   * Sends a hybrid verification email with mode detection and API command generation
   * @param email - Recipient email address
   * @param name - Recipient name
   * @param verificationToken - Verification token
   * @param userAgent - Optional user agent for mode detection
   * @param ipAddress - Optional IP address for logging
   * @param forceMode - Optional forced verification mode
   * @returns Email sending result
   */
  async sendHybridVerificationEmail(
    email: string,
    name: string,
    verificationToken: string,
    userAgent?: string,
    ipAddress?: string,
    forceMode?: VerificationMode,
  ): Promise<IEmailResult> {
    try {
      // Detect template mode based on user agent and configuration
      const modeDetection = this.templateModeService.detectTemplateMode(
        userAgent,
        ipAddress,
        forceMode,
      );

      this.logger.log('Template mode detected for verification email', {
        email,
        mode: modeDetection.mode,
        reason: modeDetection.reason,
        isApiClient: modeDetection.isApiClient,
        detectedClient: modeDetection.detectedClient,
        userAgent: userAgent?.substring(0, 100),
      });

      // Build verification URL
      const verificationUrl = `${this.config.emailVerificationUrl}?token=${verificationToken}&email=${encodeURIComponent(email)}`;

      // Prepare template data
      const templateData: IHybridEmailVerificationData = {
        name,
        verificationUrl,
        expiryHours: 24,
        mode: modeDetection.mode,
        isApiClient: modeDetection.isApiClient,
        detectedClient: modeDetection.detectedClient,
        token: verificationToken,
        email,
      };

      // Generate API commands if needed
      if (this.shouldGenerateApiCommands(modeDetection.mode)) {
        try {
          templateData.apiCommands = await this.generateApiCommands(
            verificationToken,
            email,
            'verify-email',
          );
          templateData.baseApiUrl =
            this.config.apiVerificationBaseUrl || this.config.frontendUrl;
          templateData.verificationEndpoint = '/auth/verify-email';
        } catch (error) {
          this.logger.warn(
            'Failed to generate API commands for verification email',
            {
              error: getErrorMessage(error),
              email,
              mode: modeDetection.mode,
            },
          );
          // Continue without API commands - fallback to web mode behavior
        }
      }

      // Send email using hybrid template
      return this.sendEmail({
        to: email,
        subject: hybridEmailVerificationTemplate.subject,
        html: hybridEmailVerificationTemplate.html(templateData),
        text: hybridEmailVerificationTemplate.text(templateData),
      });
    } catch (error) {
      this.logger.error('Failed to send hybrid verification email', {
        error: getErrorMessage(error),
        email,
        userAgent: userAgent?.substring(0, 100),
      });

      // Fallback to traditional verification email
      this.logger.log('Falling back to traditional verification email');
      return this.sendVerificationEmail(email, name, verificationToken);
    }
  }

  /**
   * Determines if API commands should be generated based on verification mode
   * @param mode - The detected verification mode
   * @returns Whether to generate API commands
   */
  private shouldGenerateApiCommands(mode: VerificationMode): boolean {
    return (
      this.config.enableApiCommands &&
      (mode === VerificationMode.API || mode === VerificationMode.HYBRID)
    );
  }

  /**
   * Generates API commands for verification
   * @param token - The verification token
   * @param email - The email address
   * @param endpoint - The API endpoint
   * @returns Generated API commands
   */
  private async generateApiCommands(
    token: string,
    email: string,
    endpoint: string,
  ) {
    if (!this.apiCommandBuilderService.isApiCommandGenerationEnabled()) {
      throw new Error('API command generation is disabled');
    }

    const baseUrl =
      this.config.apiVerificationBaseUrl || this.config.frontendUrl;
    const fullEndpoint = `/auth/${endpoint}`;

    const commandConfig: IApiCommandConfig = {
      baseUrl,
      endpoint: fullEndpoint,
      token,
      email,
      timeout: this.config.verificationApiTimeout,
      includeHeaders: true,
      includeVerboseOutput: false,
    };

    return this.apiCommandBuilderService.generateVerificationCommands(
      commandConfig,
    );
  }

  /**
   * Gets verification options based on current configuration
   * @param userAgent - Optional user agent for mode detection
   * @returns Available verification options
   */
  getVerificationOptions(userAgent?: string): IVerificationOptions {
    const modeDetection =
      this.templateModeService.detectTemplateMode(userAgent);

    return {
      defaultMode: modeDetection.mode,
      availableModes: Object.values(VerificationMode),
      isApiClient: modeDetection.isApiClient,
      detectedClient: modeDetection.detectedClient,
      hybridEnabled: this.config.enableHybridVerification,
      apiCommandsEnabled: this.config.enableApiCommands,
      supportedApiTools: this.apiCommandBuilderService.getSupportedTools(),
      verificationMethods:
        this.templateModeService.getVerificationMethodsPriority(
          modeDetection.mode,
        ),
    };
  }
}
