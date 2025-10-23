import {
  Body,
  ClassSerializerInterceptor,
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
import { BusinessesService } from './businesses.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { FileInterceptor } from '@nestjs/platform-express';
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

@ApiTags('businesses')
@ApiBearerAuth('Bearer')
@Controller('businesses')
@UseInterceptors(ClassSerializerInterceptor)
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new business with an image',
    description:
      'This endpoint creates a new business and handles the image upload.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({ description: 'Business created successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid input data.' })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error occurred.',
  })
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() createBusinessDto: CreateBusinessDto,
    @UploadedFile() file: Express.Multer.File,
    @ActiveUser(
      'sub',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    user: string,
  ) {
    return this.businessesService.create(createBusinessDto, file, user);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve all businesses',
    description: 'This endpoint returns a list of all businesses.',
  })
  @ApiOkResponse({ description: 'List of businesses retrieved successfully.' })
  findAll() {
    return this.businessesService.findAll();
  }

  @Get('me')
  @ApiOperation({
    summary: 'Retrieve the business of the active user',
    description:
      'This endpoint returns the business associated with the currently authenticated user.',
  })
  @ApiOkResponse({
    description: 'Business of the active user retrieved successfully.',
  })
  findMyBusiness(
    @ActiveUser(
      'businessId',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    businessId: string,
  ) {
    return this.businessesService.findOne(businessId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve a business by ID',
    description: 'This endpoint returns a single business based on its UUID.',
  })
  @ApiOkResponse({ description: 'Business found and returned successfully.' })
  @ApiNotFoundResponse({ description: 'Business not found.' })
  @ApiBadRequestResponse({ description: 'Invalid UUID format.' })
  findOne(
    @Param(
      'id',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: string,
  ) {
    return this.businessesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a business by ID',
    description:
      'This endpoint updates an existing business, including its image.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({ description: 'Business updated successfully.' })
  @ApiNotFoundResponse({ description: 'Business not found.' })
  @ApiBadRequestResponse({ description: 'Invalid UUID or input data.' })
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param(
      'id',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: string,
    @Body() updateBusinessDto: UpdateBusinessDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.businessesService.update(id, updateBusinessDto, file);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Soft delete a business by ID',
    description:
      'This endpoint deactivates a business without permanently deleting it.',
  })
  @ApiOkResponse({ description: 'Business soft deleted successfully.' })
  @ApiNotFoundResponse({ description: 'Business not found.' })
  @ApiBadRequestResponse({ description: 'Invalid UUID format.' })
  remove(
    @Param(
      'id',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: string,
  ) {
    return this.businessesService.remove(id);
  }

  @Post('/restore/:id')
  @ApiOperation({
    summary: 'Restore a soft-deleted business by ID',
    description:
      'This endpoint restores a business that was previously soft-deleted.',
  })
  @ApiOkResponse({ description: 'Business restored successfully.' })
  @ApiNotFoundResponse({ description: 'Business not found.' })
  @ApiBadRequestResponse({ description: 'Invalid UUID format.' })
  restore(
    @Param(
      'id',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: string,
  ) {
    return this.businessesService.restore(id);
  }
}
