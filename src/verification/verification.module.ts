import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';
import { EmailModule } from '../email/email.module';
import { CommonModule } from '../common/common.module';
import {
  VerificationToken,
  VerificationTokenSchema,
} from './schemas/verification-token.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    CommonModule,
    ConfigModule,
    ThrottlerModule,
    EmailModule,
    MongooseModule.forFeature([
      { name: VerificationToken.name, schema: VerificationTokenSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [VerificationController],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
