import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { toUserResponse } from './mappers/user.mapper';
import { IUserResponse } from './interfaces/user.interface';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth('JWT-auth')
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IUserResponse> {
    const user = await this.usersService.findOne(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return toUserResponse(user);
  }

  @ApiBearerAuth('JWT-auth')
  @Get()
  async findAll(): Promise<IUserResponse[]> {
    const users = await this.usersService.findAll();
    return users.map(toUserResponse);
  }
}
