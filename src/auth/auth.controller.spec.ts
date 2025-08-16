import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

type MockAuthService = Partial<Record<keyof AuthService, jest.Mock>>;
const mockAuthService = (): MockAuthService => {
  return {
    signup: jest.fn(),
  };
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: MockAuthService;
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
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService() },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<MockAuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signup', () => {
    it('should call authService.signup', async () => {
      authService.signup.mockResolvedValue(createdUser);
      const result = await controller.signup(signupDto);
      expect(authService.signup).toHaveBeenCalledWith(signupDto);
      expect(result).toEqual(createdUser);
    });
  });
});
