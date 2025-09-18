import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ItemsService } from './items.service';
import { Item } from './entities/item.entity';
import { UsersService } from 'src/users/users.service';
import { BusinessesService } from 'src/businesses/businesses.service';
import { CategoriesService } from 'src/category/category.service';
import { VariantProvider } from './providers/variant.provider';

describe('ItemsService', () => {
  let service: ItemsService;

  beforeEach(async () => {
    const mockRepository = {
      // add mock methods as needed
      find: jest.fn(),
      save: jest.fn(),
      // ...other repository methods
    };
    const mockUsersService = {
      /* mock methods */
    };
    const mockBusinessesService = {
      /* mock methods */
    };
    const mockCategoriesService = {
      /* mock methods */
    };
    const mockVariantProvider = {
      /* mock methods */
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: getRepositoryToken(Item), useValue: mockRepository },
        { provide: UsersService, useValue: mockUsersService },
        { provide: BusinessesService, useValue: mockBusinessesService },
        { provide: CategoriesService, useValue: mockCategoriesService },
        { provide: VariantProvider, useValue: mockVariantProvider },
      ],
    }).compile();

    service = module.get<ItemsService>(ItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
