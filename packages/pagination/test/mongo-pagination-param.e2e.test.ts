import { INestApplication } from '@nestjs/common';
import { expect } from 'chai';
import * as request from 'supertest';
import { createTestAppModule } from './helpers';

describe('E2e tests related to the MongoPagination ParamDecorator', () => {
  let app: INestApplication;

  before(async () => {
    app = await createTestAppModule();
    await app.init();
  });

  after(async () => {
    await app.close();
  });

  describe('Tests with a pagination query', () => {
    it('MPPDE01 - should successfully create the mongoQuery from the request', async () => {
      const res: request.Response = await request(app.getHttpServer())
        .get(
          '/pagination?page=5&per_page=35&sort=%7B%22createdAt%22%3A-1%7D&project=%7B%22id%22%3A1%2C%22applicationId%22%3A1%7D&filter=%7B%22status%22%3A%7B%22%24options%22%3A%22i%22%2C%22%24regex%22%3A%22ACCEPTED%22%7D%7D',
        )
        .expect(200);

      expect(res.body.pagination).to.deep.equal({
        filter: {
          status: {
            $options: 'i',
            $regex: 'ACCEPTED',
          },
        },
        limit: 35,
        skip: 140,
        sort: {
          createdAt: -1,
        },
        project: {
          id: 1,
          applicationId: 1,
        },
      });
    });
  });
});
