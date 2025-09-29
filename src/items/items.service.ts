import {
  BadRequestException,
  Injectable,
  RequestTimeoutException,
  ConflictException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from './entities/item.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { BusinessesService } from '../businesses/businesses.service';
import { CategoriesService } from '../category/category.service';
import { VariantProvider } from './providers/variant.provider';
import { UpdateItemDto } from './dto/update-item.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { Variant } from './entities/variant.entity';
import { CreateVariantDto } from './dto/create-variant.dto';

@Injectable()
export class ItemsService {
  private readonly logger = new Logger(ItemsService.name);

  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    private readonly userService: UsersService,
    private readonly businessService: BusinessesService,
    private readonly categoryService: CategoriesService,
    private readonly variantProvider: VariantProvider,
  ) {}
  async create(
    createItemDto: CreateItemDto,
    userId: string,
    businessId: string,
  ) {
    // Validate user and business
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    const business = await this.businessService.findOne(businessId);
    if (!business) {
      throw new BadRequestException(
        `Business with ID ${businessId} not found.`,
      );
    }

    // Validate category
    const category = await this.categoryService.findOne(
      createItemDto.categoryId,
    );
    if (!category) {
      throw new BadRequestException(
        `Category with ID ${createItemDto.categoryId} not found.`,
      );
    }

    try {
      // Create the item
      const item = this.itemRepository.create({
        name: createItemDto.name,
        image: createItemDto.image || '',
        business,
        category,
        createdBy: user,
        updatedBy: user,
      });

      // Create variants and their SKUs
      const variants = await this.variantProvider.createManyVariants(
        createItemDto.variants,
        user,
      );

      item.variants = variants;

      // Save the item with all related entities
      return await this.itemRepository.save(item);
    } catch (error) {
      this.logger.error(`Error creating item: ${error.message}`, error.stack);
      if (error.code === '23505') {
        throw new ConflictException(
          'An item with the same name already exists.',
        );
      }
      throw new RequestTimeoutException('Failed to create item.', error);
    }
  }

  async findAll() {
    try {
      // Get all items with their name, image, category, variants, and variant stocks
      const items = await this.itemRepository.find({
        relations: ['category', 'variants', 'variants.stock'],
        select: {
          id: true,
          name: true,
          image: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          category: {
            name: true,
          },
          variants: {
            id: true,
            name: true,
            image: true,
            sellingPrice: true,
            stock: {
              id: true,
              sku: true,
              quantity: true,
              unit: true,
            },
          },
        },
      });
      return items;
    } catch (error) {
      this.logger.error(`Failed to fetch items: ${error.message}`, error.stack);
      throw new RequestTimeoutException('Failed to fetch items', error);
    }
  }

  async findOne(id: string) {
    let item: Item;
    try {
      item = await this.itemRepository.findOne({
        where: { id },
        relations: ['category', 'variants', 'variants.stock'],
        select: {
          id: true,
          name: true,
          image: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          category: {
            name: true,
            id: true,
          },
          variants: {
            id: true,
            name: true,
            image: true,
            sellingPrice: true,
            stock: {
              id: true,
              sku: true,
              quantity: true,
            },
          },
        },
      });
    } catch (error) {
      throw new RequestTimeoutException(
        `Failed to fetch item with ID ${id}.`,
        error,
      );
    }
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found.`);
    }
    return item;
  }

  async findVariantDetailById(id: string) {
    return await this.variantProvider.findVariantDetailById(id);
  }

  async findVariantsByItemId(itemId: string) {
    // First verify that the item exists
    const item = await this.findOne(itemId);
    if (!item) {
      throw new NotFoundException(`Item with ID ${itemId} not found.`);
    }

    // Get all variants for the item
    return await this.variantProvider.findVariantsByItemId(itemId);
  }

  async updateItemById(id: string, updateItemDto: UpdateItemDto) {
    let item: Item;
    try {
      item = await this.itemRepository.findOneBy({ id });
    } catch (error) {
      throw new RequestTimeoutException(
        `Failed to fetch item with ID ${id}.`,
        error,
      );
    }
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found.`);
    }
    // Update fields
    item.name = updateItemDto.name ?? item.name;
    item.image = updateItemDto.image ?? item.image;

    // If categoryId is provided, validate and update
    if (updateItemDto.categoryId) {
      const category = await this.categoryService.findOne(
        updateItemDto.categoryId,
      );
      if (!category) {
        throw new BadRequestException(
          `Category with ID ${updateItemDto.categoryId} not found.`,
        );
      }
      item.category = category;
    }

    try {
      return await this.itemRepository.save(item);
    } catch (error) {
      this.logger.error(`Error updating item: ${error.message}`, error.stack);
      if (error.code === '23505') {
        throw new ConflictException(
          'An item with the same name already exists.',
        );
      }
      throw new RequestTimeoutException(
        `Failed to update item with ID ${id}.`,
        error,
      );
    }
  }

  async updateVariantById(
    id: string,
    variantId: string,
    updateVariantDto: UpdateVariantDto,
    userId: string,
  ) {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new BadRequestException(`User with ID ${userId} not found.`);
    }
    return await this.variantProvider.updateVariantById(
      variantId,
      id,
      updateVariantDto,
      user,
    );
  }

  async addVariantToItem(
    id: string,
    createVariantDto: CreateVariantDto,
    userId: string,
  ) {
    // First check if item exists without relations
    const itemExists = await this.itemRepository.findOneBy({ id });
    if (!itemExists) {
      throw new NotFoundException(`Item with ID ${id} not found.`);
    }
    // Now fetch item with variants relation
    const item = await this.itemRepository.findOne({
      where: { id },
      relations: ['variants'],
    });
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new BadRequestException(`User with ID ${userId} not found.`);
    }
    const variant: Variant = await this.variantProvider.createVariant(
      createVariantDto,
      user,
    );
    item.variants = [...(item.variants || []), variant];
    try {
      return await this.itemRepository.save(item);
    } catch (error) {
      this.logger.error(`Error adding variant: ${error.message}`, error.stack);
      throw new RequestTimeoutException(
        `Failed to add variant to item with ID ${id}.`,
        error,
      );
    }
  }

  async deleteVariantById(itemId: string, variantId: string, userId: string) {
    // First verify that the item exists
    const item = await this.findOne(itemId);
    if (!item) {
      throw new NotFoundException(`Item with ID ${itemId} not found.`);
    }

    // Delete the variant using the variant provider
    return await this.variantProvider.deleteVariantById(variantId, userId);
  }

  async deleteItemById(id: string, userId: string) {
    // Find the item with its creator information
    let item: Item;
    try {
      item = await this.itemRepository.findOne({
        where: { id },
        relations: ['createdBy'],
      });
    } catch (error) {
      this.logger.error(`Failed to fetch item with ID ${id}`, error.stack);
      throw new RequestTimeoutException(
        `Failed to fetch item with ID ${id}.`,
        error,
      );
    }

    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found.`);
    }

    // Check if the user has permission to delete this item
    if (item.createdBy.id !== userId) {
      throw new BadRequestException(
        'You do not have permission to delete this item.',
      );
    }

    try {
      // Soft delete the item (TypeORM will handle the soft delete due to @DeleteDateColumn)
      await this.itemRepository.softDelete(id);
      this.logger.log(`Item ${id} deleted successfully by user ${userId}`);
      return { message: 'Item deleted successfully.' };
    } catch (error) {
      this.logger.error(`Failed to delete item with ID ${id}`, error.stack);
      throw new RequestTimeoutException(
        'Unable to delete item at the moment. Please try again later.',
        error,
      );
    }
  }
}
