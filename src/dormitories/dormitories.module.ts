import { Module } from '@nestjs/common';
import { DormitoriesService } from './dormitories.service';
import { DormitoriesController } from './dormitories.controller';
import { RiakModule } from 'src/riak/riak.module';

@Module({
  imports: [RiakModule],
  providers: [DormitoriesService],
  controllers: [DormitoriesController],
})
export class DormitoriesModule {}
