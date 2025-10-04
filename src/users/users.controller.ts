import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  HttpCode,
  UseInterceptors,
  ClassSerializerInterceptor,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { PatchUserDto, PutUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import { ActiveUser as ActiveUserInterface } from '../auth/interfaces/active-user.inteface';
import { CurrentUserResponseDto } from './dto/current-user-response.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
@ApiTags('users')
@ApiBearerAuth('Bearer')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new user',
    description:
      'This endpoint allows you to create a new user with the provided details.',
  })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve all users',
    description: 'This endpoint returns a list of all registered users.',
  })
  @ApiResponse({
    status: 200,
    description: 'A list of users has been successfully retrieved.',
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  @ApiOperation({
    summary: 'Get current authenticated user',
    description:
      'This endpoint returns the details of the currently authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'The current user has been successfully retrieved.',
    type: CurrentUserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token.',
  })
  getCurrentUser(
    @ActiveUser() user: ActiveUserInterface,
  ): Promise<CurrentUserResponseDto> {
    return this.usersService.getCurrentUser(user);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve a user by ID',
    description:
      'This endpoint returns the details of a user specified by their ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully retrieved.',
  })
  @ApiQuery({
    name: 'id',
    description: 'The ID of the user to retrieve',
    required: true,
    type: String,
  })
  findOne(
    @Param(
      'id',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: string,
  ) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a user by ID',
    description:
      'This endpoint allows you to update the details of a user specified by their ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the user to update',
    required: true,
    type: String,
  })
  updateAll(
    @Param(
      'id',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: string,
    @Body() updateUserDto: PutUserDto,
  ) {
    return this.usersService.put(id, updateUserDto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a user by ID',
    description:
      'This endpoint allows you to update the details partially of a user specified by their ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the user to update',
    required: true,
    type: String,
  })
  update(
    @Param(
      'id',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: string,
    @Body() updateUserDto: PatchUserDto,
  ) {
    return this.usersService.patch(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a user by ID',
    description:
      'This endpoint allows you to delete a user specified by their ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully deleted.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the user to delete',
    required: true,
    type: String,
  })
  remove(
    @Param(
      'id',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: string,
  ) {
    return this.usersService.remove(id);
  }

  @Post('restore/:id')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Restore a soft-deleted user by ID',
    description:
      'This endpoint allows you to restore a user that has been soft-deleted, specified by their ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully restored.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the user to restore',
    required: true,
    type: String,
  })
  restore(
    @Param(
      'id',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: string,
  ) {
    return this.usersService.restore(id);
  }
}
