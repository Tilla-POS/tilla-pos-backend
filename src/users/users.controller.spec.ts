import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { PatchUserDto, PutUserDto } from './dto/update-user.dto';

type MockUserService = Partial<Record<keyof UsersService, jest.Mock>>;
const mockUserService = (): MockUserService => {
  return {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    remove: jest.fn(),
    restore: jest.fn(),
  };
};

describe('UsersController', () => {
  let controller: UsersController;
  let userService: MockUserService;
  const putUserDto: PutUserDto = {
    username: 'John Dane',
    email: 'john@dane.com',
    phone: '+66973541808',
    password: 'P@ssword1234',
  };
  const createUserDto: CreateUserDto = {
    username: 'John Doe',
    email: 'john@doe.com',
    phone: '+66973541807',
    password: 'P@ssword123',
  };
  const patchUserDto: PatchUserDto = {
    email: 'john@dane.com',
  };
  const dummyId = 'uuid-1234';
  const createdUser = {
    id: dummyId,
    ...createUserDto,
  };
  const affectedRes = { generatedMaps: [], raw: [], affected: 1 };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUserService() }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    userService = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('create', () => {
    it('should call usersService.create', async () => {
      userService.create.mockResolvedValue(createdUser);
      const result = await controller.create(createUserDto);
      expect(userService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(createdUser);
    });
  });
  describe('findAll', () => {
    it('should call usersService.findAll', async () => {
      userService.findAll.mockResolvedValue([createdUser]);
      await controller.findAll();
      expect(userService.findAll).toHaveBeenCalled();
    });
  });
  describe('findOne', () => {
    it('should call usersService.findOne', async () => {
      userService.findOne.mockResolvedValue(createdUser);
      const result = await controller.findOne(dummyId);
      expect(userService.findOne).toHaveBeenCalledWith(dummyId);
      expect(result.id).toEqual(dummyId);
    });
  });
  describe('update', () => {
    it('should call usersService.patch', async () => {
      userService.patch.mockResolvedValue({
        ...createdUser,
        email: patchUserDto.email,
      });
      const result = await controller.update(dummyId, patchUserDto);
      expect(userService.patch).toHaveBeenCalledWith(dummyId, patchUserDto);
      expect(result.id).toEqual(dummyId);
      expect(result.email).toEqual(patchUserDto.email);
    });
  });
  describe('updateAll', () => {
    it('should call usersService.put', async () => {
      userService.put.mockResolvedValue({ ...createdUser, ...putUserDto });
      const result = await controller.updateAll(dummyId, putUserDto);
      expect(userService.put).toHaveBeenCalledWith(dummyId, putUserDto);
      expect(result).toEqual({ ...createdUser, ...putUserDto });
    });
  });
  describe('remove', () => {
    it('should call usersService.remove', async () => {
      userService.remove.mockResolvedValue(affectedRes);
      await controller.remove(dummyId);
      expect(userService.remove).toHaveBeenCalledWith(dummyId);
    });
  });
  describe('restore', () => {
    it('should call usersService.restore', async () => {
      userService.restore.mockResolvedValue(affectedRes);
      await controller.restore(dummyId);
      expect(userService.restore).toHaveBeenCalledWith(dummyId);
    });
  });
});
