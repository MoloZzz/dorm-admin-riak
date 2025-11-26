import { Injectable, NotFoundException } from '@nestjs/common';
import { RiakService } from '../riak/riak.service';
import { v4 as uuidv4 } from 'uuid';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { DormitoriesService } from 'src/dormitories/dormitories.service';

const BUCKET = 'rooms';
const INDEX_KEY = '_index_rooms';

@Injectable()
export class RoomsService {
  constructor(
    private readonly riak: RiakService,
    private readonly dormService: DormitoriesService,
  ) {}

  async create(dto: CreateRoomDto) {
    const dorm = await this.dormService.findOne(dto.dormitoryId);
    if (!dorm) {
      throw new NotFoundException(`Dormitory ${dto.dormitoryId} not found`);
    }
    const id = uuidv4();
    const payload = { id, ...dto, createdAt: new Date().toISOString() };
    await this.riak.put(BUCKET, id, payload);
    await this.riak.addToIndex(BUCKET, INDEX_KEY, id);
    return payload;
  }

  async findAll() {
    const ids = await this.riak.listFromIndex(BUCKET, INDEX_KEY);
    const results = await Promise.all(
      ids.map((id) => this.riak.get(BUCKET, id)),
    );
    return results.filter(Boolean);
  }

  async findOne(id: string) {
    const item = await this.riak.get(BUCKET, id);
    if (!item) throw new NotFoundException('Room not found');
    return item;
  }

  async update(id: string, dto: UpdateRoomDto) {
    const current = await this.findOne(id);
    const updated = { ...current, ...dto, updatedAt: new Date().toISOString() };
    await this.riak.put(BUCKET, id, updated);
    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.riak.del(BUCKET, id);
    await this.riak.removeFromIndex(BUCKET, INDEX_KEY, id);
    return { deleted: true };
  }
}
