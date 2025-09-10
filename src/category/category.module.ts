import { Module } from '@nestjs/common';
import { CategoriesService } from './category.service';
import { CategoriesController } from './category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadsModule } from '../uploads/uploads.module';
import { Category } from './entities/category.entity';
import { BusinessesModule } from '../businesses/businesses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category]),
    UploadsModule,
    BusinessesModule,
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoryModule {}
