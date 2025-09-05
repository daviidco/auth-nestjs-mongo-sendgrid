import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import {
  VerificationToken,
  VerificationTokenDocument,
} from './schemas/verification-token.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { EmailService } from '../email/email.service';
import { EnvConfig } from '../config/env.zod';
import { VerificationMode } from '../email/services/template-mode.service';
import {
  ICreateVerificationToken,
  IVerifyTokenResult,
  IEmailVerificationResult,
  IPasswordResetResult,
} from './interfaces/verification.interface';

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);
  private readonly EMAIL_TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
  private readonly RESET_TOKEN_EXPIRY = 1 * 60 * 60 * 1000; // 1 hour
  private readonly MAX_TOKENS_PER_USER = 3; // Prevent token flooding

  constructor(
    @InjectModel(VerificationToken.name)
    private verificationTokenModel: Model<VerificationTokenDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private emailService: EmailService,
    private configService: ConfigService<EnvConfig>,
  ) {}

  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async createVerificationToken(
    data: ICreateVerificationToken,
  ): Promise<string> {
    // Clean up expired tokens first
    await this.cleanupExpiredTokens(data.userId, data.type);

    // Check rate limiting - max tokens per user
    const existingTokensCount =
      await this.verificationTokenModel.countDocuments({
        userId: new Types.ObjectId(data.userId),
        type: data.type,
        used: false,
      });

    if (existingTokensCount >= this.MAX_TOKENS_PER_USER) {
      throw new ForbiddenException(
        'Too many pending verification tokens. Please wait before requesting a new one.',
      );
    }

    // Generate secure token
    const plainToken = this.generateSecureToken();
    const hashedToken = await bcrypt.hash(plainToken, 12);

    const expiresAt = new Date(
      Date.now() +
        (data.type === 'email_verification'
          ? this.EMAIL_TOKEN_EXPIRY
          : this.RESET_TOKEN_EXPIRY),
    );

    // Create verification token
    await this.verificationTokenModel.create({
      userId: new Types.ObjectId(data.userId),
      token: hashedToken,
      type: data.type,
      expiresAt,
      email: data.email.toLowerCase(),
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });

    this.logger.log(`Created ${data.type} token for user ${data.userId}`, {
      userId: data.userId,
      email: data.email,
      type: data.type,
      expiresAt,
    });

    return plainToken;
  }

  async verifyToken(
    plainToken: string,
    email: string,
    type: 'email_verification' | 'password_reset',
  ): Promise<IVerifyTokenResult> {
    // Find all non-used tokens for this email and type
    const tokens = await this.verificationTokenModel
      .find({
        email: email.toLowerCase(),
        type,
        used: false,
        expiresAt: { $gt: new Date() },
      })
      .sort({ createdAt: -1 });

    if (tokens.length === 0) {
      return {
        isValid: false,
        message: 'Invalid or expired token',
      };
    }

    // Check if any token matches
    for (const tokenDoc of tokens) {
      const isMatch = await bcrypt.compare(plainToken, tokenDoc.token);
      if (isMatch) {
        // Mark token as used
        await this.verificationTokenModel.updateOne(
          { _id: tokenDoc._id },
          {
            $set: {
              used: true,
              usedAt: new Date(),
            },
          },
        );

        this.logger.log(`Token verified successfully`, {
          userId: tokenDoc.userId,
          email,
          type,
        });

        return {
          isValid: true,
          userId: tokenDoc.userId.toString(),
          email: tokenDoc.email,
        };
      }
    }

    this.logger.warn(`Invalid token attempt`, {
      email,
      type,
      tokenCount: tokens.length,
    });

    return {
      isValid: false,
      message: 'Invalid token',
    };
  }

  async sendVerificationEmail(
    userId: string,
    email: string,
    name: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const token = await this.createVerificationToken({
      userId,
      email,
      type: 'email_verification',
      ipAddress,
      userAgent,
    });

    // Use hybrid verification if enabled
    if (this.configService.get('ENABLE_HYBRID_VERIFICATION', true)) {
      const result = await this.emailService.sendHybridVerificationEmail(
        email,
        name,
        token,
        userAgent,
        ipAddress,
      );

      if (!result.success) {
        this.logger.error(`Failed to send hybrid verification email`, {
          userId,
          email,
          error: result.error,
          userAgent: userAgent?.substring(0, 100),
        });
        throw new BadRequestException('Failed to send verification email');
      }

      this.logger.log(`Hybrid verification email sent successfully`, {
        userId,
        email,
        messageId: result.messageId,
        userAgent: userAgent?.substring(0, 100),
      });
    } else {
      // Fallback to traditional verification email
      const result = await this.emailService.sendVerificationEmail(
        email,
        name,
        token,
      );

      if (!result.success) {
        this.logger.error(`Failed to send verification email`, {
          userId,
          email,
          error: result.error,
        });
        throw new BadRequestException('Failed to send verification email');
      }

      this.logger.log(`Verification email sent successfully`, {
        userId,
        email,
        messageId: result.messageId,
      });
    }
  }

  async verifyEmail(
    token: string,
    email: string,
  ): Promise<IEmailVerificationResult> {
    const verification = await this.verifyToken(
      token,
      email,
      'email_verification',
    );

    if (!verification.isValid) {
      return {
        success: false,
        message: verification.message || 'Invalid verification token',
      };
    }

    // Update user as verified
    const user = await this.userModel.findByIdAndUpdate(
      verification.userId,
      {
        $set: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    this.logger.log(`Email verified successfully`, {
      userId: user._id,
      email: user.email,
    });

    return {
      success: true,
      message: 'Email verified successfully',
      user: {
        id: (user._id as any).toString(),
        email: user.email,
        emailVerified: user.emailVerified,
      },
    };
  }

  async requestPasswordReset(
    email: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const user = await this.userModel.findOne({
      email: email.toLowerCase(),
      isActive: true,
    });

    if (!user) {
      // Don't reveal if email exists - security best practice
      this.logger.warn(`Password reset requested for non-existent email`, {
        email,
        ipAddress,
      });
      return;
    }

    // Update password reset timestamp
    await this.userModel.updateOne(
      { _id: user._id },
      { $set: { passwordResetRequestedAt: new Date() } },
    );

    const token = await this.createVerificationToken({
      userId: (user._id as any).toString(),
      email: user.email,
      type: 'password_reset',
      ipAddress,
      userAgent,
    });

    const result = await this.emailService.sendPasswordResetEmail(
      user.email,
      `${user.firstName} ${user.lastName}`,
      token,
    );

    if (!result.success) {
      this.logger.error(`Failed to send password reset email`, {
        userId: user._id,
        email: user.email,
        error: result.error,
      });
      throw new BadRequestException('Failed to send password reset email');
    }

    this.logger.log(`Password reset email sent successfully`, {
      userId: user._id,
      email: user.email,
      messageId: result.messageId,
    });
  }

  async resetPassword(
    token: string,
    email: string,
    newPassword: string,
  ): Promise<IPasswordResetResult> {
    const verification = await this.verifyToken(token, email, 'password_reset');

    if (!verification.isValid) {
      return {
        success: false,
        message: verification.message || 'Invalid or expired reset token',
      };
    }

    // Hash new password
    const bcryptRounds = this.configService.get('BCRYPT_ROUNDS', 12);
    const hashedPassword = await bcrypt.hash(newPassword, bcryptRounds);

    // Update user password and clear refresh tokens
    const user = await this.userModel.findByIdAndUpdate(
      verification.userId,
      {
        $set: {
          password: hashedPassword,
          refreshTokens: [], // Clear all refresh tokens
          loginAttempts: 0, // Reset login attempts
          lockUntil: null, // Remove any account locks
        },
      },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    this.logger.log(`Password reset successfully`, {
      userId: user._id,
      email: user.email,
    });

    return {
      success: true,
      message: 'Password reset successfully',
    };
  }

  async resendVerificationEmail(
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    await this.sendVerificationEmail(
      userId,
      user.email,
      `${user.firstName} ${user.lastName}`,
      ipAddress,
      userAgent,
    );
  }

  async resendVerificationEmailByEmail(
    email: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const user = await this.userModel.findOne({
      email: email.toLowerCase(),
      isActive: true,
    });

    if (!user) {
      // Don't reveal if email exists - security best practice
      this.logger.warn(`Verification resend requested for non-existent email`, {
        email,
        ipAddress,
      });
      return;
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    await this.sendVerificationEmail(
      (user._id as any).toString(),
      user.email,
      `${user.firstName} ${user.lastName}`,
      ipAddress,
      userAgent,
    );
  }

  /**
   * Gets available verification options based on user agent and configuration
   * @param userAgent - Optional user agent string
   * @returns Verification options and capabilities
   */
  getVerificationOptions(userAgent?: string) {
    return this.emailService.getVerificationOptions(userAgent);
  }

  /**
   * Sends verification email with specific mode override
   * @param userId - User ID
   * @param email - Email address
   * @param name - User name
   * @param mode - Forced verification mode
   * @param ipAddress - Optional IP address
   * @param userAgent - Optional user agent
   * @returns Promise<void>
   */
  async sendVerificationEmailWithMode(
    userId: string,
    email: string,
    name: string,
    mode: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const token = await this.createVerificationToken({
      userId,
      email,
      type: 'email_verification',
      ipAddress,
      userAgent,
    });

    // Validate mode
    if (!Object.values(VerificationMode).includes(mode as VerificationMode)) {
      throw new BadRequestException(`Invalid verification mode: ${mode}`);
    }

    const result = await this.emailService.sendHybridVerificationEmail(
      email,
      name,
      token,
      userAgent,
      ipAddress,
      mode as VerificationMode,
    );

    if (!result.success) {
      this.logger.error(`Failed to send verification email with mode ${mode}`, {
        userId,
        email,
        mode,
        error: result.error,
        userAgent: userAgent?.substring(0, 100),
      });
      throw new BadRequestException('Failed to send verification email');
    }

    this.logger.log(`Verification email sent successfully with mode ${mode}`, {
      userId,
      email,
      mode,
      messageId: result.messageId,
      userAgent: userAgent?.substring(0, 100),
    });
  }

  async sendVerificationEmailWithModeByEmail(
    email: string,
    mode: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const user = await this.userModel.findOne({
      email: email.toLowerCase(),
      isActive: true,
    });

    if (!user) {
      // Don't reveal if email exists - security best practice
      this.logger.warn(
        `Verification resend with mode requested for non-existent email`,
        {
          email,
          mode,
          ipAddress,
        },
      );
      return;
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    await this.sendVerificationEmailWithMode(
      (user._id as any).toString(),
      user.email,
      `${user.firstName} ${user.lastName}`,
      mode,
      ipAddress,
      userAgent,
    );
  }

  private async cleanupExpiredTokens(
    userId: string,
    type: 'email_verification' | 'password_reset',
  ): Promise<void> {
    await this.verificationTokenModel.deleteMany({
      userId: new Types.ObjectId(userId),
      type,
      $or: [{ used: true }, { expiresAt: { $lt: new Date() } }],
    });
  }
}
