import { Injectable } from '@nestjs/common';
import { CreateShopkeeperDto } from './dto/create-shopkeeper.dto';
import { UpdateShopkeeperDto } from './dto/update-shopkeeper.dto';

@Injectable()
export class ShopkeeperService {
  create(createShopkeeperDto: CreateShopkeeperDto) {
    return 'This action adds a new shopkeeper';
  }

  findAll() {
    return `This action returns all shopkeeper`;
  }

  findOne(id: number) {
    return `This action returns a #${id} shopkeeper`;
  }

  update(id: number, updateShopkeeperDto: UpdateShopkeeperDto) {
    return `This action updates a #${id} shopkeeper`;
  }

  remove(id: number) {
    return `This action removes a #${id} shopkeeper`;
  }
}
