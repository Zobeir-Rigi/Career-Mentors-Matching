import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const LOCAL_COMPOSE_DATABASE_URL =
  'postgresql://postgres:postgres@localhost:5435/mentor_matching';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString =
      process.env.DATABASE_URL ?? LOCAL_COMPOSE_DATABASE_URL;

    const adapter = new PrismaPg({ connectionString });

    super({ adapter });
  }
  async onModuleInit(): Promise<void> {
    try {
      console.log('Connecting to database...');
      await this.$connect();
      console.log('Database connected');
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  }
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
