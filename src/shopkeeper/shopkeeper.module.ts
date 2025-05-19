import { Module } from '@nestjs/common';
import { ShopkeeperService } from './shopkeeper.service';
import { ShopkeeperController } from './shopkeeper.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shopkeeper } from './entities/shopkeeper.entity';
import { CreateShopkeeperProvider } from './providers/create-shopkeeper.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Shopkeeper])],
  controllers: [ShopkeeperController],
  providers: [ShopkeeperService, CreateShopkeeperProvider],
})
export class ShopkeeperModule {}
