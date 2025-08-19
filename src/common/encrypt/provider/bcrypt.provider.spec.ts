import { Test, TestingModule } from '@nestjs/testing';
import { BcryptProvider } from './bcrypt.provider';

describe('BcryptProvider', () => {
  let provider: BcryptProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BcryptProvider],
    }).compile();

    provider = module.get<BcryptProvider>(BcryptProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'mysecretpassword';
      const hashedPassword = await provider.hashPassword(password);
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toEqual(password);
    });
  });

  describe('comparePassword', () => {
    it('should return true for a correct password', async () => {
      const password = 'mysecretpassword';
      const hashedPassword = await provider.hashPassword(password);
      const isMatch = await provider.comparePassword(password, hashedPassword);
      expect(isMatch).toBeTruthy();
    });

    it('should return false for an incorrect password', async () => {
      const password = 'mysecretpassword';
      const hashedPassword = await provider.hashPassword(password);
      const isMatch = await provider.comparePassword(
        'wrongpassword',
        hashedPassword,
      );
      expect(isMatch).toBeFalsy();
    });
  });
});
