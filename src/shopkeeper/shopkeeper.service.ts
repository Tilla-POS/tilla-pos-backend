import {
  BadRequestException,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { CreateShopkeeperDto } from './dto/create-shopkeeper.dto';
import { UpdateShopkeeperDto } from './dto/update-shopkeeper.dto';
import { Repository } from 'typeorm';
import { Shopkeeper } from './entities/shopkeeper.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateShopkeeperProvider } from './providers/create-shopkeeper.provider';

@Injectable()
export class ShopkeeperService {
  constructor(
    @InjectRepository(Shopkeeper)
    private readonly shopkeeperRepository: Repository<Shopkeeper>,
    private readonly createShopkeeperProvider: CreateShopkeeperProvider,
  ) {}
  async create(createShopkeeperDto: CreateShopkeeperDto) {
    return await this.createShopkeeperProvider.create(createShopkeeperDto);
  }

  findAll() {
    return `This action returns all shopkeeper`;
  }

  findOne(id: number) {
    return `This action returns a #${id} shopkeeper`;
  }

  async update(id: string, updateShopkeeperDto: UpdateShopkeeperDto) {
    // find the shopkeeper by id
    let shopkeeper: Shopkeeper | undefined = undefined;
    try {
      shopkeeper = await this.shopkeeperRepository.findOneBy({ id });
    } catch (error) {
      throw new RequestTimeoutException(error);
    }
    // if not found, throw an exception
    if (!shopkeeper) {
      throw new BadRequestException('Shopkeeper not found');
    }
    // update the shopkeeper
    shopkeeper.username = updateShopkeeperDto.username;
    shopkeeper.email = updateShopkeeperDto.email;
    shopkeeper.phone = updateShopkeeperDto.phone;
    try {
      await this.shopkeeperRepository.save(shopkeeper);
    } catch (error) {
      throw new RequestTimeoutException(error);
    }
    // return the updated shopkeeper
    return shopkeeper;
  }

  remove(id: number) {
    return `This action removes a #${id} shopkeeper`;
  }
}
