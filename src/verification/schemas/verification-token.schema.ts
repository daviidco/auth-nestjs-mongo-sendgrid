import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VerificationTokenDocument = VerificationToken & Document;

@Schema({
  timestamps: true,
  collection: 'verification_tokens',
})
export class VerificationToken {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  token: string;

  @Prop({
    required: true,
    enum: ['email_verification', 'password_reset'],
    index: true,
  })
  type: 'email_verification' | 'password_reset';

  @Prop({ required: true, index: true })
  expiresAt: Date;

  @Prop({ default: false })
  used: boolean;

  @Prop({ default: null })
  usedAt: Date;

  @Prop({ required: true, lowercase: true })
  email: string;

  @Prop({ default: null })
  ipAddress: string;

  @Prop({ default: null })
  userAgent: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const VerificationTokenSchema =
  SchemaFactory.createForClass(VerificationToken);

// Compound indexes for better query performance
VerificationTokenSchema.index({ userId: 1, type: 1 });
VerificationTokenSchema.index({ email: 1, type: 1 });
VerificationTokenSchema.index({ createdAt: 1 });

// TTL index for automatic cleanup of expired tokens
VerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
