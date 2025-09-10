import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './category.service';
import { DataSource } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { UploadsService } from '../uploads/uploads.service';
import { BusinessesService } from '../businesses/businesses.service';

describe('CategoryService', () => {
  let service: CategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: DataSource, useValue: {} },
        { provide: getRepositoryToken(Category), useValue: {} },
        { provide: UploadsService, useValue: {} },
        { provide: BusinessesService, useValue: {} },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
