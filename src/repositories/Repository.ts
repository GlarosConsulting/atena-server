/* eslint-disable */
import { PrismaClient } from '@prisma/client';

export default abstract class BaseRepository<T, TCreateInput, TUpdateInput> {
  readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  findAll(): Promise<T[]> {
    throw new Error('Method not implemented.');
  }

  findById(id: any): Promise<T | null> {
    throw new Error('Method not implemented.');
  }

  create(data: TCreateInput): Promise<T | null> {
    throw new Error('Method not implemented.');
  }

  update(id: any, data: TUpdateInput): Promise<T | null> {
    throw new Error('Method not implemented.');
  }

  delete(id: any): Promise<T | null> {
    throw new Error('Method not implemented.');
  }

  existsById(id: any): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
