import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ActiveUser as ActiveUserInterface } from '../auth/interfaces/active-user.inteface';

describe('UsersController - getCurrentUser', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser = {
    id: 'user-123',
    username: 'john_doe',
    email: 'john@example.com',
    phone: '+1234567890',
    business: {
      id: 'business-123',
      name: 'Test Business',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockActiveUser: ActiveUserInterface = {
    sub: 'user-123',
    email: 'john@example.com',
    businessId: 'business-123',
  };

  const mockUsersService = {
    getCurrentUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('getCurrentUser', () => {
    it('should return the current authenticated user', async () => {
      mockUsersService.getCurrentUser.mockResolvedValue(mockUser);

      const result = await controller.getCurrentUser(mockActiveUser);

      expect(result).toEqual(mockUser);
      expect(service.getCurrentUser).toHaveBeenCalledWith(mockActiveUser);
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      mockUsersService.getCurrentUser.mockRejectedValue(error);

      await expect(controller.getCurrentUser(mockActiveUser)).rejects.toThrow(
        error,
      );
    });
  });
});
