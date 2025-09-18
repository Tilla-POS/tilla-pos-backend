import {
  Injectable,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Variant } from '../entities/variant.entity';
import { Repository } from 'typeorm';
import { Sku } from '../entities/sku.entity';
import { ModifiersService } from 'src/modifier/modifier.service';
import { CreateVariantDto } from '../dto/create-variant.dto';
import { Modifier } from 'src/modifier/entities/modifier.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class VariantProvider {
  constructor(
    @InjectRepository(Variant)
    private readonly variantRepository: Repository<Variant>,
    @InjectRepository(Sku)
    private readonly skuRepository: Repository<Sku>,
    private readonly modifiersService: ModifiersService,
  ) {}
  async createManyVariants(createVariantDtos: CreateVariantDto[], user: User) {
    return await Promise.all(
      createVariantDtos.map(async (variantDto) => {
        // Create SKU
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
        if (variantDto.modifiers && variantDto.modifiers.length > 0) {
          // Fetch all modifiers by their IDs
          const fetchedModifiers = await this.modifiersService.findAllByIds(
            variantDto.modifiers,
          );
          modifiers = fetchedModifiers;
        }
        // Create variant
        const variant = this.variantRepository.create({
          name: variantDto.name,
          image: variantDto.image || '',
          sellingPrice: variantDto.sellingPrice,
          purchasePrice: variantDto.purchasePrice,
          margin: variantDto.margin,
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
}
