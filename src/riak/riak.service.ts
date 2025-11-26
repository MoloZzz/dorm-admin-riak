import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Riak from 'basho-riak-client';

@Injectable()
export class RiakService implements OnModuleInit, OnModuleDestroy {
  private client: Riak.Client;
  private connected = false;
  private readonly logger = new Logger(RiakService.name);

  private nodes;
  constructor(private readonly configService: ConfigService) {
    this.nodes = [
      this.configService.get<string>('RIAK_NODES') || '127.0.0.1:8087',
    ];
  }

  async onModuleInit() {
    this.logger.log('Connecting to Riak...');
    this.client = new Riak.Client(this.nodes);

    const connectPromise = new Promise<void>((resolve, reject) => {
      this.client.ping((err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    const timeout = new Promise<void>((_, reject) =>
      setTimeout(() => reject(new Error('Riak ping timeout')), 5000),
    );

    try {
      await Promise.race([connectPromise, timeout]);
      this.connected = true;
      this.logger.log('Riak connected successfully.');
    } catch (err: any) {
      this.logger.error(`Failed to connect to Riak: ${err.message}`);
      throw new Error('Riak connection failed. Application stopped.');
    }
  }

  async onModuleDestroy() {
    this.logger.log('Stopping Riak client...');
    this.client?.stop();
  }

  private ensureConnected() {
    if (!this.connected) {
      throw new Error('Riak connection is not established');
    }
  }

  // --- Key helper ---
  private toKey(key: unknown): string {
    if (key === null || key === undefined) {
      throw new Error('Invalid key');
    }
    return String(key);
  }

  // --- CRUD operations ---
  async put(bucket: string, key: unknown, value: any): Promise<void> {
    this.ensureConnected();
    const keyStr = this.toKey(key);
    const storeVal = {
      bucket,
      key: keyStr,
      value: JSON.stringify(value)
    };

    await new Promise<void>((resolve, reject) => {
      this.client.storeValue(storeVal, (err) =>
        err ? reject(err) : resolve(),
      );
    });
  }

  async get<T = any>(bucket: string, key: unknown): Promise<T | null> {
    this.ensureConnected();
    const keyStr = this.toKey(key);

    return new Promise<T | null>((resolve, reject) => {
      this.client.fetchValue({ bucket, key: keyStr }, (err, result) => {
        if (err) return reject(err);
        if (!result?.values?.length) return resolve(null);
        const value = result.values[0].value;
        try {
          resolve(JSON.parse(value));
        } catch {
          resolve(value);
        }
      });
    });
  }

  async del(bucket: string, key: unknown): Promise<void> {
    this.ensureConnected();
    const keyStr = this.toKey(key);

    await new Promise<void>((resolve, reject) => {
      this.client.deleteValue({ bucket, key: keyStr }, (err) =>
        err ? reject(err) : resolve(),
      );
    });
  }

  // --- Index operations (array of keys) ---
  async addToIndex(
    bucket: string,
    indexKey: string,
    key: unknown,
  ): Promise<void> {
    const raw = await this.get<string[]>(bucket, indexKey);
    const idx = Array.isArray(raw) ? raw : [];
    const keyStr = this.toKey(key);
    if (!idx.includes(keyStr)) {
      idx.push(keyStr);
      await this.put(bucket, indexKey, idx);
    }
  }

  async removeFromIndex(
    bucket: string,
    indexKey: string,
    key: unknown,
  ): Promise<void> {
    const raw = await this.get<string[]>(bucket, indexKey);
    const idx = Array.isArray(raw) ? raw : [];
    const keyStr = this.toKey(key);
    const filtered = idx.filter((k) => k !== keyStr);
    await this.put(bucket, indexKey, filtered);
  }

  async listFromIndex(bucket: string, indexKey: string): Promise<string[]> {
    const raw = await this.get<string[]>(bucket, indexKey);
    return Array.isArray(raw) ? raw : [];
  }
}
