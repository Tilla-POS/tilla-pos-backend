import {
  BadRequestException,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Business } from './entities/business.entity';
import { Repository } from 'typeorm';
import { PaginationProvider } from '../common/pagination/providers/pagination.provider';
import { FindShopkeeperByProvider } from '../shopkeeper/providers/find-shopkeeper-by.provider';
import { GetBusinessDto } from './dto/get-business.dto';

@Injectable()
export class BusinessService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    private readonly paginationProvider: PaginationProvider,
    private readonly findShopkeeperByProvider: FindShopkeeperByProvider,
  ) {}
  async create(createBusinessDto: CreateBusinessDto) {
    // find the shopkeeper by id
    const shopkeeper = await this.findShopkeeperByProvider.findById(
      createBusinessDto.shopkeeperId,
    );
    // create the business
    let newBusiness = this.businessRepository.create({
      ...createBusinessDto,
      shopkeeper,
    });
    // save the created business
    try {
      newBusiness = await this.businessRepository.save(newBusiness);
    } catch (error) {
      throw new RequestTimeoutException(error);
    }
    // return the created business
    return newBusiness;
  }

  async findAll(getBusinessDto: GetBusinessDto) {
    return await this.paginationProvider.paginateQuery(
      { limit: getBusinessDto.limit, page: getBusinessDto.page },
      this.businessRepository,
      {
        relations: { shopkeeper: true },
        where: {
          shopkeeper: { id: getBusinessDto.shopkeeperId },
          name: getBusinessDto.name,
          phone: getBusinessDto.phone,
          address: getBusinessDto.address,
        },
      },
    );
  }

  findOne(id: number) {
    return `This action returns a #${id} business`;
  }

  async update(id: string, updateBusinessDto: UpdateBusinessDto) {
    // find the shopkeeper by id
    const shopkeeper = await this.findShopkeeperByProvider.findById(
      updateBusinessDto.shopkeeperId,
    );
    // find the business by id
    let business: Business | undefined = undefined;
    try {
      business = await this.businessRepository.findOneBy({
        id,
        shopkeeper: { id: shopkeeper.id },
      });
    } catch (error) {
      throw new RequestTimeoutException(error);
    }
    // if not found, throw an exception
    if (!business) {
      throw new BadRequestException('Business not found');
    }
    // update the business
    business.name = updateBusinessDto.name || business.name;
    business.phone = updateBusinessDto.phone || business.phone;
    business.address = updateBusinessDto.address || business.address;
    // save the business
    try {
      await this.businessRepository.save(business);
    } catch (error) {
      throw new RequestTimeoutException(error);
    }
    // return the updated business
    return business;
  }

  remove(id: number) {
    return `This action removes a #${id} business`;
  }
}
