import { Test, TestingModule } from '@nestjs/testing';
import { RiakService } from './riak.service';

describe('RiakService', () => {
  let service: RiakService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RiakService],
    }).compile();

    service = module.get<RiakService>(RiakService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
