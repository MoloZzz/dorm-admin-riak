import { Injectable, NotFoundException } from '@nestjs/common';
import { RiakService } from '../riak/riak.service';
import { v4 as uuidv4 } from 'uuid';
import { CreateDormDto } from './dto/create-dorm.dto';
import { UpdateDormDto } from './dto/update-dorm.dto';

const BUCKET = 'dormitories';
const INDEX_KEY = '_index_dormitories'; // key where we store the list of dorm ids

@Injectable()
export class DormitoriesService {
  constructor(private readonly riak: RiakService) {}

  async create(dto: CreateDormDto) {
    const id = uuidv4();
    const payload = { id, ...dto, createdAt: new Date().toISOString() };
    await this.riak.put(BUCKET, id, payload);
    await this.riak.addToIndex(BUCKET, INDEX_KEY, id);
    return payload;
  }

  async findAll() {
    const ids = await this.riak.listFromIndex(BUCKET, INDEX_KEY);
    const results = await Promise.all(
      ids.map((id: string) => this.riak.get(BUCKET, id)),
    );
    return results.filter(Boolean);
  }

  async findOne(id: string) {
    const item = await this.riak.get(BUCKET, id);
    if (!item) throw new NotFoundException('Dormitory not found');
    return item;
  }

  async update(id: string, dto: UpdateDormDto) {
    const current = await this.findOne(id);
    const updated = { ...current, ...dto, updatedAt: new Date().toISOString() };
    await this.riak.put(BUCKET, id, updated);
    return updated;
  }

  async remove(id: string) {
    await this.findOne(id); // throws if not exists
    await this.riak.del(BUCKET, id);
    await this.riak.removeFromIndex(BUCKET, INDEX_KEY, id);
    return { deleted: true };
  }
}
