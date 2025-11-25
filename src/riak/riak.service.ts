import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as Riak from 'basho-riak-client';
import { promisify } from 'util';

@Injectable()
export class RiakService implements OnModuleInit, OnModuleDestroy {
  private client: any;
  private connected = false;

  // Configure nodes here or read from env
  private nodes = ['127.0.0.1:8087'];

  async onModuleInit() {
    this.client = new Riak.Client(this.nodes);
    // basho client uses callbacks; wrap connect in Promise
    await new Promise<void>((resolve, reject) => {
      this.client.ping((err: any, resp: any) => {
        if (err) return reject(err);
        this.connected = true;
        resolve();
      });
    });
  }

  async onModuleDestroy() {
    if (this.client) {
      this.client.stop();
    }
  }

  // store JSON under bucket/type/key
  async put(bucket: string, key: string, value: any) {
    return new Promise<void>((resolve, reject) => {
      const storeVal = {
        bucket,
        key,
        value,
      };
      this.client.storeValue(storeVal, (err: any, rslt: any) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  async get(bucket: string, key: string) {
    return new Promise<any>((resolve, reject) => {
      this.client.fetchValue({ bucket, key }, (err: any, rslt: any) => {
        if (err) return reject(err);
        if (!rslt || !rslt.values || rslt.values.length === 0)
          return resolve(null);
        // rslt.values is array of Riak objects (could be siblings) — return first.value
        const v = rslt.values[0].value;
        resolve(v);
      });
    });
  }

  async del(bucket: string, key: string) {
    return new Promise<void>((resolve, reject) => {
      this.client.deleteValue({ bucket, key }, (err: any) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  // Примітивний list: зберігаємо ключі в індексному документі
  // indexKeyName — ім'я ключа, де зберігається масив ключів для bucket
  async addToIndex(bucket: string, indexKeyName: string, key: string) {
    const idx = (await this.get(bucket, indexKeyName)) || [];
    if (!idx.includes(key)) {
      idx.push(key);
      await this.put(bucket, indexKeyName, idx);
    }
  }

  async removeFromIndex(bucket: string, indexKeyName: string, key: string) {
    const idx = (await this.get(bucket, indexKeyName)) || [];
    const filtered = idx.filter((k: string) => k !== key);
    await this.put(bucket, indexKeyName, filtered);
  }

  async listFromIndex(bucket: string, indexKeyName: string) {
    return (await this.get(bucket, indexKeyName)) || [];
  }
}
