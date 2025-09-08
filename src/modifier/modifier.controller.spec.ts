import { Test, TestingModule } from '@nestjs/testing';
import { ModifierController } from './modifier.controller';
import { ModifierService } from './modifier.service';

describe('ModifierController', () => {
  let controller: ModifierController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModifierController],
      providers: [ModifierService],
    }).compile();

    controller = module.get<ModifierController>(ModifierController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
