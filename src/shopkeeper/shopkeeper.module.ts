import { forwardRef, Module } from '@nestjs/common';
import { ShopkeeperService } from './shopkeeper.service';
import { ShopkeeperController } from './shopkeeper.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shopkeeper } from './entities/shopkeeper.entity';
import { CreateShopkeeperProvider } from './providers/create-shopkeeper.provider';
import { AuthModule } from '../auth/auth.module';
import { PaginationModule } from '../common/pagination/pagination.module';

@Module({
  controllers: [ShopkeeperController],
  providers: [ShopkeeperService, CreateShopkeeperProvider],
  imports: [
    TypeOrmModule.forFeature([Shopkeeper]),
    forwardRef(() => AuthModule),
    PaginationModule,
  ],
  exports: [CreateShopkeeperProvider],
})
export class ShopkeeperModule {}
