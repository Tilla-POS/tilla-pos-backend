import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpStatus,
  ParseUUIDPipe,
  ClassSerializerInterceptor,
  UseInterceptors,
  Patch,
  Delete,
} from '@nestjs/common';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { CreateVariantDto } from './dto/create-variant.dto';

@ApiTags('items')
@ApiBearerAuth('Bearer')
@Controller('items')
@UseInterceptors(ClassSerializerInterceptor)
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new item with an optional image',
    description:
      'This endpoint creates a new item, and can include multiple variants with their own optional images and SKUs.',
  })
  @ApiConsumes('application/json')
  @ApiCreatedResponse({ description: 'Item created successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid input data.' })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error occurred.',
  })
  create(
    @Body() createItemDto: CreateItemDto,
    @ActiveUser(
      'sub',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    userId: string,
    @ActiveUser(
      'businessId',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    businessId: string,
  ) {
    return this.itemsService.create(createItemDto, userId, businessId);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve all items',
    description: 'This endpoint returns a list of all items.',
  })
  @ApiOkResponse({ description: 'List of items retrieved successfully.' })
  findAll() {
    return this.itemsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve an item by ID',
    description: 'This endpoint returns a single item based on its UUID.',
  })
  @ApiOkResponse({ description: 'Item found and returned successfully.' })
  @ApiNotFoundResponse({ description: 'Item not found.' })
  @ApiBadRequestResponse({ description: 'Invalid UUID format.' })
  findOne(
    @Param(
      'id',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: string,
  ) {
    return this.itemsService.findOne(id);
  }

  @Get('variant/:id')
  @ApiOperation({
    summary: 'Retrieve a variant by ID',
    description: 'This endpoint returns a single variant based on its UUID.',
  })
  @ApiOkResponse({ description: 'Variant found and returned successfully.' })
  @ApiNotFoundResponse({ description: 'Variant not found.' })
  @ApiBadRequestResponse({ description: 'Invalid UUID format.' })
  findVariantById(
    @Param(
      'id',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: string,
  ) {
    return this.itemsService.findVariantDetailById(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an item by ID',
    description: 'This endpoint updates an existing item based on its UUID.',
  })
  @ApiOkResponse({ description: 'Item updated successfully.' })
  @ApiNotFoundResponse({ description: 'Item not found.' })
  @ApiBadRequestResponse({ description: 'Invalid UUID format.' })
  update(
    @Param(
      'id',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: string,
    @Body() updateItemDto: UpdateItemDto,
  ) {
    return this.itemsService.updateItemById(id, updateItemDto);
  }

  @Post(':id/variants')
  @ApiOperation({
    summary: 'Add a new variant to an existing item',
    description:
      'This endpoint adds a new variant to an existing item based on the item UUID.',
  })
  @ApiCreatedResponse({ description: 'Variant added successfully.' })
  @ApiNotFoundResponse({ description: 'Item not found.' })
  @ApiBadRequestResponse({ description: 'Invalid UUID format.' })
  @ApiConsumes('application/json')
  @ApiInternalServerErrorResponse({
    description: 'Internal server error occurred.',
  })
  addVariant(
    @Param(
      'id',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: string,
    @Body() createVariantDto: CreateVariantDto,
    @ActiveUser(
      'sub',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    userId: string,
  ) {
    return this.itemsService.addVariantToItem(id, createVariantDto, userId);
  }

  @Patch(':id/variant/:variantId')
  @ApiOperation({
    summary: 'Update a variant by ID',
    description: 'This endpoint updates an existing variant based on its UUID.',
  })
  @ApiOkResponse({ description: 'Variant updated successfully.' })
  @ApiNotFoundResponse({ description: 'Variant not found.' })
  @ApiBadRequestResponse({ description: 'Invalid UUID format.' })
  updateVariant(
    @Param(
      'id',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: string,
    @Param(
      'variantId',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    variantId: string,
    @Body() updateItemDto: UpdateVariantDto,
    @ActiveUser(
      'sub',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    userId: string,
  ) {
    return this.itemsService.updateVariantById(
      id,
      variantId,
      updateItemDto,
      userId,
    );
  }

  @Delete(':id/variant/:variantId')
  @ApiOperation({
    summary: 'Delete a variant by ID',
    description: 'This endpoint deletes an existing variant based on its UUID.',
  })
  @ApiOkResponse({ description: 'Variant deleted successfully.' })
  @ApiNotFoundResponse({ description: 'Variant not found.' })
  @ApiBadRequestResponse({ description: 'Invalid UUID format.' })
  deleteVariant(
    @Param(
      'id',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: string,
    @Param(
      'variantId',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    variantId: string,
    @ActiveUser(
      'sub',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    userId: string,
  ) {
    return this.itemsService.deleteVariantById(id, variantId, userId);
  }
}
