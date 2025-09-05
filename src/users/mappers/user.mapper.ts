import { IUserResponse } from '../interfaces/user.interface';
import { UserDocument } from '../schemas/user.schema';

export function toUserResponse(user: UserDocument): IUserResponse {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    emailVerified: user.emailVerified,
    emailVerifiedAt: user.emailVerifiedAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
