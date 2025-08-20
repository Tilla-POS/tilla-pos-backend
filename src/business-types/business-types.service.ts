import {
  BadRequestException,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { CreateBusinessTypeDto } from './dto/create-business-type.dto';
import { UpdateBusinessTypeDto } from './dto/update-business-type.dto';
import { Repository } from 'typeorm';
import { BusinessType } from './entities/business-type.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class BusinessTypesService {
  constructor(
    @InjectRepository(BusinessType)
    private readonly businessTypeRepository: Repository<BusinessType>,
  ) {}
  async create(createBusinessTypeDto: CreateBusinessTypeDto) {
    let businessType: BusinessType;
    try {
      businessType = await this.businessTypeRepository.findOne({
        where: [
          { name: createBusinessTypeDto.name },
          { slug: createBusinessTypeDto.slug },
        ],
      });
    } catch (error) {
      throw new RequestTimeoutException('Error creating business type');
    }
    if (businessType) {
      throw new BadRequestException('The business type already exists');
    }
    const createdBusinessType = this.businessTypeRepository.create(
      createBusinessTypeDto,
    );
    try {
      return await this.businessTypeRepository.save(createdBusinessType);
    } catch (error) {
      throw new RequestTimeoutException('Error saving business type', {
        cause: error,
        description: 'Could not save the business type',
      });
    }
  }

  async findAll() {
    try {
      return await this.businessTypeRepository.find();
    } catch (error) {
      throw new RequestTimeoutException('Error fetching business types', {
        cause: error,
        description: 'Could not fetch the business types',
      });
    }
  }

  async findOne(id: string) {
    try {
      return await this.businessTypeRepository.findOneBy({ id });
    } catch (error) {
      throw new RequestTimeoutException('Error fetching business type', {
        cause: error,
        description: 'Could not fetch the business type',
      });
    }
  }

  async update(id: string, updateBusinessTypeDto: UpdateBusinessTypeDto) {
    let businessType: BusinessType;
    try {
      businessType = await this.businessTypeRepository.findOneBy({ id });
    } catch (error) {
      throw new RequestTimeoutException('Error fetching business type', {
        cause: error,
        description: 'Could not fetch the business type for update',
      });
    }
    if (!businessType) {
      throw new BadRequestException('The business type does not exist');
    }
    businessType.name = updateBusinessTypeDto.name || businessType.name;
    businessType.description =
      updateBusinessTypeDto.description || businessType.description;
    businessType.slug = updateBusinessTypeDto.slug || businessType.slug;
    try {
      return await this.businessTypeRepository.save(businessType);
    } catch (error) {
      throw new RequestTimeoutException('Error updating business type', {
        cause: error,
        description: 'Could not update the business type',
      });
    }
  }

  async remove(id: string) {
    let businessType: BusinessType;
    try {
      businessType = await this.businessTypeRepository.findOneBy({ id });
    } catch (error) {
      throw new RequestTimeoutException('Error fetching business type', {
        cause: error,
        description: 'Could not fetch the business type for deletion',
      });
    }
    if (!businessType) {
      throw new BadRequestException('The business type does not exist');
    }
    try {
      return await this.businessTypeRepository.softDelete(id);
    } catch (error) {
      throw new RequestTimeoutException('Error deleting business type', {
        cause: error,
        description: 'Could not delete the business type',
      });
    }
  }

  async restore(id: string) {
    try {
      return await this.businessTypeRepository.restore(id);
    } catch (error) {
      throw new RequestTimeoutException(
        `Failed to restore business type with ID ${id}. Please try again later.`,
        error,
      );
    }
  }
}
