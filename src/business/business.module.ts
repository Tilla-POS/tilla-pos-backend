import { Module } from '@nestjs/common';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from './entities/business.entity';
import { PaginationModule } from '../common/pagination/pagination.module';
import { ShopkeeperModule } from '../shopkeeper/shopkeeper.module';

@Module({
  controllers: [BusinessController],
  providers: [BusinessService],
  imports: [
    TypeOrmModule.forFeature([Business]),
    PaginationModule,
    ShopkeeperModule,
  ],
})
export class BusinessModule {}
