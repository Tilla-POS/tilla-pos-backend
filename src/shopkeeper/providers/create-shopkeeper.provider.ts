import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { CreateShopkeeperDto } from '../dto/create-shopkeeper.dto';
import { Repository } from 'typeorm';
import { Shopkeeper } from '../entities/shopkeeper.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { HashingProvider } from '../../auth/providers/hashing.provider';

/**
 * Class of service for creating shopkeeper
 * Exporting this service for other modules
 * @class
 */
@Injectable()
export class CreateShopkeeperProvider {
  /**
   * Constructor for DI of CreateShopkeeperProvider
   * @constructor
   * @param shopkeeperRepository
   * @param hashingProvider
   */
  constructor(
    /**
     * Inject shopkeeper repository
     */
    @InjectRepository(Shopkeeper)
    private readonly shopkeeperRepository: Repository<Shopkeeper>,
    /**
     * Inject Hashing Provider to hash the password for shopkeeper
     */
    @Inject(forwardRef(() => HashingProvider))
    private readonly hashingProvider: HashingProvider,
  ) {}

  /**
   * A function for creating a new shopkeeper
   * @param shopkeeperDto
   */
  async create(shopkeeperDto: CreateShopkeeperDto) {
    // Check existing shopkeeper via email or phone number
    let existingShopkeeper: Shopkeeper | undefined = undefined;
    try {
      existingShopkeeper = await this.shopkeeperRepository.findOneBy({
        email: shopkeeperDto.email,
        phone: shopkeeperDto.phone,
      });
    } catch (error) {
      throw new RequestTimeoutException(error);
    }
    // If shopkeeper is already exist, throw a CONFLICT exception
    if (!!existingShopkeeper) {
      throw new ConflictException('Shopkeeper already exists');
    }
    // Create a new shopkeeper
    let newShopkeeper = this.shopkeeperRepository.create({
      ...shopkeeperDto,
      password: await this.hashingProvider.hashPassword(shopkeeperDto.password),
    });
    // Save a new shopkeeper
    try {
      newShopkeeper = await this.shopkeeperRepository.save(newShopkeeper);
    } catch (error) {
      throw new RequestTimeoutException(error);
    }
    // return a created shopkeeper
    return newShopkeeper;
  }
}
