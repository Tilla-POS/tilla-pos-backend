import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { SaleService } from './sale.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import { ActiveUser as ActiveUserInterface } from '../auth/interfaces/active-user.inteface';

@ApiTags('sales')
@ApiBearerAuth('Bearer')
@Controller('sales')
@UseInterceptors(ClassSerializerInterceptor)
export class SaleController {
  constructor(private readonly saleService: SaleService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new sale',
    description:
      'Creates a new sale record with line items and optional customer details.',
  })
  @ApiCreatedResponse({ description: 'Sale created successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid input data.' })
  @ApiNotFoundResponse({
    description: 'User, business, variant, or modifier set not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error occurred.',
  })
  create(
    @Body() createSaleDto: CreateSaleDto,
    @ActiveUser() user: ActiveUserInterface,
  ) {
    return this.saleService.create(createSaleDto, user);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all sales',
    description:
      "Fetches a list of all sales records for the authenticated user's business.",
  })
  @ApiOkResponse({ description: 'Sales retrieved successfully.' })
  findAll(@ActiveUser() user: ActiveUserInterface) {
    return this.saleService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get sale by ID',
    description: 'Fetches details of a specific sale by its ID.',
  })
  @ApiOkResponse({ description: 'Sale found and returned successfully.' })
  @ApiNotFoundResponse({ description: 'Sale not found.' })
  @ApiBadRequestResponse({ description: 'Invalid UUID format.' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @ActiveUser() user: ActiveUserInterface,
  ) {
    return this.saleService.findOne(id, user);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete sale by ID',
    description: 'Deletes a specific sale by its ID.',
  })
  @ApiOkResponse({ description: 'Sale deleted successfully.' })
  @ApiNotFoundResponse({ description: 'Sale not found.' })
  @ApiBadRequestResponse({ description: 'Invalid UUID format.' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @ActiveUser() user: ActiveUserInterface,
  ) {
    return this.saleService.remove(id, user);
  }
}
