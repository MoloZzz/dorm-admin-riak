import { Test, TestingModule } from '@nestjs/testing';
import { DormitoriesController } from './dormitories.controller';

describe('DormitoriesController', () => {
  let controller: DormitoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DormitoriesController],
    }).compile();

    controller = module.get<DormitoriesController>(DormitoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
