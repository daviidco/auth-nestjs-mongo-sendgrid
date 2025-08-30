import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ required: true, trim: true, minlength: 2, maxlength: 50 })
  firstName: string;

  @Prop({ required: true, trim: true, minlength: 2, maxlength: 50 })
  lastName: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  })
  email: string;

  @Prop({ required: true, minlength: 8 })
  password: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 'user' })
  role: string;

  @Prop({ type: [String], default: [] })
  refreshTokens: string[];

  @Prop({ default: null })
  lastLogin: Date;

  @Prop({ default: 0 })
  loginAttempts: number;

  @Prop({ default: null })
  lockUntil: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Índices para optimizar consultas
UserSchema.index({ isActive: 1 });
UserSchema.index({ createdAt: -1 });

// Virtual para cuenta bloqueada
UserSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil.getTime() > Date.now());
});
