import { forwardRef, Module } from '@nestjs/common';
import { ShopkeeperService } from './shopkeeper.service';
import { ShopkeeperController } from './shopkeeper.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shopkeeper } from './entities/shopkeeper.entity';
import { CreateShopkeeperProvider } from './providers/create-shopkeeper.provider';
import { AuthModule } from '../auth/auth.module';
import { PaginationModule } from '../common/pagination/pagination.module';
import { FindShopkeeperByProvider } from './providers/find-shopkeeper-by.provider';

@Module({
  controllers: [ShopkeeperController],
  providers: [
    ShopkeeperService,
    CreateShopkeeperProvider,
    FindShopkeeperByProvider,
  ],
  imports: [
    TypeOrmModule.forFeature([Shopkeeper]),
    forwardRef(() => AuthModule),
    PaginationModule,
  ],
  exports: [CreateShopkeeperProvider, FindShopkeeperByProvider],
})
export class ShopkeeperModule {}
