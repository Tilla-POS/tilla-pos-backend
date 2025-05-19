import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { CreateShopkeeperDto } from './dto/create-shopkeeper.dto';
import { UpdateShopkeeperDto } from './dto/update-shopkeeper.dto';
import { Repository } from 'typeorm';
import { Shopkeeper } from './entities/shopkeeper.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ShopkeeperService {
  constructor(
    @InjectRepository(Shopkeeper)
    private readonly shopkeeperRepository: Repository<Shopkeeper>,
  ) {}
  async create(createShopkeeperDto: CreateShopkeeperDto) {
    try {
      const newShopkeeper =
        this.shopkeeperRepository.create(createShopkeeperDto);
      return await this.shopkeeperRepository.save(newShopkeeper);
    } catch (error) {
      throw new RequestTimeoutException(error);
    }
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
