import { Test, TestingModule } from '@nestjs/testing';
import { DormitoriesService } from './dormitories.service';

describe('DormitoriesService', () => {
  let service: DormitoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DormitoriesService],
    }).compile();

    service = module.get<DormitoriesService>(DormitoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
