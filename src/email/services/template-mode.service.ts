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
   * Detects the appropriate verification mode based on user agent and request context
   * @param userAgent - The user agent string from the request
   * @param ipAddress - Optional IP address for additional context
   * @param forceMode - Optional forced mode override
   * @returns Template mode detection result
   */
  detectTemplateMode(
    userAgent?: string,
    ipAddress?: string,
    forceMode?: VerificationMode,
  ): ITemplateModeResult {
    // If force mode is specified, use it
    if (forceMode) {
      this.logger.log(`Using forced verification mode: ${forceMode}`, {
        userAgent,
        ipAddress,
        forceMode,
      });

      return {
        mode: forceMode,
        reason: 'Forced mode override',
        isApiClient: forceMode === VerificationMode.API,
        detectedClient:
          forceMode === VerificationMode.API ? 'manual' : undefined,
      };
    }

    // If user agent detection is disabled, use default mode
    if (!this.config.enableUserAgentDetection) {
      const defaultMode = this.config
        .verificationDefaultMode as VerificationMode;

      this.logger.log(
        `User agent detection disabled, using default mode: ${defaultMode}`,
      );

      return {
        mode: defaultMode,
        reason: 'User agent detection disabled',
        isApiClient: false,
      };
    }

    // If no user agent provided, fallback to web mode or default
    if (!userAgent) {
      const fallbackMode = this.config.fallbackToWebMode
        ? VerificationMode.WEB
        : (this.config.verificationDefaultMode as VerificationMode);

      this.logger.log(
        `No user agent provided, using fallback mode: ${fallbackMode}`,
      );

      return {
        mode: fallbackMode,
        reason: 'No user agent provided',
        isApiClient: false,
      };
    }

    // Detect API clients from user agent
    const apiDetectionResult = this.detectApiClient(userAgent);

    if (apiDetectionResult.isApiClient) {
      // If hybrid verification is enabled and client is detected, use hybrid mode
      if (this.config.enableHybridVerification) {
        this.logger.log(`API client detected, using hybrid mode`, {
          userAgent,
          detectedClient: apiDetectionResult.detectedClient,
        });

        return {
          mode: VerificationMode.HYBRID,
          reason: `API client detected: ${apiDetectionResult.detectedClient}`,
          isApiClient: true,
          detectedClient: apiDetectionResult.detectedClient,
        };
      } else {
        // If hybrid is disabled, use API mode
        this.logger.log(
          `API client detected, using API mode (hybrid disabled)`,
          {
            userAgent,
            detectedClient: apiDetectionResult.detectedClient,
          },
        );

        return {
          mode: VerificationMode.API,
          reason: `API client detected: ${apiDetectionResult.detectedClient}`,
          isApiClient: true,
          detectedClient: apiDetectionResult.detectedClient,
        };
      }
    }

    // Default to web mode for regular browsers
    this.logger.log(`Regular browser detected, using web mode`, {
      userAgent: userAgent.substring(0, 100), // Truncate for logging
    });

    return {
      mode: VerificationMode.WEB,
      reason: 'Regular browser user agent',
      isApiClient: false,
    };
  }

  /**
   * Detects if the user agent represents an API client
   * @param userAgent - The user agent string to analyze
   * @returns Detection result with client information
   */
  private detectApiClient(userAgent: string): {
    isApiClient: boolean;
    detectedClient?: string;
  } {
    if (!userAgent) {
      return { isApiClient: false };
    }

    const lowerUserAgent = userAgent.toLowerCase();

    // Check against configured API client user agents
    for (const apiClient of this.config.apiClientUserAgents) {
      if (lowerUserAgent.includes(apiClient)) {
        return {
          isApiClient: true,
          detectedClient: apiClient,
        };
      }
    }

    // Additional patterns for API clients not explicitly configured
    const apiPatterns = [
      /^curl\/[\d.]+$/i,
      /^httpie\/[\d.]+$/i,
      /^postman-runtime\/[\d.]+$/i,
      /^insomnia\/[\d.]+$/i,
      /^rest-client$/i,
      /^python-requests\/[\d.]+$/i,
      /^node-fetch\/[\d.]+$/i,
      /^axios\/[\d.]+$/i,
      /api[-_]?client/i,
      /rest[-_]?client/i,
      /http[-_]?client/i,
    ];

    for (const pattern of apiPatterns) {
      if (pattern.test(userAgent)) {
        return {
          isApiClient: true,
          detectedClient: 'api-pattern-match',
        };
      }
    }

    return { isApiClient: false };
  }

  /**
   * Determines if API capabilities should be included in the response
   * @param mode - The detected verification mode
   * @param userAgent - Optional user agent for additional checks
   * @returns Whether to include API capabilities
   */
  shouldIncludeApiCapabilities(
    mode: VerificationMode,
    userAgent?: string,
  ): boolean {
    // Always include for API and hybrid modes
    if (mode === VerificationMode.API || mode === VerificationMode.HYBRID) {
      return true;
    }

    // For web mode, only include if API commands are enabled
    return this.config.enableApiCommands && this.config.includeApiExamples;
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
