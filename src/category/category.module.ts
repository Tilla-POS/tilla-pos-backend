import { Module } from '@nestjs/common';
import { CategoriesService } from './category.service';
import { CategoryController } from './category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadsModule } from '../uploads/uploads.module';
import { Category } from './entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category]), UploadsModule],
  controllers: [CategoryController],
  providers: [CategoriesService],
})
export class CategoryModule {}
