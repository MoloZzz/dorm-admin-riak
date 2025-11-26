import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RiakModule } from './riak/riak.module';
import { DormitoriesModule } from './dormitories/dormitories.module';
import { RoomsModule } from './rooms/rooms.module';
import { ResidentsModule } from './residents/residents.module';

@Module({
  imports: [RiakModule, DormitoriesModule, RoomsModule, ResidentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
