import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { BusinessesService } from '../businesses/businesses.service';
import { Hashing } from '../common/encrypt/provider/hashing';
import { JwtProviders } from './providers/jwt.providers';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService - Refresh Token', () => {
  let service: AuthService;
  let jwtProvider: JwtProviders;
  let usersService: UsersService;

  const mockUser = {
    id: 'user-id',
    email: 'test@example.com',
    business: { id: 'business-id' },
  };

  const mockJwtProvider = {
    generateTokens: jest.fn(),
    verifyRefreshToken: jest.fn(),
  };

  const mockUsersService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: BusinessesService,
          useValue: {},
        },
        {
          provide: Hashing,
          useValue: {},
        },
        {
          provide: JwtProviders,
          useValue: mockJwtProvider,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtProvider = module.get<JwtProviders>(JwtProviders);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('refreshToken', () => {
    it('should refresh tokens successfully', async () => {
      const refreshTokenDto = { refreshToken: 'valid-refresh-token' };
      const payload = { sub: 'user-id' };
      const expectedTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        tokenType: 'Bearer',
        expiresIn: 3600,
      };

      mockJwtProvider.verifyRefreshToken.mockResolvedValue(payload);
      mockUsersService.findOne.mockResolvedValue(mockUser);
      mockJwtProvider.generateTokens.mockResolvedValue(expectedTokens);

      const result = await service.refreshToken(refreshTokenDto);

      expect(result).toEqual(expectedTokens);
      expect(jwtProvider.verifyRefreshToken).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
      );
      expect(usersService.findOne).toHaveBeenCalledWith(payload.sub);
      expect(jwtProvider.generateTokens).toHaveBeenCalledWith(mockUser.id, {
        email: mockUser.email,
        businessId: mockUser.business.id,
      });
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      const refreshTokenDto = { refreshToken: 'invalid-refresh-token' };

      mockJwtProvider.verifyRefreshToken.mockRejectedValue(
        new Error('Invalid token'),
      );

      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const refreshTokenDto = { refreshToken: 'valid-refresh-token' };
      const payload = { sub: 'user-id' };

      mockJwtProvider.verifyRefreshToken.mockResolvedValue(payload);
      mockUsersService.findOne.mockResolvedValue(null);

      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
