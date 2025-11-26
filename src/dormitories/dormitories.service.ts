import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { RiakService } from '../riak/riak.service';
import { v4 as uuidv4 } from 'uuid';
import { CreateDormDto } from './dto/create-dorm.dto';
import { UpdateDormDto } from './dto/update-dorm.dto';

const BUCKET = 'dormitories';
const INDEX_KEY = '_index_dormitories';

@Injectable()
export class DormitoriesService {
  private readonly logger = new Logger(DormitoriesService.name);

  constructor(private readonly riak: RiakService) {}

  async create(dto: CreateDormDto) {
    const id = uuidv4();
    const payload = { id, ...dto, createdAt: new Date().toISOString() };
    await this.riak.put(BUCKET, id, payload);
    await this.riak.addToIndex(BUCKET, INDEX_KEY, id);

    this.logger.log(`Created dormitory with id=${id}`);
    return payload;
  }

  async findAll() {
    const ids = await this.riak.listFromIndex(BUCKET, INDEX_KEY);
    const results = await Promise.all(
      ids.map((id: string) => this.riak.get(BUCKET, id)),
    );
    const filtered = results.filter(Boolean);

    this.logger.log(`Fetched all dormitories, count=${filtered.length}`);
    return filtered;
  }

  async findOne(id: string) {
    const item = await this.riak.get(BUCKET, id);
    if (!item) {
      this.logger.warn(`Dormitory not found with id=${id}`);
      throw new NotFoundException('Dormitory not found');
    }

    this.logger.log(`Fetched dormitory with id=${id}`);
    return item;
  }

  async update(id: string, dto: UpdateDormDto) {
    const current = await this.findOne(id);
    const updated = { ...current, ...dto, updatedAt: new Date().toISOString() };
    await this.riak.put(BUCKET, id, updated);

    this.logger.log(`Updated dormitory with id=${id}`);
    return updated;
  }

  async remove(id: string) {
    await this.findOne(id); // throws if not exists
    await this.riak.del(BUCKET, id);
    await this.riak.removeFromIndex(BUCKET, INDEX_KEY, id);

    this.logger.log(`Deleted dormitory with id=${id}`);
    return { deleted: true };
  }
}
