import { Test, TestingModule } from '@nestjs/testing';
import { VariantProvider } from './variant.provider';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Variant } from '../entities/variant.entity';
import { ModifiersService } from '../../modifier/modifier.service';
import { Sku } from '../entities/sku.entity';

describe('VariantProvider', () => {
  let provider: VariantProvider;

  beforeEach(async () => {
    const mockVariantRepository = {};
    const mockSkuRepository = {};
    const mockModifiersService = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VariantProvider,
        {
          provide: getRepositoryToken(Variant),
          useValue: mockVariantRepository,
        },
        { provide: getRepositoryToken(Sku), useValue: mockSkuRepository },
        { provide: ModifiersService, useValue: mockModifiersService },
      ],
    }).compile();

    provider = module.get<VariantProvider>(VariantProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
