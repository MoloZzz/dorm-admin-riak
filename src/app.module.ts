import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RiakModule } from './riak/riak.module';
import { DormitoriesModule } from './dormitories/dormitories.module';

@Module({
  imports: [RiakModule, DormitoriesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
