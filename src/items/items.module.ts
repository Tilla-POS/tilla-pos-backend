import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { Item } from './entities/item.entity';
import { Variant } from './entities/variant.entity';
import { Sku } from './entities/sku.entity';
import { UsersModule } from '../users/users.module';
import { BusinessesModule } from '../businesses/businesses.module';
import { CategoryModule } from '../category/category.module';
import { ModifierModule } from '../modifier/modifier.module';
import { VariantProvider } from './providers/variant.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([Item, Variant, Sku]),
    UsersModule,
    BusinessesModule,
    CategoryModule,
    ModifierModule,
  ],
  controllers: [ItemsController],
  providers: [ItemsService, VariantProvider],
})
export class ItemsModule {}
