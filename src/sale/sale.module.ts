import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaleService } from './sale.service';
import { SaleController } from './sale.controller';
import { Sale } from './entities/sale.entity';
import { LineItem } from './entities/line-item.entity';
import { Customer } from './entities/customer.entity';
import { UsersModule } from '../users/users.module';
import { BusinessesModule } from '../businesses/businesses.module';
import { ItemsModule } from '../items/items.module';
import { ModifierModule } from '../modifier/modifier.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sale, LineItem, Customer]),
    UsersModule,
    BusinessesModule,
    ItemsModule,
    ModifierModule,
    AuthModule,
  ],
  controllers: [SaleController],
  providers: [SaleService],
  exports: [SaleService],
})
export class SaleModule {}
