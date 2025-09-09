import { Test, TestingModule } from '@nestjs/testing';
import { BusinessesService } from './businesses.service';
import { DataSource, Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { UploadsService } from '../uploads/uploads.service';
import { BusinessTypesService } from '../business-types/business-types.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Business } from './entities/business.entity';
import { BadRequestException } from '@nestjs/common';

type MockBusinessRepo = Partial<Record<keyof Repository<Business>, jest.Mock>>;
type MockUserService = Partial<Record<keyof UsersService, jest.Mock>>;
type MockUploadsService = Partial<Record<keyof UploadsService, jest.Mock>>;
type MockBusinessTypeService = Partial<
  Record<keyof BusinessTypesService, jest.Mock>
>;

const mockUser = { id: 'user-1', name: 'Test User' };
const mockBusinessType = { id: 'type-1', name: 'Retail' };
const mockBusiness = {
  id: 'biz-1',
  slug: 'test-biz',
  image: 'http://img/biz.png',
};
const mockFile = {
  originalname: 'logo.png',
  buffer: Buffer.from('data'),
  mimetype: 'image/png',
} as Express.Multer.File;

const mockBusinessRepository = (): MockBusinessRepo => {
  return {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
  };
};
const mockUsersService = (): MockUserService => {
  return {
    findOne: jest.fn(),
  };
};
const mockUploadsService = (): MockUploadsService => {
  return {
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
  };
};
const mockBusinessTypesService = (): MockBusinessTypeService => {
  return {
    findOne: jest.fn(),
  };
};

describe('BusinessesService', () => {
  let service: BusinessesService;
  let businessesRepository: MockBusinessRepo;
  let usersService: MockUserService;
  let uploadsService: MockUploadsService;
  let businessTypesService: MockBusinessTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessesService,
        { provide: DataSource, useValue: {} },
        {
          provide: getRepositoryToken(Business),
          useValue: mockBusinessRepository(),
        },
        { provide: UsersService, useValue: mockUsersService() },
        { provide: UploadsService, useValue: mockUploadsService() },
        { provide: BusinessTypesService, useValue: mockBusinessTypesService() },
      ],
    }).compile();

    service = module.get<BusinessesService>(BusinessesService);
    usersService = module.get<MockUserService>(UsersService);
    uploadsService = module.get<MockUploadsService>(UploadsService);
    businessesRepository = module.get<MockBusinessRepo>(
      getRepositoryToken(Business),
    );
    businessTypesService =
      module.get<MockBusinessTypeService>(BusinessTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('create', () => {
    it('should create a business successfully', async () => {
      usersService.findOne.mockResolvedValue(mockUser as any);
      businessTypesService.findOne.mockResolvedValue(mockBusinessType as any);
      businessesRepository.findOneBy.mockResolvedValue(null);
      uploadsService.uploadFile.mockResolvedValue('http://img/new.png');
      businessesRepository.create.mockReturnValue({
        ...mockBusiness,
        id: 'biz-new',
      } as any);
      businessesRepository.save.mockResolvedValue({
        ...mockBusiness,
        id: 'biz-new',
      } as any);
      const result = await service.create(
        { slug: 'new-biz', businessTypeId: 'type-1' } as any,
        mockFile,
        'user-1',
      );
      expect(result.id).toEqual('biz-new');
      expect(businessesRepository.save).toHaveBeenCalled();
    });
    it('should throw if user not found', async () => {
      usersService.findOne.mockResolvedValue(null);
      await expect(
        service.create(
          { slug: 's', businessTypeId: 't' } as any,
          mockFile,
          'user-x',
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
    it('should throw if business type not found', async () => {
      usersService.findOne.mockResolvedValue(mockUser as any);
      businessTypesService.findOne.mockResolvedValue(null);
      await expect(
        service.create(
          { slug: 's', businessTypeId: 't' } as any,
          mockFile,
          'user-1',
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
    it('should throw if slug exists', async () => {
      usersService.findOne.mockResolvedValue(mockUser as any);
      businessTypesService.findOne.mockResolvedValue(mockBusinessType as any);
      businessesRepository.findOneBy.mockResolvedValue(mockBusiness as any);
      await expect(
        service.create(
          { slug: 'test-biz', businessTypeId: 't' } as any,
          mockFile,
          'user-1',
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
  describe('findAll', () => {
    it('should return businesses', async () => {
      businessesRepository.find.mockResolvedValue([mockBusiness as any]);
      const result = await service.findAll();
      expect(result.length).toBe(1);
    });
  });
  describe('findOne', () => {
    it('should return business by id', async () => {
      businessesRepository.findOne.mockResolvedValue(mockBusiness as any);
      const result = await service.findOne('biz-1');
      expect(result).toEqual(mockBusiness);
    });
  });
  describe('update', () => {
    it('should update business without file', async () => {
      businessesRepository.findOneBy.mockResolvedValue(mockBusiness as any);
      businessesRepository.save.mockResolvedValue({
        ...mockBusiness,
        name: 'updated',
      } as any);
      const result = await service.update('biz-1', { name: 'updated' } as any);
      expect(result.name).toEqual('updated');
    });
    it('should update business with new file', async () => {
      businessesRepository.findOneBy.mockResolvedValue({
        ...mockBusiness,
      } as any);
      uploadsService.uploadFile.mockResolvedValue('http://img/new.png');
      businessesRepository.save.mockResolvedValue({
        ...mockBusiness,
        image: 'http://img/new.png',
      } as any);
      const result = await service.update('biz-1', {}, mockFile);
      expect(result.image).toEqual('http://img/new.png');
    });
  });
  describe('remove', () => {
    it('should soft delete business', async () => {
      businessesRepository.findOneBy.mockResolvedValue(mockBusiness as any);
      businessesRepository.softDelete.mockResolvedValue({ affected: 1 } as any);
      const result = await service.remove('biz-1');
      expect(result.affected).toBe(1);
    });
  });
  describe('restore', () => {
    it('should restore business', async () => {
      businessesRepository.restore.mockResolvedValue({ affected: 1 } as any);
      const result = await service.restore('biz-1');
      expect(result.affected).toBe(1);
    });
  });
});
