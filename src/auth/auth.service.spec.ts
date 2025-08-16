import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

type MockUserService = Partial<Record<keyof UsersService, jest.Mock>>;
const mockUserService = (): MockUserService => {
  return {
    create: jest.fn(),
  };
};

describe('AuthService', () => {
  let service: AuthService;
  let userService: MockUserService;
  const dummyId = 'uuid-1234';
  const signupDto = {
    username: 'John Dame',
    email: 'john@dame.com',
    phone: '+66973541807',
    password: 'P@ssword123',
  }
  const createdUser = {
    id: dummyId,
    ...signupDto,
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUserService() },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<MockUserService>(UsersService);
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
});
