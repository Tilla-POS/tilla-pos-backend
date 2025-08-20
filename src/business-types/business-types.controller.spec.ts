import { Test, TestingModule } from '@nestjs/testing';
import { BusinessTypesController } from './business-types.controller';
import { BusinessTypesService } from './business-types.service';

type MockBusinessTypesService = Partial<
  Record<keyof BusinessTypesService, jest.Mock>
>;
const mockBusinessTypesService = (): MockBusinessTypesService => {
  return {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    restore: jest.fn(),
  };
};
describe('BusinessTypesController', () => {
  let controller: BusinessTypesController;
  let businessTypesService: MockBusinessTypesService;
  const dummyId = 'uuid-1234';
  const createBusinessTypeDto = {
    name: 'Retail',
    description: 'Retail business type',
    slug: 'retai',
  };
  const createdBusinessType = {
    id: dummyId,
    ...createBusinessTypeDto,
  };
  const updateBusinessTypeDto = {
    name: 'Wholesale',
    description: 'Wholesale business type',
    slug: 'wholesale',
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusinessTypesController],
      providers: [
        { provide: BusinessTypesService, useValue: mockBusinessTypesService() },
      ],
    }).compile();

    controller = module.get<BusinessTypesController>(BusinessTypesController);
    businessTypesService =
      module.get<MockBusinessTypesService>(BusinessTypesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('create', () => {
    it('should call businessTypesService.create', async () => {
      businessTypesService.create.mockResolvedValue(createdBusinessType);
      const result = await controller.create(createBusinessTypeDto);
      expect(businessTypesService.create).toHaveBeenCalledWith(
        createBusinessTypeDto,
      );
      expect(result).toEqual(createdBusinessType);
    });
  });
  describe('findAll', () => {
    it('should call businessTypesService.findAll', async () => {
      const businessTypes = [createdBusinessType];
      businessTypesService.findAll.mockResolvedValue(businessTypes);
      const result = await controller.findAll();
      expect(businessTypesService.findAll).toHaveBeenCalled();
      expect(result).toEqual(businessTypes);
    });
  });
  describe('findOne', () => {
    it('should call businessTypesService.findOne', async () => {
      businessTypesService.findOne.mockResolvedValue(createdBusinessType);
      const result = await controller.findOne(dummyId);
      expect(businessTypesService.findOne).toHaveBeenCalledWith(dummyId);
      expect(result.id).toEqual(dummyId);
    });
  });
  describe('update', () => {
    it('should call businessTypesService.update', async () => {
      businessTypesService.update.mockResolvedValue({
        ...createdBusinessType,
        ...updateBusinessTypeDto,
      });
      const result = await controller.update(dummyId, updateBusinessTypeDto);
      expect(businessTypesService.update).toHaveBeenCalledWith(
        dummyId,
        updateBusinessTypeDto,
      );
      expect(result.id).toEqual(dummyId);
      expect(result.name).toEqual(updateBusinessTypeDto.name);
    });
  });
  describe('remove', () => {
    it('should call businessTypesService.remove', async () => {
      businessTypesService.remove.mockResolvedValue({ affected: 1 });
      const result = await controller.remove(dummyId);
      expect(businessTypesService.remove).toHaveBeenCalledWith(dummyId);
      expect(result.affected).toEqual(1);
    });
  });
  describe('restore', () => {
    it('should call businessTypesService.restore', async () => {
      businessTypesService.restore.mockResolvedValue({ affected: 1 });
      const result = await controller.restore(dummyId);
      expect(businessTypesService.restore).toHaveBeenCalledWith(dummyId);
      expect(result.affected).toEqual(1);
    });
  });
});
