import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { EnvConfig } from 'src/config/env.zod';

@Injectable()
export class PasswordUtil {
  constructor(private configService: ConfigService<EnvConfig>) {}

  async hashPassword(password: string): Promise<string> {
    const saltRounds = this.configService.getOrThrow('BCRYPT_ROUNDS', {
      infer: true,
    });
    return bcrypt.hash(password, saltRounds);
  }

  async comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
