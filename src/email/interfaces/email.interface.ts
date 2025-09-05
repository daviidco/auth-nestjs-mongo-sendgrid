export interface ISendEmailParams {
  to: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, any>;
  subject?: string;
  html?: string;
  text?: string;
}

export interface IEmailVerificationData {
  name: string;
  verificationUrl: string;
  expiryHours: number;
}

export interface IPasswordResetData {
  name: string;
  resetUrl: string;
  expiryHours: number;
}

export interface IEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface IVerificationOptions {
  defaultMode: string;
  availableModes: string[];
  isApiClient: boolean;
  detectedClient?: string;
  hybridEnabled: boolean;
  apiCommandsEnabled: boolean;
  supportedApiTools: string[];
  verificationMethods: string[];
}
