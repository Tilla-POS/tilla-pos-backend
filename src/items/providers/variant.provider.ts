import {
  Injectable,
  NotFoundException,
  RequestTimeoutException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Variant } from '../entities/variant.entity';
import { Repository, DataSource } from 'typeorm';
import { Sku } from '../entities/sku.entity';
import { ModifiersService } from 'src/modifier/modifier.service';
import { CreateVariantDto } from '../dto/create-variant.dto';
import { Modifier } from 'src/modifier/entities/modifier.entity';
import { User } from 'src/users/entities/user.entity';
import { UpdateVariantDto } from '../dto/update-variant.dto';

@Injectable()
export class VariantProvider {
  private readonly logger = new Logger(VariantProvider.name);

  constructor(
    @InjectRepository(Variant)
    private readonly variantRepository: Repository<Variant>,
    @InjectRepository(Sku)
    private readonly skuRepository: Repository<Sku>,
    private readonly modifiersService: ModifiersService,
    private readonly dataSource: DataSource,
  ) {}
  async createVariant(createVariantDto: CreateVariantDto, user: User) {
    this.logger.debug(
      `Starting creation of variant ${createVariantDto.name} for user ${user.id}`,
    );

    try {
      const stock = this.skuRepository.create({
        sku: createVariantDto.sku.sku,
        quantity: createVariantDto.sku.quantity,
        unit: createVariantDto.sku.unit,
        lowStockAlert: createVariantDto.sku.lowStockAlert,
        createdBy: user,
        updatedBy: user,
      });

      let modifiers: Modifier[] = [];
      // Handle modifiers if they exist
      if (createVariantDto.modifiers?.length > 0) {
        this.logger.debug(
          `Fetching ${createVariantDto.modifiers.length} modifiers for variant ${createVariantDto.name}`,
        );
        modifiers = await this.modifiersService.findAllByIds(
          createVariantDto.modifiers,
        );
      }

      // Calculate margin if both prices are provided
      let margin = null;
      if (createVariantDto.purchasePrice && createVariantDto.sellingPrice) {
        margin =
          ((createVariantDto.sellingPrice - createVariantDto.purchasePrice) /
            createVariantDto.purchasePrice) *
          100;
      }

      // Create variant with calculated margin
      const variant = this.variantRepository.create({
        name: createVariantDto.name,
        image: createVariantDto.image || '',
        sellingPrice: createVariantDto.sellingPrice,
        purchasePrice: createVariantDto.purchasePrice,
        margin,
        barcode: createVariantDto.barcode,
        manufactureDate: createVariantDto.manufactureDate,
        expireDate: createVariantDto.expireDate,
        expireDateAlert: createVariantDto.expireDateAlert,
        tax: createVariantDto.tax,
        internalNote: createVariantDto.internalNote,
        stock,
        modifiers,
        createdBy: user,
        updatedBy: user,
      });

      await this.variantRepository.save(variant);
      this.logger.log(
        `Successfully created variant ${createVariantDto.name} for user ${user.id}`,
      );

      return variant;
    } catch (error) {
      this.logger.error(
        `Error creating variant ${createVariantDto.name}: ${error.message}`,
        error.stack,
      );
      throw new RequestTimeoutException('Failed to create variant', error);
    }
  }

  async createManyVariants(createVariantDtos: CreateVariantDto[], user: User) {
    this.logger.debug(
      `Starting creation of ${createVariantDtos.length} variants for user ${user.id}`,
    );

    // Start a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const variants = await Promise.all(
        createVariantDtos.map(async (variantDto) => {
          this.logger.debug(`Creating variant with name: ${variantDto.name}`);

          // Create SKU using repository for consistency
          const stock = this.skuRepository.create({
            sku: variantDto.sku.sku,
            quantity: variantDto.sku.quantity,
            unit: variantDto.sku.unit,
            lowStockAlert: variantDto.sku.lowStockAlert,
            createdBy: user,
            updatedBy: user,
          });

          let modifiers: Modifier[] = [];
          // Handle modifiers if they exist
          if (variantDto.modifiers?.length > 0) {
            this.logger.debug(
              `Fetching ${variantDto.modifiers.length} modifiers for variant ${variantDto.name}`,
            );
            modifiers = await this.modifiersService.findAllByIds(
              variantDto.modifiers,
            );
          }

          // Calculate margin if both prices are provided
          let margin = null;
          if (variantDto.purchasePrice && variantDto.sellingPrice) {
            margin =
              ((variantDto.sellingPrice - variantDto.purchasePrice) /
                variantDto.purchasePrice) *
              100;
          }

          // Create variant with calculated margin
          const variant = queryRunner.manager.create(Variant, {
            name: variantDto.name,
            image: variantDto.image || '',
            sellingPrice: variantDto.sellingPrice,
            purchasePrice: variantDto.purchasePrice,
            margin,
            barcode: variantDto.barcode,
            manufactureDate: variantDto.manufactureDate,
            expireDate: variantDto.expireDate,
            expireDateAlert: variantDto.expireDateAlert,
            tax: variantDto.tax,
            internalNote: variantDto.internalNote,
            stock,
            modifiers,
            createdBy: user,
            updatedBy: user,
          });

          return variant;
        }),
      );

      // Save all variants in the transaction
      const savedVariants = await queryRunner.manager.save(variants);
      await queryRunner.commitTransaction();

      this.logger.log(
        `Successfully created ${variants.length} variants for user ${user.id}`,
      );

      return savedVariants;
    } catch (error) {
      this.logger.error(
        `Error creating variants: ${error.message}`,
        error.stack,
      );
      await queryRunner.rollbackTransaction();
      throw new RequestTimeoutException('Failed to create variants', error);
    } finally {
      await queryRunner.release();
    }
  }
  async findVariantDetailById(id: string) {
    try {
      const variant = await this.variantRepository.findOne({
        where: { id },
        relations: ['stock', 'modifiers', 'modifiers.options'],
      });
      if (!variant) {
        throw new NotFoundException(`Variant with ID ${id} not found.`);
      }
      return variant;
    } catch (error) {
      throw new RequestTimeoutException(
        `Failed to fetch variant with ID ${id}`,
        error,
      );
    }
  }
  async updateVariantById(
    id: string,
    itemId: string,
    updateVariantDto: UpdateVariantDto,
    user: User,
  ) {
    this.logger.debug(
      `Starting variant update process - Variant: ${id}, Item: ${itemId}, User: ${user.id}`,
    );

    // Start a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find variant with relationships and validate business access
      const variant = await queryRunner.manager.findOne(Variant, {
        where: { id, item: { id: itemId } },
        relations: ['stock', 'modifiers', 'item.business'],
      });

      if (!variant) {
        throw new NotFoundException(`Variant with ID ${id} not found.`);
      }

      // Business access validation
      if (variant.item.business.id !== user.business.id) {
        throw new ForbiddenException(
          'You do not have access to update this variant',
        );
      }

      this.logger.debug(`Updating basic fields for variant ${id}`);
      // Update basic fields if provided using object spread for cleaner code
      const basicUpdates = {
        ...(updateVariantDto.name && { name: updateVariantDto.name }),
        ...(updateVariantDto.image && { image: updateVariantDto.image }),
        ...(updateVariantDto.sellingPrice && {
          sellingPrice: updateVariantDto.sellingPrice,
        }),
        ...(updateVariantDto.purchasePrice && {
          purchasePrice: updateVariantDto.purchasePrice,
        }),
        ...(updateVariantDto.barcode && { barcode: updateVariantDto.barcode }),
        ...(updateVariantDto.manufactureDate && {
          manufactureDate: updateVariantDto.manufactureDate,
        }),
        ...(updateVariantDto.expireDate && {
          expireDate: updateVariantDto.expireDate,
        }),
        ...(updateVariantDto.expireDateAlert && {
          expireDateAlert: updateVariantDto.expireDateAlert,
        }),
        ...(updateVariantDto.tax && { tax: updateVariantDto.tax }),
        ...(updateVariantDto.internalNote && {
          internalNote: updateVariantDto.internalNote,
        }),
      };

      Object.assign(variant, basicUpdates);

      // Calculate margin if both prices are available
      if (updateVariantDto.sellingPrice && updateVariantDto.purchasePrice) {
        this.logger.debug(`Recalculating margin for variant ${id}`);
        variant.margin =
          ((updateVariantDto.sellingPrice - updateVariantDto.purchasePrice) /
            updateVariantDto.purchasePrice) *
          100;
      }

      // Update SKU information if provided
      if (updateVariantDto.sku) {
        this.logger.debug(`Updating SKU information for variant ${id}`);
        if (!variant.stock) {
          variant.stock = this.skuRepository.create({
            sku: updateVariantDto.sku.sku,
            quantity: updateVariantDto.sku.quantity,
            unit: updateVariantDto.sku.unit,
            lowStockAlert: updateVariantDto.sku.lowStockAlert,
            createdBy: user,
            updatedBy: user,
          });
        } else {
          // Update existing SKU using object spread
          Object.assign(variant.stock, {
            ...updateVariantDto.sku,
            updatedBy: user,
          });
        }
      }

      // Optimized modifier updates - only update if there are changes
      if (updateVariantDto.modifiers?.length > 0) {
        this.logger.debug(`Updating modifiers for variant ${id}`);
        const currentModifierIds = variant.modifiers.map((m) => m.id);
        const requestedModifierIds = updateVariantDto.modifiers;

        // Only update if the modifier lists are different
        if (!this.areArraysEqual(currentModifierIds, requestedModifierIds)) {
          const fetchedModifiers =
            await this.modifiersService.findAllByIds(requestedModifierIds);
          variant.modifiers = fetchedModifiers;
        }
      }

      // Update tracking information
      variant.updatedBy = user;

      // Save all changes within the transaction
      const savedVariant = await queryRunner.manager.save(Variant, variant);
      await queryRunner.commitTransaction();

      this.logger.log(`Successfully updated variant ${id} by user ${user.id}`);
      return savedVariant;
    } catch (error) {
      this.logger.error(
        `Error updating variant ${id}: ${error.message}`,
        error.stack,
      );
      await queryRunner.rollbackTransaction();

      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new RequestTimeoutException(
        `Failed to update variant with ID ${id}`,
        error,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async deleteVariantById(variantId: string, userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find the variant first
      const variant = await queryRunner.manager.findOne(Variant, {
        where: { id: variantId },
        relations: ['item', 'createdBy', 'stock'],
      });

      if (!variant) {
        throw new NotFoundException(`Variant with ID ${variantId} not found.`);
      }

      // Check if the user has permission to delete this variant
      if (variant.createdBy.id !== userId) {
        throw new ForbiddenException(
          'You do not have permission to delete this variant.',
        );
      }

      // Soft delete the variant (TypeORM will handle the soft delete)
      await queryRunner.manager.softDelete(Variant, variantId);

      await queryRunner.commitTransaction();

      this.logger.log(
        `Variant ${variantId} deleted successfully by user ${userId}`,
      );

      return { message: 'Variant deleted successfully.' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to delete variant ${variantId}`, error.stack);

      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      throw new RequestTimeoutException(
        'Unable to delete variant at the moment. Please try again later.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  // Helper method to compare arrays
  private areArraysEqual(arr1: string[], arr2: string[]): boolean {
    if (arr1.length !== arr2.length) return false;
    const sortedArr1 = [...arr1].sort();
    const sortedArr2 = [...arr2].sort();
    return sortedArr1.every((value, index) => value === sortedArr2[index]);
  }
}
