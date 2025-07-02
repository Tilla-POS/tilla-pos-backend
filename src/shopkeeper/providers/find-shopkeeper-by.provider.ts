import {
  BadRequestException,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Shopkeeper } from '../entities/shopkeeper.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FindShopkeeperByProvider {
  constructor(
    @InjectRepository(Shopkeeper)
    private readonly shopkeeperRepository: Repository<Shopkeeper>,
  ) {}
  async findById(id: string): Promise<Shopkeeper | undefined> {
    let shopkeeper: Shopkeeper | undefined = undefined;
    try {
      shopkeeper = await this.shopkeeperRepository.findOneBy({ id });
    } catch (error) {
      throw new RequestTimeoutException(error);
    }
    if (!shopkeeper) {
      throw new BadRequestException('Shopkeeper not found');
    }
    return shopkeeper;
  }
}
