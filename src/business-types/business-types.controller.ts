import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { BusinessTypesService } from './business-types.service';
import { CreateBusinessTypeDto } from './dto/create-business-type.dto';
import { UpdateBusinessTypeDto } from './dto/update-business-type.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Business Types')
@ApiBearerAuth('Bearer')
@Controller('business-types')
export class BusinessTypesController {
  constructor(private readonly businessTypesService: BusinessTypesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new business type',
    description: 'This endpoint allows you to create a new business type.',
  })
  @ApiResponse({
    status: 201,
    description: 'The business type has been successfully created.',
  })
  create(@Body() createBusinessTypeDto: CreateBusinessTypeDto) {
    return this.businessTypesService.create(createBusinessTypeDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve all business types',
    description: 'This endpoint returns a list of all business types.',
  })
  @ApiResponse({
    status: 200,
    description: 'A list of business types has been successfully retrieved.',
  })
  findAll() {
    return this.businessTypesService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve a business type by ID',
    description: 'This endpoint returns a specific business type by its ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'The business type has been successfully retrieved.',
  })
  findOne(
    @Param(
      'id',
      new ParseUUIDPipe({
        errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE,
      }),
    )
    id: string,
  ) {
    return this.businessTypesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a business type by ID',
    description:
      'This endpoint allows you to update a business type by its ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'The business type has been successfully updated.',
  })
  update(
    @Param(
      'id',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: string,
    @Body() updateBusinessTypeDto: UpdateBusinessTypeDto,
  ) {
    return this.businessTypesService.update(id, updateBusinessTypeDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a business type by ID',
    description:
      'This endpoint allows you to delete a business type by its ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'The business type has been successfully deleted.',
  })
  remove(
    @Param(
      'id',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: string,
  ) {
    return this.businessTypesService.remove(id);
  }

  @Post('restore/:id')
  @ApiOperation({
    summary: 'Restore a deleted business type by ID',
    description:
      'This endpoint allows you to restore a previously deleted business type by its ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'The business type has been successfully restored.',
  })
  restore(
    @Param(
      'id',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: string,
  ) {
    return this.businessTypesService.restore(id);
  }
}
