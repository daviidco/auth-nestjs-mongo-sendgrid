export interface IUser {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isActive: boolean;
  role: string;
  refreshTokens: string[];
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  emailVerified: boolean;
  emailVerifiedAt?: Date;
  passwordResetRequestedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  role: string;
  lastLogin?: Date;
  emailVerified: boolean;
  emailVerifiedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
