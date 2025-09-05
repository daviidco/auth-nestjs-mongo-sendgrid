import { IUserResponse } from 'src/users/interfaces/user.interface';

export interface IAuthResponse {
  user: IUserResponse;
  accessToken: string;
  refreshToken: string;
  emailVerificationSent?: boolean;
}

export interface ITokenPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface IRefreshTokenPayload {
  sub: string;
  tokenId: string;
  iat?: number;
  exp?: number;
}
