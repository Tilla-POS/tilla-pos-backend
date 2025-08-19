import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { Hashing } from '../common/encrypt/provider/hashing';
import { JwtProviders } from './providers/jwt.providers';
import { UnauthorizedException } from '@nestjs/common';

type MockUserService = Partial<Record<keyof UsersService, jest.Mock>>;
const mockUserService = (): MockUserService => {
  return {
    create: jest.fn(),
    findByEmail: jest.fn(),
  };
};

type MockJwtProviders = Partial<Record<keyof JwtProviders, jest.Mock>>;
const mockJwtProviders = (): MockJwtProviders => {
  return {
    signToken: jest.fn(),
  };
};

type MockHashing = Partial<Record<keyof Hashing, jest.Mock>>;
const mockHashing = (): MockHashing => {
  return {
    hashPassword: jest.fn(() => Promise.resolve('hashedPassword')),
    comparePassword: jest.fn(),
  };
};

describe('AuthService', () => {
  let service: AuthService;
  let userService: MockUserService;
  let hashingService: MockHashing;
  let jwtProviders: MockJwtProviders;
  const dummyId = 'uuid-1234';
  const signinDto = {
    email: 'john@doe.com',
    password: 'P@ssword123',
  };
  const signupDto = {
    username: 'John Dame',
    email: 'john@dame.com',
    phone: '+66973541807',
    password: 'P@ssword123',
  };
  const createdUser = {
    id: dummyId,
    ...signupDto,
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUserService() },
        { provide: Hashing, useValue: mockHashing() },
        { provide: JwtProviders, useValue: mockJwtProviders() },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<MockUserService>(UsersService);
    hashingService = module.get<MockHashing>(Hashing);
    jwtProviders = module.get<MockJwtProviders>(JwtProviders);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('signup', () => {
    it('should call usersService.create', async () => {
      userService.create.mockResolvedValue(createdUser);
      const result = await service.signup(signupDto);
      expect(userService.create).toHaveBeenCalledWith(signupDto);
      expect(result).toEqual(createdUser);
    });
  });
  describe('signin', () => {
    describe('when user does not exist', () => {
      it('should throw UnauthorizedException', async () => {
        userService.findByEmail.mockResolvedValue(null);
        try {
          await service.signin(signinDto);
        } catch (error) {
          expect(error).toBeInstanceOf(UnauthorizedException);
        }
      });
    });
    describe('when the user exists but password is invalid', () => {
      it('should throw UnauthorizedException', async () => {
        userService.findByEmail.mockResolvedValue({
          id: dummyId,
          email: signinDto.email,
          password: 'hashedPassword',
        });
        hashingService.comparePassword.mockResolvedValue(false);
        try {
          await service.signin(signinDto);
        } catch (error) {
          expect(error).toBeInstanceOf(UnauthorizedException);
        }
      });
    });
    describe('when the user exists and password is valid', () => {
      it('should return access token', async () => {
        userService.findByEmail.mockResolvedValue({
          id: dummyId,
          email: signinDto.email,
          password: 'hashedPassword',
        });
        hashingService.comparePassword.mockResolvedValue(true);
        jwtProviders.signToken.mockResolvedValue('access-token');
        const result = await service.signin(signinDto);
        expect(userService.findByEmail).toHaveBeenCalledWith(signinDto.email);
        expect(hashingService.comparePassword).toHaveBeenCalledWith(
          signinDto.password,
          'hashedPassword',
        );
        expect(jwtProviders.signToken).toHaveBeenCalledWith(dummyId, 3600, {
          email: signinDto.email,
        });
        expect(result).toEqual({ accessToken: 'access-token' });
      });
    });
  });
});
