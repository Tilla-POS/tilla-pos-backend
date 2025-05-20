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
import { PaginationProvider } from '../common/pagination/providers/pagination.provider';
import { GetShopkeeperDto } from './dto/get-shopkeeper.dto';

@Injectable()
export class ShopkeeperService {
  constructor(
    @InjectRepository(Shopkeeper)
    private readonly shopkeeperRepository: Repository<Shopkeeper>,
    private readonly createShopkeeperProvider: CreateShopkeeperProvider,
    private readonly paginationProvider: PaginationProvider,
  ) {}
  async create(createShopkeeperDto: CreateShopkeeperDto) {
    return await this.createShopkeeperProvider.create(createShopkeeperDto);
  }

  async findAll(getShopkeeperDto: GetShopkeeperDto) {
    return await this.paginationProvider.paginateQuery(
      { limit: getShopkeeperDto.limit, page: getShopkeeperDto.page },
      this.shopkeeperRepository,
      {
        relations: { businesses: true },
      },
    );
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
    shopkeeper.username = updateShopkeeperDto.username || shopkeeper.username;
    shopkeeper.email = updateShopkeeperDto.email || shopkeeper.email;
    shopkeeper.phone = updateShopkeeperDto.phone || shopkeeper.phone;
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
