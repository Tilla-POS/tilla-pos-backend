import { Test, TestingModule } from '@nestjs/testing';
import { BusinessTypesService } from './business-types.service';
import { BusinessType } from './entities/business-type.entity';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, RequestTimeoutException } from '@nestjs/common';

type MockBusinessTypeRepository = Partial<
  Record<keyof Repository<BusinessType>, jest.Mock>
>;
const mockBusinessTypeRepository = (): MockBusinessTypeRepository => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  findOneById: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  restore: jest.fn(),
});

describe('BusinessTypesService', () => {
  let service: BusinessTypesService;
  let businessTypeRepository: MockBusinessTypeRepository;
  const createBusinessTypeDto = {
    name: 'Retail',
    slug: 'retail',
    description: 'Retail business type',
  };
  const dummyId = 'business-type-id-1234';
  const createdBusinessType = {
    id: dummyId,
    ...createBusinessTypeDto,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessTypesService,
        { provide: DataSource, useValue: {} },
        {
          provide: getRepositoryToken(BusinessType),
          useValue: mockBusinessTypeRepository(),
        },
      ],
    }).compile();

    service = module.get<BusinessTypesService>(BusinessTypesService);
    businessTypeRepository = module.get<MockBusinessTypeRepository>(
      getRepositoryToken(BusinessType),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    describe('when business type already exists', () => {
      it('should throw BadRequestException', async () => {
        businessTypeRepository.findOne.mockResolvedValue(createdBusinessType);
        try {
          await service.create(createBusinessTypeDto);
        } catch (error) {
          expect(error).toBeInstanceOf(BadRequestException);
        }
      });
    });
    describe('when business type does not exist', () => {
      it('should create a new business type', async () => {
        businessTypeRepository.findOne.mockResolvedValue(null);
        businessTypeRepository.create.mockReturnValue(createdBusinessType);
        businessTypeRepository.save.mockResolvedValue(createdBusinessType);

        const result = await service.create(createBusinessTypeDto);
        expect(businessTypeRepository.create).toHaveBeenCalledWith(
          createBusinessTypeDto,
        );
        expect(businessTypeRepository.save).toHaveBeenCalledWith(
          createdBusinessType,
        );
        expect(result).toEqual(createdBusinessType);
      });
    });
    describe('when the repository throws an error', () => {
      it('should throw RequestTimeoutException', async () => {
        businessTypeRepository.findOne.mockRejectedValue(new Error('DB Error'));
        try {
          await service.create(createBusinessTypeDto);
        } catch (error) {
          expect(error).toBeInstanceOf(RequestTimeoutException);
        }
      });
    });
  });
  describe('findAll', () => {
    describe('when the repo success', () => {
      it('should return all business types', async () => {
        const businessTypes = [createdBusinessType];
        businessTypeRepository.find.mockResolvedValue(businessTypes);

        const result = await service.findAll();
        expect(businessTypeRepository.find).toHaveBeenCalled();
        expect(result).toEqual(businessTypes);
      });
    });
    describe('when the repo fails', () => {
      it('should throw RequestTimeoutException', async () => {
        businessTypeRepository.find.mockRejectedValue(new Error('DB Error'));
        try {
          await service.findAll();
        } catch (error) {
          expect(error).toBeInstanceOf(RequestTimeoutException);
        }
      });
    });
  });
  describe('findOne', () => {
    describe('when the repo success', () => {
      it('should return the specific business type', async () => {
        businessTypeRepository.findOneBy.mockResolvedValue(createdBusinessType);

        const result = await service.findOne(dummyId);
        expect(businessTypeRepository.findOneBy).toHaveBeenCalledWith({
          id: dummyId,
        });
        expect(result).toEqual(createdBusinessType);
      });
    });
    describe('when the repo fails', () => {
      it('should throw RequestTimeoutException', async () => {
        businessTypeRepository.findOneBy.mockRejectedValue(
          new Error('DB Error'),
        );
        try {
          await service.findOne(dummyId);
        } catch (error) {
          expect(error).toBeInstanceOf(RequestTimeoutException);
        }
      });
    });
  });
  describe('update', () => {
    describe('when the business type does not exist', () => {
      it('should throw BadRequestException', async () => {
        businessTypeRepository.findOneById.mockResolvedValue(null);
        try {
          await service.update(dummyId, createBusinessTypeDto);
        } catch (error) {
          expect(error).toBeInstanceOf(BadRequestException);
        }
      });
    });
    describe('when the business type exists', () => {
      it('should update the business type', async () => {
        businessTypeRepository.findOneBy.mockResolvedValue(createdBusinessType);
        businessTypeRepository.save.mockResolvedValue({
          ...createdBusinessType,
          name: 'Updated Retail',
        });
        const updateDto = { name: 'Updated Retail' };
        const result = await service.update(dummyId, updateDto);
        console.log('result', result);
        expect(businessTypeRepository.findOneBy).toHaveBeenCalledWith({
          id: dummyId,
        });
        expect(businessTypeRepository.save).toHaveBeenCalledWith({
          ...createdBusinessType,
          ...updateDto,
        });
        expect(result).toEqual({
          ...createdBusinessType,
          name: updateDto.name,
        });
      });
    });
  });
  describe('remove', () => {
    describe('when the business type does not exist', () => {
      it('should throw BadRequestException', async () => {
        businessTypeRepository.findOneBy.mockResolvedValue(null);
        try {
          await service.remove(dummyId);
        } catch (error) {
          expect(error).toBeInstanceOf(BadRequestException);
        }
      });
    });
    describe('when the business type exists', () => {
      it('should remove the business type', async () => {
        businessTypeRepository.findOneBy.mockResolvedValue(createdBusinessType);
        businessTypeRepository.softDelete.mockResolvedValue({ affected: 1 });

        const result = await service.remove(dummyId);
        expect(businessTypeRepository.findOneBy).toHaveBeenCalledWith({
          id: dummyId,
        });
        expect(businessTypeRepository.softDelete).toHaveBeenCalledWith(dummyId);
        expect(result).toEqual({ affected: 1 });
      });
    });
    describe('when the repo fail', () => {
      it('should throw RequestTimeoutException', async () => {
        businessTypeRepository.findOneBy.mockRejectedValue(
          new Error('DB Error'),
        );
        try {
          await service.remove(dummyId);
        } catch (error) {
          expect(error).toBeInstanceOf(RequestTimeoutException);
        }
      });
    });
  });
  describe('restore', () => {
    describe('when the restore success', () => {
      it('should restore the business type', async () => {
        businessTypeRepository.restore.mockResolvedValue({ affected: 1 });

        const result = await service.restore(dummyId);
        expect(businessTypeRepository.restore).toHaveBeenCalledWith(dummyId);
        expect(result).toEqual({ affected: 1 });
      });
    });
    describe('when the repo fails', () => {
      it('should throw RequestTimeoutException', async () => {
        businessTypeRepository.restore.mockRejectedValue(new Error('DB Error'));
        try {
          await service.restore(dummyId);
        } catch (error) {
          expect(error).toBeInstanceOf(RequestTimeoutException);
        }
      });
    });
  });
});
