import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

type MockAuthService = Partial<Record<keyof AuthService, jest.Mock>>;
const mockAuthService = (): MockAuthService => {
  return {
    signup: jest.fn(),
    signin: jest.fn(),
    createBusiness: jest.fn(),
  };
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: MockAuthService;
  const dummyId = 'uuid-1234';
  const signInDto = {
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
  const createBusinessDto = {
    name: 'John Dame',
    slug: 'john-dame',
    shopkeeperId: dummyId,
    email: 'john@doe.com',
  };
  const mockFile = {
    originalname: 'logo.png',
    buffer: Buffer.from('data'),
    mimetype: 'image/png',
  } as Express.Multer.File;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService() }],
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
  describe('sign-in', () => {
    it('should call authService.signIn', async () => {
      authService.signin.mockResolvedValue({ token: 'token' });
      const result = await controller.signIn(signInDto);
      expect(authService.signin).toHaveBeenCalledWith(signInDto);
      expect(result).toEqual({ token: 'token' });
    });
  });
  describe('create-business', () => {
    it('should call authService.createBusiness', async () => {
      authService.createBusiness.mockResolvedValue({ token: 'token' });
      const result = await controller.createBusiness(
        createBusinessDto as any,
        mockFile,
      );
      expect(authService.createBusiness).toHaveBeenCalledWith(
        createBusinessDto,
        mockFile,
      );
      expect(result).toEqual({ token: 'token' });
    });
  });
});
