import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import { ModifiersService } from './modifier.service';
import { CreateModifierDto } from './dto/create-modifier.dto';
import { UpdateModifierDto } from './dto/update-modifier.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('modifiers')
@ApiBearerAuth('Bearer')
@Controller('modifiers')
export class ModifiersController {
  constructor(private readonly service: ModifiersService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new modifier',
    description: 'This endpoint creates a new modifier with its options.',
  })
  @ApiCreatedResponse({ description: 'Modifier created successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid input data.' })
  create(@Body() dto: CreateModifierDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve all modifiers',
    description:
      'This endpoint returns a list of all modifiers with their options.',
  })
  @ApiOkResponse({ description: 'Modifiers retrieved successfully.' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve a modifier by ID',
    description: 'This endpoint returns a single modifier based on its UUID.',
  })
  @ApiOkResponse({ description: 'Modifier found and returned successfully.' })
  @ApiNotFoundResponse({ description: 'Modifier not found.' })
  @ApiBadRequestResponse({ description: 'Invalid UUID format.' })
  findOne(
    @Param(
      'id',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: string,
  ) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a modifier by ID',
    description:
      'This endpoint updates an existing modifier, including its name and options.',
  })
  @ApiOkResponse({ description: 'Modifier updated successfully.' })
  @ApiNotFoundResponse({ description: 'Modifier not found.' })
  @ApiBadRequestResponse({ description: 'Invalid UUID or input data.' })
  update(
    @Param(
      'id',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: string,
    @Body() dto: UpdateModifierDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Soft delete a modifier by ID',
    description:
      'This endpoint deactivates a modifier without permanently deleting it.',
  })
  @ApiOkResponse({ description: 'Modifier soft deleted successfully.' })
  @ApiNotFoundResponse({ description: 'Modifier not found.' })
  @ApiBadRequestResponse({ description: 'Invalid UUID format.' })
  remove(
    @Param(
      'id',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: string,
  ) {
    return this.service.remove(id);
  }

  @Post('/restore/:id')
  @ApiOperation({
    summary: 'Restore a soft-deleted modifier by ID',
    description:
      'This endpoint restores a modifier that was previously soft-deleted.',
  })
  @ApiOkResponse({ description: 'Modifier restored successfully.' })
  @ApiNotFoundResponse({ description: 'Modifier not found.' })
  @ApiBadRequestResponse({ description: 'Invalid UUID format.' })
  restore(
    @Param(
      'id',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: string,
  ) {
    return this.service.restore(id);
  }
}
