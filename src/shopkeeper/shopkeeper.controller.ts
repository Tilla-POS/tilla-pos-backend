import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { ShopkeeperService } from './shopkeeper.service';
import { CreateShopkeeperDto } from './dto/create-shopkeeper.dto';
import { UpdateShopkeeperDto } from './dto/update-shopkeeper.dto';
import { GetShopkeeperDto } from './dto/get-shopkeeper.dto';

@Controller('shopkeeper')
export class ShopkeeperController {
  constructor(private readonly shopkeeperService: ShopkeeperService) {}

  @Post()
  create(@Body() createShopkeeperDto: CreateShopkeeperDto) {
    return this.shopkeeperService.create(createShopkeeperDto);
  }

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  findAll(@Query() getShopkeeperDto: GetShopkeeperDto) {
    return this.shopkeeperService.findAll(getShopkeeperDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shopkeeperService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateShopkeeperDto: UpdateShopkeeperDto,
  ) {
    return this.shopkeeperService.update(id, updateShopkeeperDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shopkeeperService.remove(+id);
  }
}
