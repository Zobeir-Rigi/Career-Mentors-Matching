import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { Server } from 'node:http';
import { AppModule } from '../app.module';

describe('Health endpoint integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 200 when the database is reachable', async () => {
    const server = app.getHttpServer() as Server;

    await request(server).get('/health').expect(200).expect({
      status: 'ok',
      database: 'connected',
    });
  });
});
