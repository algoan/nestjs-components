import { INestApplication } from '@nestjs/common';
import { expect } from 'chai';
import * as request from 'supertest';
import { createTestAppModule } from './helpers';

describe('E2e tests related to the PaginationMongoQueryParamDecorator', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestAppModule();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Tests with a pagination query', () => {
    it('MPPDE01 - should successfully create the mongoQuery from the request', async () => {
      const res: request.Response = await request(app.getHttpServer()).get('/pagination?page=5&limit=10').expect(200);

      expect(res.body.pagination).to.deep.equal({
        filter: {},
        limit: 10,
        project: {},
        skip: 40,
        sort: {},
      });
    });
  });
});
