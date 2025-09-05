export interface IVerificationToken {
  _id?: string;
  userId: string;
  token: string;
  type: 'email_verification' | 'password_reset';
  expiresAt: Date;
  used: boolean;
  usedAt?: Date;
  email: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateVerificationToken {
  userId: string;
  email: string;
  type: 'email_verification' | 'password_reset';
  ipAddress?: string;
  userAgent?: string;
}

export interface IVerifyTokenResult {
  isValid: boolean;
  userId?: string;
  email?: string;
  message?: string;
}

export interface IEmailVerificationResult {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    emailVerified: boolean;
  };
}

export interface IPasswordResetResult {
  success: boolean;
  message: string;
}
