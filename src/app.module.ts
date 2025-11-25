import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RiakModule } from './riak/riak.module';
import { DormitoryModule } from './dormitory/dormitory.module';
import { DormitoriesModule } from './dormitories/dormitories.module';

@Module({
  imports: [RiakModule, DormitoryModule, DormitoriesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
