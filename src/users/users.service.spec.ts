import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { BadRequestException, RequestTimeoutException } from '@nestjs/common';
import { Hashing } from '../common/encrypt/provider/hashing';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const mockRepository = <T = any>(): MockRepository<T> => {
  return {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
  };
};

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: MockRepository<User>;
  const dummyId = 'abc-123';
  const user = {
    username: 'John Doe',
    email: 'john@doe.com',
    phone: '+66973541807',
    password: 'P@ssword123',
  };
  const patchUserDto = {
    email: 'john@doe.xyz',
  };
  const putUserDto = {
    username: 'John Dame',
    email: 'john@dame.com',
    phone: '+66973541807',
    password: 'P@ssword123',
  };
  const affectedRes = { generatedMaps: [], raw: [], affected: 1 };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: DataSource, useValue: {} },
        { provide: getRepositoryToken(User), useValue: mockRepository() },
        {
          provide: Hashing,
          useValue: {
            hashPassword: jest.fn(() => Promise.resolve('hashedPassword')),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<MockRepository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    describe('when the user is created', () => {
      it('should create a new user', async () => {
        userRepository.create.mockReturnValue({
          ...user,
          password: 'hashedPassword',
        });
        userRepository.save.mockResolvedValue({
          ...user,
          password: 'hashedPassword',
        });
        await service.create(user);
        expect(userRepository.create).toHaveBeenCalledWith({
          ...user,
          password: 'hashedPassword',
        });
        expect(userRepository.save).toHaveBeenCalledWith({
          ...user,
          password: 'hashedPassword',
        });
      });
    });
    describe('when the repo return error', () => {
      it('should return request timeout exception', async () => {
        userRepository.create.mockReturnValue(user);
        userRepository.save.mockRejectedValue('error');
        try {
          await service.create(user);
        } catch (error) {
          expect(error).toBeInstanceOf(RequestTimeoutException);
        }
      });
    });
  });
  describe('find', () => {
    describe('when the repo success', () => {
      it('should return the user list', async () => {
        userRepository.find.mockResolvedValue([user]);
        const users = await service.findAll();
        expect(users.length).toBeGreaterThan(0);
      });
    });
    describe('when the repo fails', () => {
      it('should throw request timeout exception', async () => {
        userRepository.find.mockRejectedValue('error');
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
      it('should return the specific user', async () => {
        userRepository.findOne.mockResolvedValue(user);
        const result = await service.findOne(dummyId);
        expect(userRepository.findOne).toHaveBeenCalledWith({
          where: { id: dummyId },
        });
        expect(result).toBe(user);
      });
    });
    describe('when the repo fails', () => {
      it('should throw request timeout exception', async () => {
        userRepository.findOne.mockRejectedValue('error');
        try {
          await service.findOne(dummyId);
          expect(userRepository.findOne).toHaveBeenCalledWith({
            where: { id: dummyId },
          });
        } catch (error) {
          expect(error).toBeInstanceOf(RequestTimeoutException);
        }
      });
    });
  });
  describe('findByEmail', () => {
    describe('when the repo success', () => {
      it('should return the user', async () => {
        userRepository.findOne.mockResolvedValue(user);
        const result = await service.findByEmail(user.email);
        expect(userRepository.findOne).toHaveBeenCalledWith({
          where: { email: user.email },
        });
        expect(result).toBe(user);
      });
    });
    describe('when the repo fails', () => {
      it('should throw request timeout exception', async () => {
        userRepository.findOne.mockRejectedValue('error');
        try {
          await service.findByEmail(user.email);
        } catch (error) {
          expect(error).toBeInstanceOf(RequestTimeoutException);
        }
      });
    });
  });
  describe('patch', () => {
    describe('when the user is not exist', () => {
      it('should throw bad request exception', async () => {
        userRepository.findOne.mockResolvedValue(null);
        try {
          await service.patch(dummyId, { ...user, email: 'john@doe.xyz' });
        } catch (error) {
          expect(error).toBeInstanceOf(BadRequestException);
        }
      });
    });
    describe('when the user exist', () => {
      it('should return the updated  user', async () => {
        userRepository.findOne.mockResolvedValue(user);
        userRepository.save.mockResolvedValue({
          ...user,
          email: patchUserDto.email,
        });
        await service.patch(dummyId, patchUserDto);
        expect(userRepository.save).toHaveBeenCalledWith({
          ...user,
          email: patchUserDto.email,
        });
      });
    });
    describe('when the repo fails', () => {
      it('should throw request timeout exception', async () => {
        userRepository.findOne.mockRejectedValue('error');
        try {
          await service.patch(dummyId, patchUserDto);
        } catch (error) {
          expect(error).toBeInstanceOf(RequestTimeoutException);
        }
      });
    });
  });
  describe('put', () => {
    describe('when the user does not exist', () => {
      it('should throw bad request exception', async () => {
        userRepository.findOne.mockResolvedValue(null);
        try {
          await service.put(dummyId, putUserDto);
        } catch (error) {
          expect(error).toBeInstanceOf(BadRequestException);
        }
      });
    });
    describe('when the user exist', () => {
      it('should update the user', async () => {
        userRepository.findOne.mockResolvedValue(user);
        userRepository.update.mockResolvedValue(affectedRes);
        userRepository.findOne.mockResolvedValue(putUserDto);
        const result = await service.put(dummyId, putUserDto);
        expect(userRepository.update).toHaveBeenCalledWith(dummyId, putUserDto);
        expect(result).toBe(putUserDto);
      });
    });
    describe('when the repo fail', () => {
      it('should throw request timeout exception', async () => {
        userRepository.findOne.mockRejectedValue('error');
        try {
          await service.put(dummyId, putUserDto);
        } catch (error) {
          expect(error).toBeInstanceOf(RequestTimeoutException);
        }
      });
    });
  });
  describe('remove', () => {
    describe('when the user does not exist', () => {
      it('should throw bad request exception', async () => {
        userRepository.findOne.mockResolvedValue(null);
        try {
          await service.put(dummyId, putUserDto);
        } catch (error) {
          expect(error).toBeInstanceOf(BadRequestException);
        }
      });
    });
    describe('when the user exist', () => {
      it('should delete the user', async () => {
        userRepository.findOne.mockResolvedValue(user);
        userRepository.softDelete.mockResolvedValue(affectedRes);
        const res = await service.remove(dummyId);
        expect(res).toBe(affectedRes);
        expect(userRepository.softDelete).toHaveBeenCalledWith(dummyId);
      });
    });
    describe('when the repo fail', () => {
      it('should throw request timeout exception', async () => {
        userRepository.findOne.mockRejectedValue('error');
        try {
          await service.put(dummyId, putUserDto);
        } catch (error) {
          expect(error).toBeInstanceOf(RequestTimeoutException);
        }
      });
    });
  });
  describe('restore', () => {
    describe('when the restore success', () => {
      it('should restore the user', async () => {
        userRepository.restore.mockResolvedValue(affectedRes);
        const res = await service.restore(dummyId);
        expect(res).toBe(affectedRes);
        expect(userRepository.restore).toHaveBeenCalledWith(dummyId);
      });
    });
    describe('when the repo throw error', () => {
      it('should throw request timeout exception', async () => {
        userRepository.restore.mockRejectedValue('error');
        try {
          await service.restore(dummyId);
        } catch (error) {
          expect(error).toBeInstanceOf(RequestTimeoutException);
        }
      });
    });
  });
});
