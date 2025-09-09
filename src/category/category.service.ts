import {
  Injectable,
  BadRequestException,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UploadsService } from '../uploads/uploads.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    private readonly uploadService: UploadsService,
  ) {}

  async create(dto: CreateCategoryDto, file?: Express.Multer.File) {
    if (!file && !dto.image) {
      throw new BadRequestException(
        'Image is required either as a file or URL string',
      );
    }
    const imageUrl = file
      ? await this.uploadService.uploadFile(file)
      : dto.image;
    const category = this.categoryRepo.create({ ...dto, image: imageUrl });
    try {
      return await this.categoryRepo.save(category);
    } catch (e) {
      throw new RequestTimeoutException('Fail to create the category', e);
    }
  }

  async findAll() {
    try {
      return await this.categoryRepo.find();
    } catch (e) {
      throw new RequestTimeoutException('Fail to fetch the categories', e);
    }
  }

  async findOne(id: string) {
    let category: Category;
    try {
      category = await this.categoryRepo.findOne({ where: { id } });
    } catch (e) {
      throw new RequestTimeoutException(
        `Fail to fetch the category with ${id}`,
        e,
      );
    }
    if (!category) throw new NotFoundException(`Category ${id} not found`);
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto, file?: Express.Multer.File) {
    let category: Category;
    try {
      category = await this.findOne(id);
    } catch (e) {
      throw new RequestTimeoutException(
        `Fail to fetch the category with ${id}`,
        e,
      );
    }
    if (!category)
      throw new BadRequestException(`Category with ID ${id} not found.`);

    if (file) {
      // Delete old image if exist
      if (category.image) {
        await this.uploadService.deleteFile(category.image);
        category.image = await this.uploadService.uploadFile(file);
      }
    } else if (dto.image) {
      category.image = dto.image;
    }
    Object.assign(category, dto);
    try {
      return await this.categoryRepo.save(category);
    } catch (e) {
      throw new RequestTimeoutException(`Fail to update the category ${id}`, e);
    }
  }

  async remove(id: string) {
    let category: Category;
    try {
      category = await this.findOne(id);
    } catch (e) {
      throw new RequestTimeoutException(`Fail to fetch the category ${id}`, e);
    }
    if (!category) throw new BadRequestException(`Category ${id} not found`);
    try {
      return await this.categoryRepo.softRemove(category);
    } catch (e) {
      throw new RequestTimeoutException(`Fail to remove the category ${id}`, e);
    }
  }
}
