import { VerificationMode } from '../services/template-mode.service';
import { IApiCommandResult } from '../services/api-command-builder.service';

/**
 * Interface for hybrid email verification template data
 */
export interface IHybridEmailVerificationData {
  name: string;
  verificationUrl: string;
  expiryHours: number;
  mode: VerificationMode;
  apiCommands?: IApiCommandResult;
  isApiClient: boolean;
  detectedClient?: string;
  baseApiUrl?: string;
  verificationEndpoint?: string;
  token: string;
  email: string;
}

/**
 * Hybrid email verification template with mode-aware content generation
 */
export const hybridEmailVerificationTemplate = {
  subject: 'Verify Your Email Address',

  /**
   * Generates HTML content based on verification mode
   * @param data - Template data including mode and API commands
   * @returns HTML content
   */
  html: (data: IHybridEmailVerificationData): string => {
    const baseStyles = `
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background-color: #2c3e50; color: white; padding: 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .button { background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
        .api-section { background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .code-block { background-color: #2d3748; color: #e2e8f0; padding: 15px; border-radius: 6px; font-family: 'Monaco', 'Menlo', 'Consolas', monospace; font-size: 13px; overflow-x: auto; white-space: pre-wrap; word-break: break-all; }
        .api-tool { margin-bottom: 20px; }
        .tool-header { font-weight: bold; color: #2c3e50; margin-bottom: 10px; }
        .notes { font-size: 12px; color: #666; margin-top: 10px; }
        .notes ul { margin: 5px 0; padding-left: 20px; }
        .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { background-color: #ecf0f1; padding: 20px 30px; color: #7f8c8d; font-size: 12px; }
        .mode-badge { background-color: #e74c3c; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
        .web-badge { background-color: #27ae60; }
        .api-badge { background-color: #f39c12; }
        .hybrid-badge { background-color: #9b59b6; }
      </style>
    `;

    let modeClass = 'mode-badge';
    switch (data.mode) {
      case VerificationMode.WEB:
        modeClass += ' web-badge';
        break;
      case VerificationMode.API:
        modeClass += ' api-badge';
        break;
      case VerificationMode.HYBRID:
        modeClass += ' hybrid-badge';
        break;
    }

    const headerSection = `
      <div class="header">
        <h1>Email Verification</h1>
        <span class="${modeClass}">${data.mode.toUpperCase()} MODE</span>
        ${data.detectedClient ? `<p style="margin: 10px 0 0 0; font-size: 14px;">Detected client: ${data.detectedClient}</p>` : ''}
      </div>
    `;

    const greetingSection = `
      <div class="content">
        <h2>Hello ${data.name}!</h2>
        <p>Thank you for registering with our service. To complete your registration, please verify your email address.</p>
        ${
          data.mode === VerificationMode.API
            ? "<p><strong>We detected you're using an API client. You can verify your email using the API commands below.</strong></p>"
            : data.mode === VerificationMode.HYBRID
              ? '<p><strong>You can verify your email using either the web interface or API commands below.</strong></p>'
              : ''
        }
      `;

    let verificationSection = '';

    if (data.mode === VerificationMode.WEB) {
      verificationSection = `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.verificationUrl}" class="button">Verify Email Address</a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #3498db;">${data.verificationUrl}</p>
      `;
    } else if (data.mode === VerificationMode.API) {
      verificationSection = generateApiSection(data);
    } else if (data.mode === VerificationMode.HYBRID) {
      verificationSection = `
        <h3>🌐 Web Verification</h3>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.verificationUrl}" class="button">Verify Email Address</a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #3498db;">${data.verificationUrl}</p>
        
        <h3>🔧 API Verification</h3>
        ${generateApiSection(data)}
      `;
    }

    const warningSection = `
      <div class="warning">
        <strong>⚠️ Important:</strong> This verification link will expire in ${data.expiryHours} hours. 
        If you didn't request this verification, please ignore this email.
      </div>
    `;

    const footerSection = `
      <div class="footer">
        <p>This is an automated email from our authentication system. Please do not reply to this email.</p>
        <p>If you have any questions, please contact our support team.</p>
        <p>Verification Mode: ${data.mode} ${data.detectedClient ? `(${data.detectedClient})` : ''}</p>
      </div>
    `;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        ${baseStyles}
      </head>
      <body>
        <div class="container">
          ${headerSection}
          ${greetingSection}
          ${verificationSection}
          ${warningSection}
          </div>
          ${footerSection}
        </div>
      </body>
      </html>
    `;
  },

  /**
   * Generates text content based on verification mode
   * @param data - Template data including mode and API commands
   * @returns Plain text content
   */
  text: (data: IHybridEmailVerificationData): string => {
    let content = `
EMAIL VERIFICATION (${data.mode.toUpperCase()} MODE)
${data.detectedClient ? `Detected client: ${data.detectedClient}` : ''}

Hello ${data.name}!

Thank you for registering with our service. To complete your registration, please verify your email address.

`;

    if (data.mode === VerificationMode.WEB) {
      content += `
Please click the following link to verify your email:
${data.verificationUrl}

`;
    } else if (data.mode === VerificationMode.API) {
      content += `
We detected you're using an API client. You can verify your email using the following API commands:

${generateApiTextSection(data)}

`;
    } else if (data.mode === VerificationMode.HYBRID) {
      content += `
You can verify your email using either method:

WEB VERIFICATION:
Please click the following link to verify your email:
${data.verificationUrl}

API VERIFICATION:
${generateApiTextSection(data)}

`;
    }

    content += `
⚠️ IMPORTANT: This verification link will expire in ${data.expiryHours} hours.
If you didn't request this verification, please ignore this email.

---
This is an automated email from our authentication system.
Verification Mode: ${data.mode} ${data.detectedClient ? `(${data.detectedClient})` : ''}
    `;

    return content.trim();
  },
};

/**
 * Generates the API section for HTML templates
 * @param data - Template data
 * @returns HTML content for API section
 */
function generateApiSection(data: IHybridEmailVerificationData): string {
  if (!data.apiCommands || !data.apiCommands.commands.length) {
    return '<p>API commands could not be generated at this time.</p>';
  }

  let apiSection = '<div class="api-section">';

  if (data.apiCommands.notes.length > 0) {
    apiSection += '<div class="notes">';
    data.apiCommands.notes.forEach((note) => {
      apiSection += `<p>• ${note}</p>`;
    });
    apiSection += '</div>';
  }

  data.apiCommands.commands.forEach((cmd) => {
    apiSection += `
      <div class="api-tool">
        <div class="tool-header">${cmd.tool.toUpperCase()}</div>
        <div class="code-block">${cmd.command}</div>
        ${
          cmd.notes && cmd.notes.length > 0
            ? `
          <div class="notes">
            <ul>
              ${cmd.notes.map((note) => `<li>${note}</li>`).join('')}
            </ul>
          </div>
        `
            : ''
        }
      </div>
    `;
  });

  apiSection += '</div>';
  return apiSection;
}

/**
 * Generates the API section for text templates
 * @param data - Template data
 * @returns Plain text content for API section
 */
function generateApiTextSection(data: IHybridEmailVerificationData): string {
  if (!data.apiCommands || !data.apiCommands.commands.length) {
    return 'API commands could not be generated at this time.';
  }

  let apiSection = '';

  if (data.apiCommands.notes.length > 0) {
    data.apiCommands.notes.forEach((note) => {
      apiSection += `• ${note}\n`;
    });
    apiSection += '\n';
  }

  data.apiCommands.commands.forEach((cmd, index) => {
    apiSection += `${cmd.tool.toUpperCase()}:\n${cmd.command}\n`;

    if (cmd.notes && cmd.notes.length > 0) {
      cmd.notes.forEach((note) => {
        apiSection += `  • ${note}\n`;
      });
    }

    if (data.apiCommands && index < data.apiCommands.commands.length - 1) {
      apiSection += '\n';
    }
  });

  return apiSection;
}
