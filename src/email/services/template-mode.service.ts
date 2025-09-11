import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '../../config/env.zod';
import { getSendGridConfig } from '../../config/sendgrid.config';

/**
 * Enum defining different verification modes for email templates
 */
export enum VerificationMode {
  WEB = 'web',
  API = 'api',
  HYBRID = 'hybrid',
}

/**
 * Interface for template mode detection result
 */
export interface ITemplateModeResult {
  mode: VerificationMode;
  reason: string;
  isApiClient: boolean;
  detectedClient?: string;
}

/**
 * Service responsible for detecting the appropriate template mode based on user agent and request context
 */
@Injectable()
export class TemplateModeService {
  private readonly logger = new Logger(TemplateModeService.name);
  private readonly config: ReturnType<typeof getSendGridConfig>;

  constructor(private configService: ConfigService<EnvConfig>) {
    this.config = getSendGridConfig(this.configService);
  }

  /**
   * Detects the appropriate verification mode based on configuration
   * @param forceMode - Optional forced mode override
   * @returns Template mode detection result
   */
  detectTemplateMode(forceMode?: VerificationMode): ITemplateModeResult {
    // If force mode is specified, use it
    if (forceMode) {
      this.logger.log(`Using forced verification mode: ${forceMode}`);

      return {
        mode: forceMode,
        reason: 'Forced mode override',
        isApiClient: forceMode === VerificationMode.API,
        detectedClient:
          forceMode === VerificationMode.API ? 'manual' : undefined,
      };
    }

    // Use configured default mode from environment
    const defaultMode = this.config.verificationDefaultMode as VerificationMode;

    this.logger.log(`Using configured verification mode: ${defaultMode}`);

    return {
      mode: defaultMode,
      reason: 'Environment configuration',
      isApiClient: defaultMode === VerificationMode.API,
      detectedClient:
        defaultMode === VerificationMode.API ? 'configured' : undefined,
    };
  }

  /**
   * Determines if API capabilities should be included in the response
   * @param mode - The detected verification mode
   * @returns Whether to include API capabilities
   */
  shouldIncludeApiCapabilities(mode: VerificationMode): boolean {
    // Include API capabilities for API and hybrid modes
    return mode === VerificationMode.API || mode === VerificationMode.HYBRID;
  }

  /**
   * Gets the priority order for verification methods based on the detected mode
   * @param mode - The detected verification mode
   * @returns Array of verification methods in priority order
   */
  getVerificationMethodsPriority(mode: VerificationMode): string[] {
    switch (mode) {
      case VerificationMode.API:
        return ['api', 'web'];
      case VerificationMode.HYBRID:
        return ['api', 'web'];
      case VerificationMode.WEB:
      default:
        return ['web', 'api'];
    }
  }

  /**
   * Validates if a verification mode is supported
   * @param mode - The mode to validate
   * @returns Whether the mode is supported
   */
  isModeSupported(mode: string): mode is VerificationMode {
    return Object.values(VerificationMode).includes(mode as VerificationMode);
  }
}
