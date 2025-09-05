import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '../../config/env.zod';
import { getSendGridConfig } from '../../config/sendgrid.config';
import { getErrorMessage } from '../../common/utils';

/**
 * Supported API tools for command generation
 */
export enum ApiTool {
  CURL = 'curl',
  HTTPIE = 'httpie',
  POSTMAN = 'postman',
}

/**
 * Interface for API command configuration
 */
export interface IApiCommandConfig {
  baseUrl: string;
  endpoint: string;
  token: string;
  email: string;
  timeout?: number;
  includeHeaders?: boolean;
  includeVerboseOutput?: boolean;
}

/**
 * Interface for generated API command
 */
export interface IApiCommand {
  tool: ApiTool;
  command: string;
  description: string;
  notes?: string[];
}

/**
 * Interface for API command generation result
 */
export interface IApiCommandResult {
  commands: IApiCommand[];
  baseUrl: string;
  timeout: number;
  notes: string[];
}

/**
 * Service responsible for generating API commands for email verification
 */
@Injectable()
export class ApiCommandBuilderService {
  private readonly logger = new Logger(ApiCommandBuilderService.name);
  private readonly config: ReturnType<typeof getSendGridConfig>;

  constructor(private configService: ConfigService<EnvConfig>) {
    this.config = getSendGridConfig(this.configService);
  }

  /**
   * Generates API commands for email verification
   * @param config - Configuration for API command generation
   * @returns Generated API commands result
   */
  generateVerificationCommands(config: IApiCommandConfig): IApiCommandResult {
    const commands: IApiCommand[] = [];
    const notes: string[] = [];

    // Validate configuration
    if (!config.baseUrl || !config.endpoint || !config.token || !config.email) {
      throw new Error(
        'Missing required configuration for API command generation',
      );
    }

    const fullUrl = this.buildFullUrl(config.baseUrl, config.endpoint);
    const timeout = config.timeout || this.config.verificationApiTimeout;

    // Generate commands for each supported tool
    for (const toolName of this.config.supportedApiTools) {
      const tool = this.mapToolName(toolName);
      if (tool) {
        try {
          const command = this.generateCommandForTool(
            tool,
            {
              ...config,
              timeout,
            },
            fullUrl,
          );
          commands.push(command);
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          this.logger.warn(`Failed to generate command for tool ${toolName}`, {
            error: errorMessage,
            tool: toolName,
          });
          notes.push(`Failed to generate ${toolName} command: ${errorMessage}`);
        }
      }
    }

    // Add general notes
    notes.unshift(
      'Use any of the following commands to verify your email via API',
      `Verification will expire in 24 hours`,
      'Replace the token and email parameters with your actual values',
    );

    this.logger.log(`Generated ${commands.length} API commands`, {
      tools: commands.map((cmd) => cmd.tool),
      endpoint: config.endpoint,
    });

    return {
      commands,
      baseUrl: config.baseUrl,
      timeout,
      notes,
    };
  }

  /**
   * Generates a password reset API command
   * @param config - Configuration for API command generation
   * @returns Generated API commands result
   */
  generatePasswordResetCommands(config: IApiCommandConfig): IApiCommandResult {
    const commands: IApiCommand[] = [];
    const notes: string[] = [];

    const fullUrl = this.buildFullUrl(config.baseUrl, config.endpoint);
    const timeout = config.timeout || this.config.verificationApiTimeout;

    // Generate commands for each supported tool
    for (const toolName of this.config.supportedApiTools) {
      const tool = this.mapToolName(toolName);
      if (tool) {
        try {
          const command = this.generatePasswordResetCommand(
            tool,
            {
              ...config,
              timeout,
            },
            fullUrl,
          );
          commands.push(command);
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          this.logger.warn(
            `Failed to generate password reset command for tool ${toolName}`,
            {
              error: errorMessage,
              tool: toolName,
            },
          );
          notes.push(`Failed to generate ${toolName} command: ${errorMessage}`);
        }
      }
    }

    // Add specific notes for password reset
    notes.unshift(
      'Use any of the following commands to reset your password via API',
      'Reset token will expire in 1 hour',
      'Replace the token, email, and newPassword with your actual values',
    );

    return {
      commands,
      baseUrl: config.baseUrl,
      timeout,
      notes,
    };
  }

  /**
   * Maps tool name string to ApiTool enum
   * @param toolName - The tool name string
   * @returns Mapped ApiTool or undefined
   */
  private mapToolName(toolName: string): ApiTool | undefined {
    const normalized = toolName.toLowerCase().trim();
    switch (normalized) {
      case 'curl':
        return ApiTool.CURL;
      case 'httpie':
      case 'http':
        return ApiTool.HTTPIE;
      case 'postman':
        return ApiTool.POSTMAN;
      default:
        return undefined;
    }
  }

  /**
   * Builds the full URL from base URL and endpoint
   * @param baseUrl - The base URL
   * @param endpoint - The endpoint path
   * @returns Full URL
   */
  private buildFullUrl(baseUrl: string, endpoint: string): string {
    const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${base}${path}`;
  }

  /**
   * Generates command for specific tool for email verification
   * @param tool - The API tool
   * @param config - The configuration
   * @param fullUrl - The full URL
   * @returns Generated API command
   */
  private generateCommandForTool(
    tool: ApiTool,
    config: IApiCommandConfig,
    fullUrl: string,
  ): IApiCommand {
    switch (tool) {
      case ApiTool.CURL:
        return this.generateCurlCommand(config, fullUrl);
      case ApiTool.HTTPIE:
        return this.generateHttpieCommand(config, fullUrl);
      case ApiTool.POSTMAN:
        return this.generatePostmanCommand(config, fullUrl);
      default:
        throw new Error(`Unsupported API tool: ${tool}`);
    }
  }

  /**
   * Generates cURL command for email verification
   * @param config - The configuration
   * @param fullUrl - The full URL
   * @returns Generated cURL command
   */
  private generateCurlCommand(
    config: IApiCommandConfig,
    fullUrl: string,
  ): IApiCommand {
    const options: string[] = [];

    // Method and URL
    options.push('-X POST');
    options.push(`"${fullUrl}"`);

    // Headers
    if (config.includeHeaders !== false) {
      options.push('-H "Content-Type: application/json"');
      options.push('-H "Accept: application/json"');
    }

    // Body with token and email
    const body = {
      token: config.token,
      email: config.email,
    };
    options.push(`-d '${JSON.stringify(body)}'`);

    // Timeout
    if (config.timeout) {
      options.push(`--max-time ${Math.ceil(config.timeout / 1000)}`);
    }

    // Verbose output if requested
    if (config.includeVerboseOutput) {
      options.push('-v');
    }

    return {
      tool: ApiTool.CURL,
      command: `curl ${options.join(' \\\n  ')}`,
      description: 'Verify email using cURL',
      notes: [
        'Use -v flag for verbose output',
        'Use -i flag to include response headers',
      ],
    };
  }

  /**
   * Generates HTTPie command for email verification
   * @param config - The configuration
   * @param fullUrl - The full URL
   * @returns Generated HTTPie command
   */
  private generateHttpieCommand(
    config: IApiCommandConfig,
    fullUrl: string,
  ): IApiCommand {
    const options: string[] = [];

    // Method and URL
    options.push('POST');
    options.push(`"${fullUrl}"`);

    // Body parameters
    options.push(`token="${config.token}"`);
    options.push(`email="${config.email}"`);

    // Headers
    if (config.includeHeaders !== false) {
      options.push('Content-Type:application/json');
    }

    // Timeout
    if (config.timeout) {
      options.push(`--timeout=${Math.ceil(config.timeout / 1000)}`);
    }

    return {
      tool: ApiTool.HTTPIE,
      command: `http ${options.join(' \\\n  ')}`,
      description: 'Verify email using HTTPie',
      notes: [
        'Use --print=HhBb for verbose output',
        'Use --json to force JSON content type',
      ],
    };
  }

  /**
   * Generates Postman-like command for email verification
   * @param config - The configuration
   * @param fullUrl - The full URL
   * @returns Generated Postman command
   */
  private generatePostmanCommand(
    config: IApiCommandConfig,
    fullUrl: string,
  ): IApiCommand {
    const command = {
      method: 'POST',
      url: fullUrl,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: {
        token: config.token,
        email: config.email,
      },
      timeout: config.timeout || 30000,
    };

    return {
      tool: ApiTool.POSTMAN,
      command: JSON.stringify(command, null, 2),
      description: 'Verify email using Postman (JSON request)',
      notes: [
        'Import this JSON into Postman as a request',
        'Or use it with newman CLI: newman run collection.json',
      ],
    };
  }

  /**
   * Generates password reset command for specific tool
   * @param tool - The API tool
   * @param config - The configuration
   * @param fullUrl - The full URL
   * @returns Generated API command
   */
  private generatePasswordResetCommand(
    tool: ApiTool,
    config: IApiCommandConfig,
    fullUrl: string,
  ): IApiCommand {
    const baseCommand = this.generateCommandForTool(tool, config, fullUrl);

    // Modify the command to include password reset specific fields
    switch (tool) {
      case ApiTool.CURL:
        baseCommand.command = baseCommand.command.replace(
          /-d '{"token":"[^"]+","email":"[^"]+"}'/,
          `-d '{"token":"${config.token}","email":"${config.email}","newPassword":"YOUR_NEW_PASSWORD"}'`,
        );
        break;

      case ApiTool.HTTPIE:
        baseCommand.command += ` newPassword="YOUR_NEW_PASSWORD"`;
        break;

      case ApiTool.POSTMAN:
        const postmanConfig = JSON.parse(baseCommand.command);
        postmanConfig.body.newPassword = 'YOUR_NEW_PASSWORD';
        baseCommand.command = JSON.stringify(postmanConfig, null, 2);
        break;
    }

    baseCommand.description = baseCommand.description.replace(
      'Verify email',
      'Reset password',
    );

    return baseCommand;
  }

  /**
   * Escapes special characters for shell commands
   * @param input - The input string to escape
   * @returns Escaped string
   */
  private escapeShellString(input: string): string {
    return input.replace(/(["\$`\\])/g, '\\$1');
  }

  /**
   * Validates if the API command generation is enabled
   * @returns Whether API command generation is enabled
   */
  isApiCommandGenerationEnabled(): boolean {
    return this.config.enableApiCommands;
  }

  /**
   * Gets the list of supported API tools
   * @returns Array of supported tool names
   */
  getSupportedTools(): string[] {
    return this.config.supportedApiTools;
  }
}
