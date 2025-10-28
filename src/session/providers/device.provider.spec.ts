import { Test, TestingModule } from '@nestjs/testing';
import { DeviceProvider } from './device.provider';

describe('DeviceProvider', () => {
  let provider: DeviceProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeviceProvider],
    }).compile();

    provider = module.get<DeviceProvider>(DeviceProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
