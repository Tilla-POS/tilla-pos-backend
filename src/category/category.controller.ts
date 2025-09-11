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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CategoriesService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('categories')
@ApiBearerAuth('Bearer')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new category for a business',
    description:
      'This endpoint creates a new category and associates it with a business. It supports image upload.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({ description: 'Category created successfully.' })
  @ApiBadRequestResponse({
    description: 'Invalid business ID or missing image.',
  })
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() dto: CreateCategoryDto,
    @ActiveUser(
      'businessId',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    businessId: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.service.create(dto, businessId, file);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all categories',
    description: 'This endpoint retrieves all categories.',
  })
  @ApiOkResponse({ description: 'Categories retrieved successfully.' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a category by ID',
    description: 'This endpoint retrieves a single category by its UUID.',
  })
  @ApiOkResponse({ description: 'Category retrieved successfully.' })
  @ApiNotFoundResponse({ description: 'Category not found.' })
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
    summary: 'Update a category by ID',
    description:
      'This endpoint updates a category, including its name or image.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({ description: 'Category updated successfully.' })
  @ApiNotFoundResponse({ description: 'Category not found.' })
  @ApiBadRequestResponse({ description: 'Invalid UUID or input data.' })
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param(
      'id',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: string,
    @Body() dto: UpdateCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.service.update(id, dto, file);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Soft delete a category by ID',
    description: 'This endpoint soft deletes a category.',
  })
  @ApiOkResponse({ description: 'Category soft deleted successfully.' })
  @ApiNotFoundResponse({ description: 'Category not found.' })
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
}
