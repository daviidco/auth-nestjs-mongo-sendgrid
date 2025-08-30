import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

@Injectable()
export class TokenUtil {
  generateTokenId(): string {
    return randomBytes(16).toString('hex');
  }

  generateSecureToken(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }
}
