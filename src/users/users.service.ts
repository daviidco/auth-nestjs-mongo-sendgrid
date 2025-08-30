import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { RegisterDto } from '../auth/dto/register.dto';
import { PasswordUtil } from '../utils/password.util';
import { IUserResponse } from './interfaces/user.interface';

@Injectable()
export class UsersService {
  private readonly maxLoginAttempts = 5;
  private readonly lockTime = 2 * 60 * 60 * 1000; // 2 horas

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private passwordUtil: PasswordUtil,
  ) {}

  async create(registerDto: RegisterDto): Promise<IUserResponse> {
    const existingUser = await this.userModel.findOne({
      email: registerDto.email,
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await this.passwordUtil.hashPassword(
      registerDto.password,
    );

    const user = new this.userModel({
      ...registerDto,
      password: hashedPassword,
    });

    const savedUser = await user.save();
    return savedUser.toJSON() as IUserResponse;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email, isActive: true }).exec();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findOne(id: string): Promise<UserDocument | null> {
    return this.findById(id);
  }

  async updateRefreshTokens(
    userId: string,
    refreshTokens: string[],
  ): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { refreshTokens });
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      lastLogin: new Date(),
      $unset: { loginAttempts: 1, lockUntil: 1 },
    });
  }

  async incrementLoginAttempts(userId: string): Promise<void> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updates: any = { $inc: { loginAttempts: 1 } };

    if (user.loginAttempts + 1 >= this.maxLoginAttempts && !user.lockUntil) {
      updates.$set = { lockUntil: Date.now() + this.lockTime };
    }

    await this.userModel.findByIdAndUpdate(userId, updates);
  }

  async isAccountLocked(user: UserDocument): Promise<boolean> {
    if (user.lockUntil && user.lockUntil > new Date()) {
      return true;
    }

    // Reset si el lock ha expirado
    if (user.lockUntil && user.lockUntil <= new Date()) {
      await this.userModel.findByIdAndUpdate(user._id, {
        $unset: { loginAttempts: 1, lockUntil: 1 },
      });
    }

    return false;
  }

  async removeRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $pull: { refreshTokens: refreshToken },
    });
  }
}
