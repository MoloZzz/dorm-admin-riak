import { Module, Global } from '@nestjs/common';
import { RiakService } from './riak.service';

@Global()
@Module({
  providers: [RiakService],
  exports: [RiakService],
})
export class RiakModule {}
