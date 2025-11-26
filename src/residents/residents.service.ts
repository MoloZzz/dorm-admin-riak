import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { RiakService } from '../riak/riak.service';
import { v4 as uuidv4 } from 'uuid';
import { CreateResidentDto } from './dto/create-resident.dto';
import { UpdateResidentDto } from './dto/update-resident.dto';
import { RoomsService } from 'src/rooms/rooms.service';

const BUCKET = 'residents';
const INDEX_KEY = '_index_residents';

@Injectable()
export class ResidentsService {
  private readonly logger = new Logger(ResidentsService.name);

  constructor(
    private readonly riak: RiakService,
    private readonly roomsService: RoomsService,
  ) {}

  async create(dto: CreateResidentDto) {
    const room = await this.roomsService.findOne(dto.roomId);
    if (!room) {
      throw new NotFoundException(`Room ${dto.roomId} not found`);
    }

    const id = uuidv4();
    const payload = { id, ...dto, createdAt: new Date().toISOString() };

    await this.riak.put(BUCKET, id, payload);
    await this.riak.addToIndex(BUCKET, INDEX_KEY, id);

    this.logger.log(`Created resident ${id} in room ${dto.roomId}`);
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
    if (!item) throw new NotFoundException('Resident not found');
    return item;
  }

  async findByRoom(roomId: string) {
    const residents = await this.findAll();
    return residents.filter((res) => res.roomId === roomId);
  }

  async update(id: string, dto: UpdateResidentDto) {
    const current = await this.findOne(id);

    if (dto.roomId && dto.roomId !== current.roomId) {
      const room = await this.roomsService.findOne(dto.roomId);
      if (!room) {
        throw new NotFoundException(`Room ${dto.roomId} not found`);
      }
    }

    const updated = { ...current, ...dto, updatedAt: new Date().toISOString() };
    await this.riak.put(BUCKET, id, updated);

    this.logger.log(
      `Updated resident ${id}${dto.roomId ? `, moved to room ${dto.roomId}` : ''}`,
    );
    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.riak.del(BUCKET, id);
    await this.riak.removeFromIndex(BUCKET, INDEX_KEY, id);

    this.logger.log(`Deleted resident ${id}`);
    return { deleted: true };
  }
}
