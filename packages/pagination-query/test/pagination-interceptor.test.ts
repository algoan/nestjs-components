import { INestApplication } from '@nestjs/common';
import { expect } from 'chai';
import * as request from 'supertest';
import { createTestAppModule } from './helpers';

describe('Tests related to the Link Header interceptor', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestAppModule();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Tests with a limit', () => {
    it('AD01 - should successfully build the response without params', async () => {
      const res: request.Response = await request(app.getHttpServer()).get('/resources').expect(200);
      expect(res.body.resources).to.be.an('array');
      expect(res.body.pagination).to.deep.equal({
        next: '/resources?page=2&limit=200',
        first: '/resources?page=1&limit=200',
        last: '/resources?page=6&limit=200',
        previous: null,
        totalPages: 6,
        totalResources: 1015,
      });
    });

    it('AD02 - should successfully build the response with params', async () => {
      const res: request.Response = await request(app.getHttpServer()).get('/resources?page=4&limit=100').expect(200);
      expect(res.body.resources).to.be.an('array');
      expect(res.body.pagination).to.deep.equal({
        next: '/resources?page=5&limit=100',
        first: '/resources?page=1&limit=100',
        last: '/resources?page=11&limit=100',
        previous: '/resources?page=3&limit=100',
        totalPages: 11,
        totalResources: 1015,
      });
    });

    it('AD03 - should successfully build the response for the last page', async () => {
      const res: request.Response = await request(app.getHttpServer())
        .get('/resources?page=11&per_page=200')
        .expect(200);
      expect(res.body.pagination).to.deep.equal({
        next: null,
        first: '/resources?page=1&limit=200',
        last: '/resources?page=6&limit=200',
        previous: null,
        totalPages: 6,
        totalResources: 1015,
      });
    });

    it('AD04 - should successfully build the response with the filter param', async () => {
      const res: request.Response = await request(app.getHttpServer())
        .get('/resources?page=4&limit=100&filter={customerIdentifier: my_id_43524}')
        .expect(200);
      expect(res.body.pagination).to.deep.equal({
        next: '/resources?page=5&limit=100&filter={customerIdentifier: my_id_43524}',
        first: '/resources?page=1&limit=100&filter={customerIdentifier: my_id_43524}',
        last: '/resources?page=11&limit=100&filter={customerIdentifier: my_id_43524}',
        previous: '/resources?page=3&limit=100&filter={customerIdentifier: my_id_43524}',
        totalPages: 11,
        totalResources: 1015,
      });
    });
  });
});
