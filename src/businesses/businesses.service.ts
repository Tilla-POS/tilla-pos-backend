import {
  BadRequestException,
  Injectable,
  Logger,
  RequestTimeoutException,
} from '@nestjs/common';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Business } from './entities/business.entity';
import { Repository } from 'typeorm';
import { UploadsService } from '../uploads/uploads.service';
import { BusinessType } from '../business-types/entities/business-type.entity';
import { BusinessTypesService } from '../business-types/business-types.service';

@Injectable()
export class BusinessesService {
  private readonly logger = new Logger(BusinessesService.name);
  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    private readonly userService: UsersService,
    private readonly uploadService: UploadsService,
    private readonly businessTypesService: BusinessTypesService,
  ) {}
  async create(
    createBusinessDto: CreateBusinessDto,
    file: Express.Multer.File,
    userId: string,
  ) {
    let user: User;
    try {
      user = await this.userService.findOne(userId);
    } catch (e) {
      throw new RequestTimeoutException(
        `Failed to find user with ID ${userId}. Please try again later.`,
        e,
      );
    }
    if (!user) {
      throw new BadRequestException(`User with ID ${userId} not found.`);
    }
    let businessType: BusinessType;
    try {
      businessType = await this.businessTypesService.findOne(
        createBusinessDto.businessTypeId,
      );
    } catch (e) {
      throw new RequestTimeoutException(
        `Failed to find business type with ID ${createBusinessDto.businessTypeId}. Please try again later.`,
        e,
      );
    }
    if (!businessType) {
      throw new BadRequestException(
        `Business type with ID ${createBusinessDto.businessTypeId} not found.`,
      );
    }
    const isBusinessExisted: boolean =
      !!(await this.businessRepository.findOneBy({
        slug: createBusinessDto.slug,
      }));
    if (isBusinessExisted) {
      throw new BadRequestException('Business name is already existed');
    }
    const newBusiness = this.businessRepository.create({
      ...createBusinessDto,
      businessType,
      shopkeeper: user,
      image: await this.uploadService.uploadFile(file),
    });
    try {
      return await this.businessRepository.save(newBusiness);
    } catch (e) {
      console.log(e);
      throw new RequestTimeoutException('Failed to create the business', e);
    }
  }

  async findAll() {
    try {
      return await this.businessRepository.find({
        relations: ['businessType', 'shopkeeper'],
      });
    } catch (e) {
      throw new RequestTimeoutException('Fail to fetch the businesses', e);
    }
  }

  async findOne(id: string) {
    // if (!id) throw new BadRequestException(`Invalid business id`);
    this.logger.log(`Fetching business with ID: ${id}`);
    try {
      return await this.businessRepository.findOne({
        where: { id },
        relations: ['businessType', 'shopkeeper'],
      });
    } catch (error) {
      throw new RequestTimeoutException(
        `Failed to fetch business with ID ${id}.`,
        error,
      );
    }
  }

  async update(
    id: string,
    updateBusinessDto: UpdateBusinessDto,
    file?: Express.Multer.File,
  ) {
    let business: Business;
    try {
      business = await this.businessRepository.findOneBy({ id });
    } catch (error) {
      throw new RequestTimeoutException(`Fail to fetch business ${id}`, error);
    }
    if (!business) {
      throw new BadRequestException(`Business with ID ${id} not found.`);
    }
    if (file) {
      // Delete old image if exist
      if (business.image) {
        await this.uploadService.deleteFile(business.image);
        business.image = await this.uploadService.uploadFile(file);
      }
    }
    Object.assign(business, updateBusinessDto);
    try {
      return await this.businessRepository.save(business);
    } catch (error) {
      throw new RequestTimeoutException('Fail to update the business', error);
    }
  }

  async remove(id: string) {
    let business: Business;
    try {
      business = await this.businessRepository.findOneBy({ id });
    } catch (error) {
      throw new RequestTimeoutException(`Fail to fetch business with ID ${id}`);
    }
    if (!business) {
      throw new BadRequestException(`Business with ID ${id} not found.`);
    }
    try {
      return await this.businessRepository.softDelete(business);
    } catch (error) {
      throw new RequestTimeoutException('Fail to delete the business', error);
    }
  }

  async restore(id: string) {
    try {
      return await this.businessRepository.restore(id);
    } catch (error) {
      throw new RequestTimeoutException('Fail to restore the business', error);
    }
  }
}
