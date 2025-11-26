import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { DormitoriesService } from './dormitories.service';
import { CreateDormDto } from './dto/create-dorm.dto';
import { UpdateDormDto } from './dto/update-dorm.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Dormitories')
@Controller('dormitories')
export class DormitoriesController {
  constructor(private readonly service: DormitoriesService) {}

  @Post()
  create(@Body() dto: CreateDormDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDormDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
