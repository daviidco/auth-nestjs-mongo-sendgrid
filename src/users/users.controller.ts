import {
  Controller,
  Get,
  Param,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { toUserResponse } from './mappers/user.mapper';
import { IUserResponse } from './interfaces/user.interface';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { BaseController } from '../common/controllers/base.controller';
import {
  ApiStandardResponse,
  ApiStandardErrorResponses,
} from '../common/decorators/api-standard-response.decorator';
import { BaseResponseDto } from '../common/dto/base-response.dto';
import { RESPONSE_BUILDER } from '../common/providers/response.provider';
import type { IResponseBuilder } from '../common/interfaces/response-builder.interface';

@ApiTags('Users')
@Controller('users')
export class UsersController extends BaseController {
  constructor(
    @Inject(UsersService) private readonly usersService: UsersService,
    @Inject(RESPONSE_BUILDER) responseBuilder: IResponseBuilder,
  ) {
    super(responseBuilder);
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @ApiBearerAuth('JWT-auth')
  @ApiStandardResponse(undefined, {
    description: 'User retrieved successfully',
    message: 'User retrieved successfully',
  })
  @ApiStandardErrorResponses()
  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<BaseResponseDto<IUserResponse>> {
    const user = await this.usersService.findOne(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const userResponse = toUserResponse(user);
    return this.success(userResponse, 'User retrieved successfully');
  }

  @ApiOperation({ summary: 'Get all users' })
  @ApiBearerAuth('JWT-auth')
  @ApiStandardResponse(undefined, {
    description: 'Users retrieved successfully',
    message: 'Users retrieved successfully',
    isArray: true,
  })
  @ApiStandardErrorResponses()
  @Get()
  async findAll(): Promise<BaseResponseDto<IUserResponse[]>> {
    const users = await this.usersService.findAll();
    const usersResponse = users.map(toUserResponse);
    return this.success(usersResponse, 'Users retrieved successfully');
  }
}
