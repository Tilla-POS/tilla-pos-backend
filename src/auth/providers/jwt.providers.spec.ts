import { Test, TestingModule } from '@nestjs/testing';
import { JwtProviders } from './jwt.providers';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';

const mockJwtConfig = {
  audience: 'test-audience',
  issuer: 'test-issuer',
  secret: 'test-secret',
  expiresIn: '1h',
};

const mockJwtService = {
  verifyAsync: jest.fn(),
  signAsync: jest.fn(),
};

describe('JwtProviders', () => {
  let provider: JwtProviders;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtProviders,
        { provide: JwtService, useValue: mockJwtService },
        { provide: jwtConfig.KEY, useValue: mockJwtConfig },
      ],
    }).compile();

    provider = module.get<JwtProviders>(JwtProviders);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('verify', () => {
    it('should return payload if token is valid', async () => {
      const payload = { sub: 'user-123' };
      mockJwtService.verifyAsync.mockResolvedValue(payload);
      const result = await provider.verify('valid-token');
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(
        'valid-token',
        mockJwtConfig,
      );
      expect(result).toEqual(payload);
    });
    it('should throw error if token is invalid', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('invalid-token'));
      try {
        await provider.verify('invalid-token');
      } catch (error) {
        expect(error.message).toBe('Invalid token');
      }
    });
  });
  describe('signToken', () => {
    it('should sign token with correct payload and options', async () => {
      mockJwtService.signAsync.mockResolvedValue('signed-token');
      const userId = 'user-123';
      const expiresIn = 3600; // 1 hour
      const payload = { role: 'user' };

      const result = await provider.signToken(userId, expiresIn, payload);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        { sub: userId, ...payload },
        {
          audience: mockJwtConfig.audience,
          issuer: mockJwtConfig.issuer,
          secret: mockJwtConfig.secret,
          expiresIn,
        },
      );
      expect(result).toBe('signed-token');
    });
  });
});
