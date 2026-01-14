import type { IStorage } from './interface';
import { MemStorage } from './memory';
import { DatabaseStorage } from './database';
import { db } from '../db';

export const storage: IStorage = process.env.DATABASE_URL
  ? new DatabaseStorage(db)
  : new MemStorage();

export type { IStorage };
export * from './interface';
